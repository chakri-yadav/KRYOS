# Assistant ingestion: implementation and rollout

This build adds a direct assistant-to-Supabase write path for a Personal KRYOS profile. It does not use the local screen PIN as cloud authentication.

## Delivered code

- `supabase/migrations/20260926_assistant_ingestion.sql` adds revision-checked block writes, assistant credentials, idempotent request receipts, immutable event evidence, and a change log. The migration preserves existing data. A separate cutover migration restricts legacy direct writes only after the new browser version is live.
- `supabase/functions/kryos-ingest/` validates typed operations, maps them to existing KRYOS data, and calls atomic database transactions.
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
| `marketing.batch.import` | Imports one complete validated Marketing batch into the revisioned Marketing block and returns its accepted count/revision |

Progress and Rewards read these source records through their existing derivation rules. A reward day still requires the existing daily review to award credits; this release does not silently approve one.

## Deployment order

1. Export and verify a Personal KRYOS backup.
2. Apply the baseline `supabase-schema.sql` only if the project has not already been initialized.
3. Apply the existing assistant-ingestion migrations if they are not already present, then apply `supabase/migrations/20261007120000_marketing_cloud_assistant_import.sql`.
4. Deploy `kryos-ingest` with the per-function `verify_jwt = false` setting from `supabase/config.toml`. The handler authenticates every request using the existing assistant credential. Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available only to the Edge Function.
5. Publish browser version 0.24.0 with cache-busted asset URLs. Verify signed-in Marketing records sync to the `marketing` block and show up after refresh.
6. Apply `supabase/migrations/20260926_assistant_ingestion_cutover.sql` to reject legacy direct task/career writes. A stale cached browser must refresh before editing.
7. Sign in to the Personal cloud profile, push existing Personal data once if the cloud blocks are empty, then create assistant access under Cloud settings.
8. Store the one-time token in a private environment or the Windows DPAPI vault used by `scripts/kryos-assistant-access.ps1`. Never put it in Git, a URL, or a chat transcript.
9. Send a harmless test statement, read the receipt, and verify both desktop and iPhone converge before sending journal text. For Marketing, import a clearly fictional test batch, confirm the accepted count and `marketing_revision`, then verify the batch survives browser refresh.

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

### Marketing batch request

Submit Marketing separately from journal operations. Its `batch.id` and posting IDs
must be stable; retry the exact request with the same `idempotency_key` if needed.
The full batch is preserved, including fields not yet mapped to first-class UI
fields. This operation imports records only; it does not upload attachment bytes.

```json
{
  "schema_version": 1,
  "idempotency_key": "marketing-test-2026-10-07-01",
  "local_date": "2026-10-07",
  "timezone": "America/Chicago",
  "raw_text": "Import three fictional job postings into KRYOS Marketing.",
  "operations": [
    {
      "type": "marketing.batch.import",
      "evidence_quote": "Import three fictional job postings into KRYOS Marketing.",
      "batch": {
        "format": "kryos-marketing-batch",
        "version": 1,
        "id": "batch-fake-three-jobs-20261007",
        "name": "Three fictional test postings",
        "demo": true,
        "roles": [
          {"id":"fake-analyst-001","company":"Northstar Demo","title":"Data Analyst","source_url":"https://jobs.example.invalid/data-analyst","salary":"Unknown","sponsorship":"Unknown","raw_description":"FICTIONAL TEST POSTING."},
          {"id":"fake-analyst-002","company":"Cedar Demo","title":"Reporting Analyst","source_url":"https://jobs.example.invalid/reporting-analyst","work_mode":"Remote","requirements":["SQL"],"raw_description":"FICTIONAL TEST POSTING."},
          {"id":"fake-analyst-003","company":"Lakeview Demo","title":"Product Analyst","source_url":"https://jobs.example.invalid/product-analyst","unknown_information":["Pay not listed"],"raw_description":"FICTIONAL TEST POSTING."}
        ]
      }
    }
  ]
}
```

The connector reads this JSON from standard input. Its output is an accepted receipt with affected areas, date, request ID, and change cursor. Retrying the identical request with the same idempotency key returns the stored receipt and cannot add another effect. Reusing that key for different content is rejected.

## Current limits and next gates

- The initial assistant function supports only the operations listed above and the Marketing batch operation once the 0.24.0 SQL migration and Edge Function deployment are live. Verify deployment and accepted receipts before describing Marketing as cloud-backed. A same-database private recovery snapshot is not an independent disaster backup. Free-tier Supabase does not provide scheduled backups for this project.
- The current browser still stores local state in large blocks. Revision checking prevents silent overwrites, but a true persistent offline operation outbox and automatic field-level conflict merge remain separate work.
- Corrections to historical assistant events, Career checklist reopening, and automatic reward-day review require explicit event reversal rules before release.
- Marketing posting/application metadata syncs in the profile block. Uploaded résumé/supporting-file bytes remain browser-local until cloud object storage is implemented.
- The connector is an authorized command-line capability. A separate ChatGPT conversation does not inherit its history or local filesystem access automatically; it must run in the authorized workspace and use the local credential workflow without revealing the secret.

## Sources

- Supabase Edge Function authentication: https://supabase.com/docs/guides/functions/auth
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Realtime: https://supabase.com/docs/guides/realtime/subscribing-to-database-changes
- Linear offline retry behavior: https://linear.app/docs/get-the-app
- Linear delta sync: https://linear.app/now/rebuilding-delta-sync-read-path
- Todoist natural-language capture: https://www.todoist.com/help/todoist/features/use-task-quick-add-in-todoist-va4Lhpzz
- Day One journal privacy: https://dayoneapp.com/guides/day-one-sync/end-to-end-encryption-faq/
- Apple feedback guidance: https://developer.apple.com/design/human-interface-guidelines/feedback
