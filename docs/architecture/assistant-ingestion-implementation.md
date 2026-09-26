# Assistant ingestion: implementation and rollout

This build adds a direct assistant-to-Supabase write path for a Personal KRYOS profile. It does not use the local screen PIN as cloud authentication.

## Delivered code

- `supabase/migrations/20260926_assistant_ingestion.sql` adds revision-checked block writes, assistant credentials, idempotent request receipts, immutable event evidence, and a change log. The migration preserves existing data. A separate cutover migration restricts legacy direct writes only after the new browser version is live.
- `supabase/functions/kryos-ingest/` validates typed operations, maps them to existing KRYOS task and career data, and calls one atomic database transaction.
- `scripts/kryos-ingest.mjs` is a private command-line connector. On this Windows workspace, `scripts/kryos-assistant-access.ps1` decrypts a local DPAPI token and supplies it only to that process. Request JSON and the encrypted token stay under ignored `.private/`.
- Settings can issue a one-time assistant token and revoke all current assistant tokens.
- Task and Career browser saves use revision-checked RPC calls. A stale device receives a conflict instead of overwriting a newer assistant update.
- Existing block Realtime subscriptions and foreground refresh carry accepted assistant changes to other open clients.

## Supported operations

| Command | Effect |
| --- | --- |
| `journal.capture` | Adds a dated entry to Inner Command Journal |
| `rhythm.measure` | Sets the reported water total in litres |
| `rhythm.complete` / `rhythm.reopen` | Sets or clears an existing binary Rhythm habit |
| `action.create` | Creates an Action Vault item |
| `action.complete` / `action.reopen` | Changes an exact existing Action ID |
| `career.progress` | Adds an evidence-backed completed Career activity record |
| `career.check.complete` | Completes an exact Career checklist ID and logs it |
| `inner_command.observe` | Adds a dated observation record |

Progress and Rewards read these source records through their existing derivation rules. A reward day still requires the existing daily review to award credits; this release does not silently approve one.

## Deployment order

1. Export and verify a Personal KRYOS backup.
2. Apply the baseline `supabase-schema.sql` only if the project has not already been initialized.
3. Apply `supabase/migrations/20260926_assistant_ingestion.sql` to the existing Supabase project.
4. Deploy `kryos-ingest` with the per-function `verify_jwt = false` setting from `supabase/config.toml`. The handler authenticates every request using a long random assistant token. Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available only to the Edge Function.
5. Publish browser version 0.6.0 with cache-busted asset URLs. Verify desktop and iPhone have loaded it and can save Actions and Career.
6. Apply `supabase/migrations/20260926_assistant_ingestion_cutover.sql` to reject legacy direct task/career writes. A stale cached browser must refresh before editing.
7. Sign in to the Personal cloud profile, push existing Personal data once if the cloud blocks are empty, then create assistant access under Cloud settings.
8. Store the one-time token in a private environment or the Windows DPAPI vault used by `scripts/kryos-assistant-access.ps1`. Never put it in Git, a URL, or a chat transcript.
9. Send a harmless test statement, read the receipt, and verify both desktop and iPhone converge before sending journal text.

## Request example

```json
{
  "schema_version": 1,
  "idempotency_key": "chat-2026-09-26-example-1",
  "local_date": "2026-09-26",
  "timezone": "America/Chicago",
  "raw_text": "I drank four litres of water and read Bhagavad Gita.",
  "operations": [
    {
      "type": "rhythm.measure",
      "habit_key": "water",
      "value": 4,
      "unit": "L",
      "evidence_quote": "I drank four litres of water"
    },
    {
      "type": "rhythm.complete",
      "habit_key": "gita",
      "evidence_quote": "read Bhagavad Gita"
    }
  ]
}
```

The connector reads this JSON from standard input. Its output is an accepted receipt with affected areas, date, request ID, and change cursor. Retrying the identical request with the same idempotency key returns the stored receipt and cannot add another effect. Reusing that key for different content is rejected.

## Current limits and next gates

- The initial migration and Edge Function were applied to production on 2026-09-26. The deployed function returned HTTP 401 for a request without an assistant token. The founder's September 25 journal received an accepted receipt; a same-key retry returned `duplicate: true` and the cloud contains one entry. The 0.6.0 Pages assets are live, the cutover policy is applied, and an authenticated Career write succeeded in a rolled-back dry run while a stale Tasks revision was rejected. The user deferred mobile verification. A same-database private recovery snapshot covers six Personal blocks; this is not an independent disaster backup. Free-tier Supabase does not provide scheduled backups for this project.
- The current browser still stores local state in large blocks. Revision checking prevents silent overwrites, but a true persistent offline operation outbox and automatic field-level conflict merge remain separate work.
- Corrections to historical assistant events, Career checklist reopening, and automatic reward-day review require explicit event reversal rules before release.
- The connector is a local command-line capability. Automatic invocation from every ChatGPT conversation requires a configured Codex tool or MCP connection with the private credential.

## Sources

- Supabase Edge Function authentication: https://supabase.com/docs/guides/functions/auth
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Realtime: https://supabase.com/docs/guides/realtime/subscribing-to-database-changes
- Linear offline retry behavior: https://linear.app/docs/get-the-app
- Linear delta sync: https://linear.app/now/rebuilding-delta-sync-read-path
- Todoist natural-language capture: https://www.todoist.com/help/todoist/features/use-task-quick-add-in-todoist-va4Lhpzz
- Day One journal privacy: https://dayoneapp.com/guides/day-one-sync/end-to-end-encryption-faq/
- Apple feedback guidance: https://developer.apple.com/design/human-interface-guidelines/feedback
