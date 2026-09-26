-- Apply only after the 0.6.0 browser app is live. Older cached clients must
-- refresh before editing tasks or career; they cannot bypass revision checks.
begin;
drop policy if exists "kryos_sync_blocks_insert_own" on public.kryos_sync_blocks;
create policy "kryos_sync_blocks_insert_own" on public.kryos_sync_blocks for insert to authenticated
with check (block_key not in ('tasks', 'career') and exists (
  select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()
));
drop policy if exists "kryos_sync_blocks_update_own" on public.kryos_sync_blocks;
create policy "kryos_sync_blocks_update_own" on public.kryos_sync_blocks for update to authenticated
using (block_key not in ('tasks', 'career') and exists (
  select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()
))
with check (block_key not in ('tasks', 'career') and exists (
  select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()
));
drop policy if exists "kryos_sync_blocks_delete_own" on public.kryos_sync_blocks;
create policy "kryos_sync_blocks_delete_own" on public.kryos_sync_blocks for delete to authenticated
using (block_key not in ('tasks', 'career') and exists (
  select 1 from public.kryos_profiles p where p.id = profile_id and p.user_id = auth.uid()
));
commit;
