begin;
create or replace function public.kryos_commit_rewards_v5(p_profile uuid,p_tasks_revision bigint,p_career_revision bigint,p_awards jsonb,p_request jsonb,p_eligible boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare wallet_epoch public.kryos_reward_wallet_epochs%rowtype; a jsonb; old_amount integer; earned integer; spent integer; cost integer; reserved integer:=0; reservation jsonb; reward_title text; previous_status text; saved_reward text; accepted boolean:=false; reason text:=''; today date:=((now() at time zone 'America/Chicago')-interval '7 hours')::date;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_profile::text,0));
 perform 1 from kryos_sync_blocks where profile_id=p_profile and block_key in ('tasks','career') order by block_key for update;
 if not exists(select 1 from kryos_sync_blocks where profile_id=p_profile and block_key='tasks' and revision=p_tasks_revision) or not exists(select 1 from kryos_sync_blocks where profile_id=p_profile and block_key='career' and revision=p_career_revision) then raise exception 'KRYOS_REWARD_SNAPSHOT_CHANGED';end if;
 -- Only the active earning line is replaced. Earlier balances remain recorded.
 for a in select jsonb_build_object('id',event_id,'amount',amount) from kryos_reward_awards where profile_id=p_profile and amount<>0 and event_id not like 'v5-%' and right(event_id,10)>='2026-10-11' and right(event_id,10) ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' loop
  insert into kryos_reward_adjustments(profile_id,event_id,previous_amount,amount) values(p_profile,a->>'id',(a->>'amount')::integer,0);
  update kryos_reward_awards set amount=0,revision=revision+1,updated_at=now() where profile_id=p_profile and event_id=a->>'id';
 end loop;
 for a in select value from jsonb_array_elements(p_awards) loop
  if a->>'id' !~ '^v5-day:[0-9]{4}-[0-9]{2}-[0-9]{2}$' or (a->>'amount')::integer not between 0 and 20 then raise exception 'Invalid V5 award';end if;
  select amount into old_amount from kryos_reward_awards where profile_id=p_profile and event_id=a->>'id';
  if old_amount is distinct from (a->>'amount')::integer then
   insert into kryos_reward_adjustments(profile_id,event_id,previous_amount,amount) values(p_profile,a->>'id',coalesce(old_amount,0),(a->>'amount')::integer);
   insert into kryos_reward_awards(profile_id,event_id,amount,revision) values(p_profile,a->>'id',(a->>'amount')::integer,1) on conflict(profile_id,event_id) do update set amount=excluded.amount,revision=kryos_reward_awards.revision+1,updated_at=now();
  end if;
 end loop;
 for a in select jsonb_build_object('id',event_id,'amount',amount) from kryos_reward_awards where profile_id=p_profile and amount<>0 and event_id like 'v5-%' and not exists(select 1 from jsonb_array_elements(p_awards) n where n->>'id'=event_id) loop
  insert into kryos_reward_adjustments(profile_id,event_id,previous_amount,amount) values(p_profile,a->>'id',(a->>'amount')::integer,0);
  update kryos_reward_awards set amount=0,revision=revision+1,updated_at=now() where profile_id=p_profile and event_id=a->>'id';
 end loop;
 select * into wallet_epoch from kryos_reward_wallet_epochs where profile_id=p_profile order by started_at desc limit 1;
 select coalesce(sum(amount),0) into earned from kryos_reward_awards where profile_id=p_profile and (wallet_epoch.request_id is null or event_id like 'v5-day:%' and right(event_id,10)>=wallet_epoch.earn_from_date::text);
 select coalesce(sum(r.cost),0) into spent from kryos_reward_redemptions r where profile_id=p_profile and status='confirmed' and (wallet_epoch.request_id is null or r.created_at>=wallet_epoch.started_at);
 if p_request is not null then
  select status,reward_id into previous_status,saved_reward from kryos_reward_redemptions where profile_id=p_profile and request_id=p_request->>'id';
  if previous_status is not null then
   if saved_reward<>p_request->>'rewardId' then raise exception 'Request ID reused for another reward';end if;
   accepted:=previous_status='confirmed';
  else
   cost:=case p_request->>'rewardId' when 'bounded-video' then 5 when 'friend-call' then 25 when 'movie' then 90 when 'initiated-call' then 100 else null end;
   if cost is null then raise exception 'Unknown reward';end if;
   reward_title:=case p_request->>'rewardId' when 'bounded-video' then 'Chosen videos or news' when 'friend-call' then 'Intentional friend call' when 'movie' then 'Movie night' else 'Your intentional personal call' end;
   select payload#>'{life,rewardV5,reservation}' into reservation from kryos_sync_blocks where profile_id=p_profile and block_key='tasks';
   if reservation->>'rewardId' is distinct from p_request->>'rewardId' then reserved:=greatest(0,least(greatest(0,earned-spent),coalesce((reservation->>'amount')::integer,0)));end if;
   accepted:=p_eligible and earned-spent-reserved>=cost and not exists(select 1 from kryos_reward_redemptions r where r.profile_id=p_profile and r.reward_id=p_request->>'rewardId' and r.status='confirmed' and r.requested_on>today-(case p_request->>'rewardId' when 'bounded-video' then 3 when 'friend-call' then 5 when 'movie' then 7 when 'initiated-call' then 9 end));
   reason:=case when not p_eligible then 'Recent evidence requirements are incomplete.' when earned-spent-reserved<cost then 'Not enough unreserved confirmed points.' when not accepted then 'This reward is still in its cooldown.' else '' end;
   insert into kryos_reward_redemptions(profile_id,request_id,reward_id,title,cost,status,requested_on) values(p_profile,p_request->>'id',p_request->>'rewardId',reward_title,cost,case when accepted then 'confirmed' else 'rejected' end,today);
   if accepted then spent:=spent+cost;end if;
  end if;
 end if;
 return jsonb_build_object('walletReset',case when wallet_epoch.request_id is null then null else jsonb_build_object('id',wallet_epoch.request_id,'earnFromDate',wallet_epoch.earn_from_date,'createdAt',wallet_epoch.started_at,'previousBalance',wallet_epoch.previous_balance) end,'balance',greatest(0,earned-spent),'adjustmentDue',greatest(0,spent-earned),'earned',earned,'spent',spent,'accepted',accepted,'reason',reason,'redemptions',coalesce((select jsonb_agg(jsonb_build_object('id',request_id,'rewardId',reward_id,'title',title,'cost',r.cost,'date',requested_on,'status',status,'createdAt',created_at)) from kryos_reward_redemptions r where profile_id=p_profile),'[]'::jsonb));
end $$;
revoke all on function public.kryos_commit_rewards_v5(uuid,bigint,bigint,jsonb,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.kryos_commit_rewards_v5(uuid,bigint,bigint,jsonb,jsonb,boolean) to service_role;
create or replace function public.kryos_reset_reward_wallet(p_profile uuid,p_request_id text,p_earn_from_date date)
returns jsonb language plpgsql security definer set search_path=public as $$
declare previous_epoch public.kryos_reward_wallet_epochs%rowtype; epoch public.kryos_reward_wallet_epochs%rowtype; earned integer; spent integer; task_payload jsonb; today date:=((now() at time zone 'America/Chicago')-interval '7 hours')::date;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_profile::text,0));
 if p_request_id !~ '^[A-Za-z0-9_-]{1,100}$' then raise exception 'Invalid reset request';end if;
 select * into epoch from kryos_reward_wallet_epochs where profile_id=p_profile and request_id=p_request_id;
 if epoch.request_id is not null then
  if epoch.earn_from_date<>p_earn_from_date then raise exception 'Reset request reused with another date';end if;
  return jsonb_build_object('accepted',true,'duplicate',true,'walletReset',jsonb_build_object('id',epoch.request_id,'earnFromDate',epoch.earn_from_date,'createdAt',epoch.started_at,'previousBalance',epoch.previous_balance),'earnFromDate',epoch.earn_from_date,'balance',0);
 end if;
 if p_earn_from_date not in(today,today+1) then raise exception 'Reset must start today or next operating day';end if;
 select payload into task_payload from kryos_sync_blocks where profile_id=p_profile and block_key='tasks' for update;
 if task_payload is null then raise exception 'Tasks profile is unavailable';end if;
 select * into previous_epoch from kryos_reward_wallet_epochs where profile_id=p_profile order by started_at desc limit 1;
 select coalesce(sum(amount),0) into earned from kryos_reward_awards where profile_id=p_profile and (previous_epoch.request_id is null or event_id like 'v5-day:%' and right(event_id,10)>=previous_epoch.earn_from_date::text);
 select coalesce(sum(cost),0) into spent from kryos_reward_redemptions where profile_id=p_profile and status='confirmed' and (previous_epoch.request_id is null or created_at>=previous_epoch.started_at);
 insert into kryos_reward_wallet_epochs(profile_id,request_id,earn_from_date,previous_earned,previous_spent,previous_balance) values(p_profile,p_request_id,p_earn_from_date,earned,spent,greatest(0,earned-spent)) returning * into epoch;
 task_payload:=jsonb_set(task_payload,'{life}',coalesce(task_payload->'life','{}'::jsonb),true);
 task_payload:=jsonb_set(task_payload,'{life,rewardV5}',coalesce(task_payload#>'{life,rewardV5}','{}'::jsonb),true);
 task_payload:=jsonb_set(task_payload,'{life,rewardV5,reset}',jsonb_build_object('id',epoch.request_id,'earnFromDate',epoch.earn_from_date,'createdAt',epoch.started_at,'previousBalance',epoch.previous_balance),true);
 task_payload:=jsonb_set(task_payload,'{life,rewardV5,reservation}',jsonb_build_object('rewardId','initiated-call','amount',0),true);
 task_payload:=jsonb_set(task_payload,'{life,rewardV5,pendingRedemption}','null'::jsonb,true);
 task_payload:=jsonb_set(task_payload,'{life,rewardCloudBalance}','0'::jsonb,true);
 update kryos_sync_blocks set payload=task_payload,revision=revision+1,payload_updated_at=clock_timestamp(),updated_at=clock_timestamp() where profile_id=p_profile and block_key='tasks';
 return jsonb_build_object('accepted',true,'walletReset',jsonb_build_object('id',epoch.request_id,'earnFromDate',epoch.earn_from_date,'createdAt',epoch.started_at,'previousBalance',epoch.previous_balance),'balance',0,'previousBalance',epoch.previous_balance,'earnFromDate',epoch.earn_from_date,'resetId',epoch.request_id);
end $$;
revoke all on function public.kryos_reset_reward_wallet(uuid,text,date) from public,anon,authenticated;
grant execute on function public.kryos_reset_reward_wallet(uuid,text,date) to service_role;

commit;
