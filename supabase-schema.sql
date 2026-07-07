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

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.kryos_profiles to authenticated;
grant select, insert, update, delete on public.kryos_sync_blocks to authenticated;

alter table public.kryos_profiles enable row level security;
alter table public.kryos_sync_blocks enable row level security;

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
