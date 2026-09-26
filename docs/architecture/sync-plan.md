# Sync Plan

Sync is in foundation stage. KRYOS has architecture docs and a Settings readiness surface, but remote sync is not connected yet.

## CEO Rule

No sync until local data is stable.

## Candidate Backend

Supabase Free is the first prototype candidate because it offers:

- free tier
- authentication
- database
- row-level security
- simple browser integration

## Initial Sync Strategy

Start simple:

- one user
- separate Personal and Demo profile records
- block-level JSON sync
- Foundation block
- Career block
- Tasks and habits block
- Journal block
- safe settings metadata

Do not normalize everything at first unless a real need appears.

## Current Decisions

- Sync boundary: `docs/decisions/ADR-0005-sync-boundary.md`
- Backend candidate: `docs/decisions/ADR-0006-free-backend-choice.md`
- Supabase schema: `docs/architecture/supabase-schema.md`
- Sync auth model: `docs/architecture/sync-auth-model.md`
- Conflict behavior: `docs/architecture/sync-conflicts.md`

## Sync Status UI

Settings now shows:

- last synced
- sync enabled or disabled
- current account
- conflict warning if needed
- local readiness checks
- Demo-first safety rule

The Supabase connection button stays disabled until a project URL, anon key, RLS policies, and Demo test plan are ready.

## Risks

- phone and laptop diverge
- conflicts overwrite data
- security secrets leak
- public demo data mixes with personal data

## Required Before Build

- personal/demo separation: done
- backup/restore confidence: done locally, keep validating
- local data audit: in progress
- documented sync schema: done in `0.003.000`
- auth boundary: done in `0.003.000`
- conflict rule: done in `0.003.000`
- rollback plan before enabling sync: required before Personal sync

## Next Build Gate

Do not connect Supabase until:

- a free Supabase project exists
- `kryos_profiles`, `kryos_sync_blocks`, and `kryos_sync_conflicts` are created
- RLS policies are reviewed
- Demo account/profile is created
- Demo can dry-run and then round-trip between laptop and phone
