# Sync Plan

Sync is planned but intentionally deferred.

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

## Sync Status UI

Future Settings should show:

- last synced
- sync enabled or disabled
- current account
- conflict warning if needed

## Risks

- phone and laptop diverge
- conflicts overwrite data
- security secrets leak
- public demo data mixes with personal data

## Required Before Build

- personal/demo separation
- backup/restore confidence
- local data audit
- documented sync schema
- rollback plan before enabling sync
