# Sync Conflict Rules

Status: planned for `0.003.x`.

KRYOS sync must protect trust before convenience. A conflict warning is better than silent data loss.

## Sync Unit

The conflict unit is one block:

- Foundation
- Career
- Tasks and habits
- Journal
- UI state

KRYOS will not try to merge individual nested roadmap items or journal fields in the first prototype.

## Required Metadata

Each local block sync attempt needs:

- `block_key`
- `schema_version`
- `payload`
- `payload_updated_at`
- `client_updated_at`
- last known `remote_updated_at`

## No Silent Overwrite Rule

If both local and remote changed after the last known remote version, KRYOS must create an open conflict and stop writing that block.

The UI can still sync other safe blocks, but it must show a conflict warning in Settings.

## Resolution Choices

First prototype resolution can be simple:

- keep local
- keep remote
- export backup and decide manually

No automatic field-level merge until real usage proves the need.

## Offline Rule

If the app cannot reach Supabase:

- continue local usage
- show sync as stale or unavailable
- do not block Today, Habits, Journal, or Career
- never delete local data because remote is unavailable

## Demo-First Rule

Run conflict tests on Demo data before Personal:

- edit Demo Career on laptop
- edit Demo Career differently on phone
- attempt sync
- confirm conflict is recorded
- confirm neither side is silently overwritten

## Rollback Rule

Before any first Personal sync test:

1. Export Personal backup.
2. Confirm backup imports into a clean browser profile.
3. Run Demo sync test.
4. Only then enable Personal sync.
