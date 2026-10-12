begin;
create table if not exists public.kryos_marketing_stats_receipts(profile_id uuid not null references public.kryos_profiles(id),request_id text not null,fingerprint text not null,receipt jsonb not null,primary key(profile_id,request_id));
alter table public.kryos_marketing_stats_receipts enable row level security;
create or replace function public.kryos_import_marketing_stats(p_profile uuid,p_request_id text,p_summary jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare b kryos_sync_blocks; old jsonb; rows jsonb; digest_value text; found_receipt kryos_marketing_stats_receipts; result jsonb; day date; current_day date:=((now() at time zone 'America/Chicago')-interval '7 hours')::date;
begin
 if not exists(select 1 from kryos_profiles where id=p_profile and profile_type='personal') then raise exception 'Personal profile unavailable'; end if;
 if p_request_id !~ '^[a-zA-Z0-9:_-]{1,160}$' or jsonb_typeof(p_summary)<>'object' or exists(select 1 from jsonb_object_keys(p_summary) k where k not in ('date','workspaceId','revision','submittedCount')) then raise exception 'Stats-only snapshot required'; end if;
 if not(p_summary ?& array['date','workspaceId','revision','submittedCount']) or p_summary->>'date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or p_summary->>'revision' !~ '^[0-9]+$' or jsonb_typeof(p_summary->'submittedCount')<>'number' or jsonb_typeof(p_summary->'revision')<>'number' then raise exception 'Required numeric stats missing';end if;
 day:=(p_summary->>'date')::date;
 if day>current_day or p_summary->>'workspaceId'<>'marketing-onedrive' or (p_summary->>'revision')::bigint<0 or (p_summary->>'submittedCount')::integer not between 0 and 10000 or p_summary->>'submittedCount' !~ '^[0-9]+$' then raise exception 'Invalid dated summary'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_profile::text,0));
 digest_value:=encode(extensions.digest(p_summary::text,'sha256'),'hex');
 select * into found_receipt from kryos_marketing_stats_receipts where profile_id=p_profile and request_id=p_request_id;
 if found then if found_receipt.fingerprint<>digest_value then raise exception 'Idempotency key mismatch'; end if;return found_receipt.receipt||jsonb_build_object('duplicate',true);end if;
 select * into b from kryos_sync_blocks where profile_id=p_profile and block_key='tasks' for update;
 if not found then raise exception 'Sync Personal app records first';end if;
 rows:=coalesce(b.payload#>'{life,marketingSummaries}','[]'::jsonb);
 select value into old from jsonb_array_elements(rows) where value->>'date'=p_summary->>'date' and value->>'workspaceId'=p_summary->>'workspaceId';
 if old is not null and ((old->>'revision')::bigint>(p_summary->>'revision')::bigint or old->>'revision'=p_summary->>'revision' and old->>'submittedCount'<>p_summary->>'submittedCount') then raise exception 'Stale or conflicting source revision';end if;
 select coalesce(jsonb_agg(value),'[]'::jsonb) into rows from jsonb_array_elements(rows) where not(value->>'date'=p_summary->>'date' and value->>'workspaceId'=p_summary->>'workspaceId');
 rows:=rows||jsonb_build_array(p_summary||jsonb_build_object('receivedAt',now()));
 b.payload:=jsonb_set(b.payload,'{life}',coalesce(b.payload->'life','{}'::jsonb)||jsonb_build_object('marketingSummaries',rows));
 b.payload:=jsonb_set(b.payload,'{meta}',coalesce(b.payload->'meta','{}'::jsonb)||jsonb_build_object('updatedAt',now()));
 update kryos_sync_blocks set payload=b.payload,revision=revision+1,updated_at=now(),payload_updated_at=now() where id=b.id returning revision into b.revision;
 result:=jsonb_build_object('accepted',true,'date',p_summary->>'date','submittedCount',(p_summary->>'submittedCount')::integer,'revision',b.revision,'statsOnly',true);
 insert into kryos_marketing_stats_receipts values(p_profile,p_request_id,digest_value,result);
 return result;
end $$;
revoke all on function public.kryos_import_marketing_stats(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.kryos_import_marketing_stats(uuid,text,jsonb) to service_role;
commit;
