create table if not exists public.hr_contacts (
  owner uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  revision integer not null default 1 check (revision > 0),
  payload jsonb not null check (
    jsonb_typeof(payload) = 'object'
    and payload - array['name','company','role','email','phone','linkedin','note','next','due','archived','deleted','events'] = '{}'::jsonb
  ),
  primary key (owner, id)
);
alter table public.hr_contacts enable row level security;
revoke all on public.hr_contacts from public, anon, authenticated;
grant select, insert, update on public.hr_contacts to authenticated;
create policy hr_contacts_select on public.hr_contacts for select to authenticated using ((select auth.uid()) = owner);
create policy hr_contacts_insert on public.hr_contacts for insert to authenticated with check ((select auth.uid()) = owner);
create policy hr_contacts_update on public.hr_contacts for update to authenticated using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);
