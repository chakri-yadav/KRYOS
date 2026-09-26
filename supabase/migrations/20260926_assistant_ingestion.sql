-- Apply after supabase-schema.sql. Existing block payloads are preserved.
create extension if not exists pgcrypto;

alter table public.kryos_sync_blocks
  add column if not exists revision bigint not null default 0;

create table if not exists public.kryos_assistant_credentials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  token_hash text not null unique,
  name text not null default 'KRYOS assistant',
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  last_used_at timestamptz
);

create table if not exists public.kryos_assistant_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  idempotency_key text not null,
  request_hash text not null,
  local_date date not null,
  timezone text not null,
  raw_text text not null,
  receipt jsonb,
  created_at timestamptz not null default now(),
  unique(profile_id, idempotency_key)
);

create table if not exists public.kryos_assistant_events (
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  event_id text not null,
  request_id uuid not null references public.kryos_assistant_requests(id) on delete cascade,
  event_type text not null,
  local_date date not null,
  evidence_quote text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key(profile_id, event_id)
);

create table if not exists public.kryos_change_log (
  cursor bigint generated always as identity primary key,
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  request_id uuid references public.kryos_assistant_requests(id) on delete cascade,
  block_keys text[] not null,
  created_at timestamptz not null default now()
);

create index if not exists kryos_assistant_requests_profile_idx on public.kryos_assistant_requests(profile_id, created_at desc);
create index if not exists kryos_change_log_profile_idx on public.kryos_change_log(profile_id, cursor);

alter table public.kryos_assistant_credentials enable row level security;
alter table public.kryos_assistant_requests enable row level security;
alter table public.kryos_assistant_events enable row level security;
alter table public.kryos_change_log enable row level security;

revoke all on public.kryos_assistant_credentials from anon, authenticated;
revoke all on public.kryos_assistant_requests from anon, authenticated;
revoke all on public.kryos_assistant_events from anon, authenticated;
revoke all on public.kryos_change_log from anon, authenticated;
grant select on public.kryos_assistant_requests, public.kryos_assistant_events, public.kryos_change_log to authenticated;

create policy kryos_assistant_requests_owner on public.kryos_assistant_requests
  for select to authenticated using (exists (
    select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()
  ));
create policy kryos_assistant_events_owner on public.kryos_assistant_events
  for select to authenticated using (exists (
    select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()
  ));
create policy kryos_change_log_owner on public.kryos_change_log
  for select to authenticated using (exists (
    select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()
  ));

create or replace function public.kryos_issue_assistant_token(p_profile uuid)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_token text;
begin
  if auth.uid() is null or not exists (
    select 1 from public.kryos_profiles where id = p_profile and user_id = auth.uid() and profile_type = 'personal'
  ) then raise exception 'permission denied'; end if;
  v_token := 'kryos_' || translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');
  insert into public.kryos_assistant_credentials(profile_id, token_hash)
  values (p_profile, encode(digest(v_token, 'sha256'), 'hex'));
  return v_token;
end $$;
revoke all on function public.kryos_issue_assistant_token(uuid) from public, anon;
grant execute on function public.kryos_issue_assistant_token(uuid) to authenticated;

create or replace function public.kryos_revoke_assistant_tokens(p_profile uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if auth.uid() is null or not exists (
    select 1 from public.kryos_profiles where id = p_profile and user_id = auth.uid()
  ) then raise exception 'permission denied'; end if;
  update public.kryos_assistant_credentials set revoked_at = now()
  where profile_id = p_profile and revoked_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end $$;
revoke all on function public.kryos_revoke_assistant_tokens(uuid) from public, anon;
grant execute on function public.kryos_revoke_assistant_tokens(uuid) to authenticated;

-- Browser writes use compare-and-swap so an older device cannot erase an assistant update.
create or replace function public.kryos_write_sync_block(
  p_profile uuid, p_block_key text, p_payload jsonb, p_schema_version integer,
  p_payload_updated_at timestamptz, p_expected_revision bigint
) returns bigint language plpgsql security definer set search_path = public as $$
declare v_revision bigint;
begin
  if auth.uid() is null or not exists (
    select 1 from public.kryos_profiles where id = p_profile and user_id = auth.uid()
  ) then raise exception 'permission denied'; end if;
  if p_block_key not in ('tasks', 'career') or p_expected_revision < 0 or p_payload is null then
    raise exception 'invalid block write';
  end if;
  if p_expected_revision > 0 and not exists (
    select 1 from public.kryos_sync_blocks where profile_id = p_profile and block_key = p_block_key
  ) then raise exception 'KRYOS_CONFLICT'; end if;
  insert into public.kryos_sync_blocks(profile_id, block_key, payload, schema_version, payload_updated_at, client_updated_at, updated_at, revision)
  values (p_profile, p_block_key, p_payload, p_schema_version, p_payload_updated_at, now(), now(), 1)
  on conflict(profile_id, block_key) do update set
    payload = excluded.payload,
    schema_version = excluded.schema_version,
    payload_updated_at = excluded.payload_updated_at,
    client_updated_at = now(),
    updated_at = now(),
    revision = public.kryos_sync_blocks.revision + 1
  where public.kryos_sync_blocks.revision = p_expected_revision
  returning revision into v_revision;
  if v_revision is null then raise exception 'KRYOS_CONFLICT'; end if;
  return v_revision;
end $$;
revoke all on function public.kryos_write_sync_block(uuid,text,jsonb,integer,timestamptz,bigint) from public, anon;
grant execute on function public.kryos_write_sync_block(uuid,text,jsonb,integer,timestamptz,bigint) to authenticated;

-- Edge Function projects a validated request against exact revisions. This function
-- commits the request, events, both affected blocks, and receipt together.
create or replace function public.kryos_apply_assistant_request(
  p_profile uuid, p_idempotency_key text, p_request_hash text, p_local_date date,
  p_timezone text, p_raw_text text, p_events jsonb, p_effects jsonb,
  p_tasks jsonb, p_career jsonb, p_tasks_revision bigint, p_career_revision bigint
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_request uuid;
  v_existing record;
  v_tasks_revision bigint;
  v_career_revision bigint;
  v_cursor bigint;
  v_event jsonb;
  v_keys text[] := array[]::text[];
  v_receipt jsonb;
begin
  if auth.role() <> 'service_role' then raise exception 'permission denied'; end if;
  if not exists (select 1 from public.kryos_profiles where id = p_profile and profile_type = 'personal') then
    raise exception 'personal profile not found';
  end if;
  if length(p_idempotency_key) < 1 or length(p_idempotency_key) > 160 or jsonb_typeof(p_events) <> 'array' then
    raise exception 'invalid request';
  end if;
  perform 1 from public.kryos_profiles where id = p_profile for update;
  select request_hash, receipt into v_existing from public.kryos_assistant_requests
  where profile_id = p_profile and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.request_hash <> p_request_hash then raise exception 'IDEMPOTENCY_MISMATCH'; end if;
    return v_existing.receipt || jsonb_build_object('duplicate', true);
  end if;
  if p_tasks is not null then
    update public.kryos_sync_blocks set payload = p_tasks, payload_updated_at = now(),
      updated_at = now(), revision = revision + 1
    where profile_id = p_profile and block_key = 'tasks' and revision = p_tasks_revision
    returning revision into v_tasks_revision;
    if v_tasks_revision is null then raise exception 'KRYOS_CONFLICT'; end if;
    v_keys := array_append(v_keys, 'tasks');
  end if;
  if p_career is not null then
    update public.kryos_sync_blocks set payload = p_career, payload_updated_at = now(),
      updated_at = now(), revision = revision + 1
    where profile_id = p_profile and block_key = 'career' and revision = p_career_revision
    returning revision into v_career_revision;
    if v_career_revision is null then raise exception 'KRYOS_CONFLICT'; end if;
    v_keys := array_append(v_keys, 'career');
  end if;
  insert into public.kryos_assistant_requests(profile_id, idempotency_key, request_hash, local_date, timezone, raw_text)
  values (p_profile, p_idempotency_key, p_request_hash, p_local_date, p_timezone, p_raw_text)
  returning id into v_request;
  for v_event in select value from jsonb_array_elements(p_events) loop
    insert into public.kryos_assistant_events(profile_id, event_id, request_id, event_type, local_date, evidence_quote, payload)
    values (p_profile, v_event->>'id', v_request, v_event->>'type', p_local_date, v_event->>'evidence_quote', v_event->'payload');
  end loop;
  insert into public.kryos_change_log(profile_id, request_id, block_keys)
  values (p_profile, v_request, v_keys) returning cursor into v_cursor;
  v_receipt := jsonb_build_object('request_id', v_request, 'status', 'accepted',
    'local_date', p_local_date, 'change_cursor', v_cursor, 'effects', p_effects,
    'tasks_revision', v_tasks_revision, 'career_revision', v_career_revision, 'duplicate', false);
  update public.kryos_assistant_requests set receipt = v_receipt where id = v_request;
  return v_receipt;
end $$;
revoke all on function public.kryos_apply_assistant_request(uuid,text,text,date,text,text,jsonb,jsonb,jsonb,jsonb,bigint,bigint) from public, anon, authenticated;
grant execute on function public.kryos_apply_assistant_request(uuid,text,text,date,text,text,jsonb,jsonb,jsonb,jsonb,bigint,bigint) to service_role;
