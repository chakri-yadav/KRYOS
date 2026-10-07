begin;

-- Marketing posting/application records join the existing profile-scoped block store.
alter table public.kryos_sync_blocks
  drop constraint if exists kryos_sync_blocks_block_key_check;
alter table public.kryos_sync_blocks
  add constraint kryos_sync_blocks_block_key_check
  check (block_key in ('foundation', 'career', 'tasks', 'journal', 'marketing', 'security', 'ui_state'));

-- Marketing edits use the same compare-and-swap contract as Tasks and Career.
create or replace function public.kryos_write_sync_block(
  p_profile uuid, p_block_key text, p_payload jsonb, p_schema_version integer,
  p_payload_updated_at timestamptz, p_expected_revision bigint
) returns bigint language plpgsql security definer set search_path = public as $$
declare v_revision bigint;
begin
  if auth.uid() is null or not exists (
    select 1 from public.kryos_profiles where id = p_profile and user_id = auth.uid()
  ) then raise exception 'permission denied'; end if;
  if p_block_key not in ('tasks', 'career', 'marketing') or p_expected_revision < 0 or p_payload is null then
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

-- A single idempotent transaction applies an assistant-imported batch, its audit event,
-- the Marketing sync block revision, and the accepted receipt.
create or replace function public.kryos_import_marketing_batch(
  p_profile uuid, p_idempotency_key text, p_request_hash text, p_local_date date,
  p_timezone text, p_raw_text text, p_event jsonb, p_effects jsonb,
  p_marketing jsonb, p_expected_revision bigint, p_imported_count integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_request uuid;
  v_existing record;
  v_revision bigint;
  v_current_revision bigint;
  v_cursor bigint;
  v_receipt jsonb;
begin
  if auth.role() <> 'service_role' then raise exception 'permission denied'; end if;
  if not exists (select 1 from public.kryos_profiles where id = p_profile and profile_type = 'personal') then
    raise exception 'personal profile not found';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) < 1 or length(p_idempotency_key) > 160
    or p_request_hash is null or length(p_request_hash) <> 64
    or p_raw_text is null or length(p_raw_text) > 100000
    or jsonb_typeof(p_event) <> 'object' or jsonb_typeof(p_effects) <> 'array'
    or jsonb_typeof(p_marketing) <> 'object' or jsonb_typeof(p_marketing->'batches') <> 'array'
    or p_expected_revision < 0 or p_imported_count < 1 or p_imported_count > 500
    or octet_length(p_marketing::text) > 115000 then
    raise exception 'invalid Marketing import';
  end if;
  if p_event->>'type' <> 'marketing.batch.import'
    or jsonb_array_length(p_marketing->'batches') < 1
    or jsonb_typeof(p_marketing->'batches'->0->'roles') <> 'array'
    or jsonb_array_length(p_marketing->'batches'->0->'roles') <> p_imported_count
    or (p_marketing->'batches'->0->>'id') is distinct from (p_event->'payload'->'batch'->>'id') then
    raise exception 'invalid Marketing batch projection';
  end if;

  perform 1 from public.kryos_profiles where id = p_profile for update;
  select id, request_hash, receipt into v_existing from public.kryos_assistant_requests
  where profile_id = p_profile and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.request_hash <> p_request_hash then raise exception 'IDEMPOTENCY_MISMATCH'; end if;
    return v_existing.receipt || jsonb_build_object('duplicate', true);
  end if;

  select revision into v_current_revision from public.kryos_sync_blocks
  where profile_id = p_profile and block_key = 'marketing' for update;
  if not found and p_expected_revision <> 0 then raise exception 'KRYOS_CONFLICT'; end if;
  if found and v_current_revision <> p_expected_revision then raise exception 'KRYOS_CONFLICT'; end if;

  insert into public.kryos_sync_blocks(profile_id, block_key, schema_version, payload, payload_updated_at, client_updated_at, updated_at, revision)
  values (p_profile, 'marketing', 1, p_marketing, now(), now(), now(), 1)
  on conflict(profile_id, block_key) do update set
    schema_version = excluded.schema_version,
    payload = excluded.payload,
    payload_updated_at = now(),
    client_updated_at = now(),
    updated_at = now(),
    revision = public.kryos_sync_blocks.revision + 1
  where public.kryos_sync_blocks.revision = p_expected_revision
  returning revision into v_revision;
  if v_revision is null then raise exception 'KRYOS_CONFLICT'; end if;

  insert into public.kryos_assistant_requests(profile_id, idempotency_key, request_hash, local_date, timezone, raw_text)
  values (p_profile, p_idempotency_key, p_request_hash, p_local_date, p_timezone, p_raw_text)
  returning id into v_request;
  insert into public.kryos_assistant_events(profile_id, event_id, request_id, event_type, local_date, evidence_quote, payload)
  values (p_profile, p_event->>'id', v_request, p_event->>'type', p_local_date,
    p_event->>'evidence_quote', p_event->'payload');
  insert into public.kryos_change_log(profile_id, request_id, block_keys)
  values (p_profile, v_request, array['marketing']) returning cursor into v_cursor;

  v_receipt := jsonb_build_object('request_id', v_request, 'status', 'accepted',
    'local_date', p_local_date, 'change_cursor', v_cursor, 'effects', p_effects,
    'marketing_revision', v_revision, 'imported_count', p_imported_count,
    'block_keys', jsonb_build_array('marketing'), 'duplicate', false);
  update public.kryos_assistant_requests set receipt = v_receipt where id = v_request;
  return v_receipt;
end $$;
revoke all on function public.kryos_import_marketing_batch(uuid,text,text,date,text,text,jsonb,jsonb,jsonb,bigint,integer) from public, anon, authenticated;
grant execute on function public.kryos_import_marketing_batch(uuid,text,text,date,text,text,jsonb,jsonb,jsonb,bigint,integer) to service_role;

commit;
