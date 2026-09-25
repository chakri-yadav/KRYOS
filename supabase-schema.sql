create extension if not exists pgcrypto;

create table if not exists public.kryos_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_type text not null check (profile_type in ('personal', 'demo')),
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, profile_type)
);

create table if not exists public.kryos_sync_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  block_key text not null check (block_key in ('foundation', 'career', 'tasks', 'journal', 'security', 'ui_state')),
  schema_version integer not null default 1,
  payload jsonb not null,
  payload_updated_at timestamptz,
  client_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, block_key)
);

create index if not exists kryos_profiles_user_id_idx on public.kryos_profiles(user_id);
create index if not exists kryos_sync_blocks_profile_id_idx on public.kryos_sync_blocks(profile_id);

create table if not exists public.kryos_reward_awards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  event_id text not null,
  amount integer not null check (amount >= 0 and amount <= 20),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, event_id)
);

create table if not exists public.kryos_reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  request_id text not null,
  reward_id text not null,
  title text not null,
  cost integer not null check (cost > 0),
  status text not null check (status in ('confirmed', 'rejected')),
  requested_on date not null,
  created_at timestamptz not null default now(),
  unique (profile_id, request_id)
);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.kryos_profiles to authenticated;
grant select, insert, update, delete on public.kryos_sync_blocks to authenticated;
grant select on public.kryos_reward_awards to authenticated;
grant select on public.kryos_reward_redemptions to authenticated;

alter table public.kryos_profiles enable row level security;
alter table public.kryos_sync_blocks enable row level security;
alter table public.kryos_reward_awards enable row level security;
alter table public.kryos_reward_redemptions enable row level security;

-- Live cross-device freshness for the block store. Safe to rerun.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'kryos_sync_blocks'
  ) then
    alter publication supabase_realtime add table public.kryos_sync_blocks;
  end if;
exception
  when undefined_object then
    raise notice 'supabase_realtime publication is unavailable; KRYOS will use its five-second foreground fallback.';
end $$;

drop policy if exists "kryos_reward_awards_select_own" on public.kryos_reward_awards;
create policy "kryos_reward_awards_select_own" on public.kryos_reward_awards for select to authenticated
using (exists (select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "kryos_reward_redemptions_select_own" on public.kryos_reward_redemptions;
create policy "kryos_reward_redemptions_select_own" on public.kryos_reward_redemptions for select to authenticated
using (exists (select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "kryos_profiles_select_own" on public.kryos_profiles;
drop policy if exists "kryos_profiles_insert_own" on public.kryos_profiles;
drop policy if exists "kryos_profiles_update_own" on public.kryos_profiles;
drop policy if exists "kryos_profiles_delete_own" on public.kryos_profiles;

create policy "kryos_profiles_select_own"
on public.kryos_profiles for select
to authenticated
using (user_id = auth.uid());

create policy "kryos_profiles_insert_own"
on public.kryos_profiles for insert
to authenticated
with check (user_id = auth.uid());

create policy "kryos_profiles_update_own"
on public.kryos_profiles for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "kryos_profiles_delete_own"
on public.kryos_profiles for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "kryos_sync_blocks_select_own" on public.kryos_sync_blocks;
drop policy if exists "kryos_sync_blocks_insert_own" on public.kryos_sync_blocks;
drop policy if exists "kryos_sync_blocks_update_own" on public.kryos_sync_blocks;
drop policy if exists "kryos_sync_blocks_delete_own" on public.kryos_sync_blocks;

create policy "kryos_sync_blocks_select_own"
on public.kryos_sync_blocks for select
to authenticated
using (
  exists (
    select 1
    from public.kryos_profiles p
    where p.id = kryos_sync_blocks.profile_id
      and p.user_id = auth.uid()
  )
);

create policy "kryos_sync_blocks_insert_own"
on public.kryos_sync_blocks for insert
to authenticated
with check (
  exists (
    select 1
    from public.kryos_profiles p
    where p.id = kryos_sync_blocks.profile_id
      and p.user_id = auth.uid()
  )
);

create policy "kryos_sync_blocks_update_own"
on public.kryos_sync_blocks for update
to authenticated
using (
  exists (
    select 1
    from public.kryos_profiles p
    where p.id = kryos_sync_blocks.profile_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.kryos_profiles p
    where p.id = kryos_sync_blocks.profile_id
      and p.user_id = auth.uid()
  )
);

create policy "kryos_sync_blocks_delete_own"
on public.kryos_sync_blocks for delete
to authenticated
using (
  exists (
    select 1
    from public.kryos_profiles p
    where p.id = kryos_sync_blocks.profile_id
      and p.user_id = auth.uid()
  )
);

create or replace function public.kryos_reward_transaction(p_profile uuid, p_awards jsonb, p_request jsonb default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  award jsonb;
  existing_status text;
  earned integer;
  spent integer;
  accepted boolean := false;
begin
  if not exists (select 1 from public.kryos_profiles where id = p_profile and user_id = auth.uid()) then
    raise exception 'permission denied';
  end if;

  -- Serialize one profile's ledger so simultaneous redemption requests cannot overspend it.
  perform pg_advisory_xact_lock(hashtextextended(p_profile::text, 0));

  for award in select value from jsonb_array_elements(coalesce(p_awards, '[]'::jsonb)) loop
    insert into public.kryos_reward_awards(profile_id, event_id, amount, revision, updated_at)
    values (p_profile, award->>'id', greatest(0, (award->>'amount')::integer), greatest(1, (award->>'revision')::integer), now())
    on conflict(profile_id, event_id) do update set
      amount = excluded.amount,
      revision = excluded.revision,
      updated_at = now()
    where excluded.revision >= public.kryos_reward_awards.revision;
  end loop;

  select coalesce(sum(amount),0) into earned from public.kryos_reward_awards where profile_id = p_profile;
  select coalesce(sum(cost),0) into spent from public.kryos_reward_redemptions where profile_id = p_profile and status = 'confirmed';

  if p_request is not null then
    select status into existing_status from public.kryos_reward_redemptions
    where profile_id = p_profile and request_id = p_request->>'id';
    if existing_status is null then
      accepted := earned - spent >= (p_request->>'cost')::integer;
      insert into public.kryos_reward_redemptions(profile_id, request_id, reward_id, title, cost, status, requested_on)
      values (p_profile, p_request->>'id', p_request->>'rewardId', left(p_request->>'title',200), (p_request->>'cost')::integer,
        case when accepted then 'confirmed' else 'rejected' end, (p_request->>'date')::date);
      if accepted then spent := spent + (p_request->>'cost')::integer; end if;
    else
      accepted := existing_status = 'confirmed';
    end if;
  end if;

  return jsonb_build_object('balance', greatest(0, earned-spent), 'accepted', accepted);
end;
$$;

revoke all on function public.kryos_reward_transaction(uuid,jsonb,jsonb) from public;
grant execute on function public.kryos_reward_transaction(uuid,jsonb,jsonb) to authenticated;
