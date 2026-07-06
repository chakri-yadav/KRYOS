# Supabase Sync Schema

Status: planned for `0.003.x`.

This schema is the first free-backend foundation for KRYOS. It is deliberately block-level JSON, not a fully normalized product database. The goal is laptop/phone continuity for one owner without exploding complexity before the product behavior is stable.

## Scope

Sync these blocks first:

- Foundation
- Career
- Tasks and habits
- Journal
- UI state metadata

Do not sync these in `0.003.x`:

- local PIN hash
- recovery answers
- active lock sessions
- local sync metadata
- browser-only privacy preferences that could weaken another device

## Tables

```sql
create table public.kryos_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_type text not null check (profile_type in ('personal', 'demo')),
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, profile_type)
);

create table public.kryos_sync_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  block_key text not null check (block_key in ('foundation', 'career', 'tasks', 'journal', 'ui_state')),
  schema_version integer not null default 1,
  payload jsonb not null,
  payload_updated_at timestamptz,
  client_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, block_key)
);

create table public.kryos_sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.kryos_profiles(id) on delete cascade,
  block_key text not null,
  local_payload jsonb not null,
  remote_payload jsonb not null,
  local_updated_at timestamptz,
  remote_updated_at timestamptz,
  status text not null default 'open' check (status in ('open', 'resolved_local', 'resolved_remote', 'resolved_manual')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
```

## Indexes

```sql
create index kryos_profiles_user_id_idx on public.kryos_profiles(user_id);
create index kryos_sync_blocks_profile_id_idx on public.kryos_sync_blocks(profile_id);
create index kryos_sync_conflicts_profile_id_status_idx on public.kryos_sync_conflicts(profile_id, status);
```

## Row-Level Security Shape

Enable RLS on every table. Policies must only allow the authenticated owner to read/write their own records.

```sql
alter table public.kryos_profiles enable row level security;
alter table public.kryos_sync_blocks enable row level security;
alter table public.kryos_sync_conflicts enable row level security;
```

Policy rule shape:

- profile rows: `user_id = auth.uid()`
- sync block rows: profile belongs to `auth.uid()`
- conflict rows: profile belongs to `auth.uid()`

## First Migration Rule

Create Demo profile first and write only Demo blocks. Personal sync is blocked until Demo can round-trip on laptop and phone without data loss.

## Version Rule

Every synced block carries:

- `schema_version`
- `payload_updated_at`
- `client_updated_at`

If the local schema version is newer than the remote schema version, sync must stop and ask for an app update or migration.
