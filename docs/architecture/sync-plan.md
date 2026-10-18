# Current sync plan

Status: deployed desktop integration. Hosted application 0.45.13; laptop application 0.25.8.

## Storage boundaries

- Hosted personal workspaces use browser copies and the signed-in Supabase profile.
- Laptop Marketing job records, resumes and other attachments remain in the local service.
- Only explicitly requested dated Marketing aggregate statistics are handed off to the hosted progress/reward path. Not job descriptions, contacts or files.
- Laptop Career uses the local Career service; hosted Career is a separate Supabase-backed copy.
- This documentation update neither migrates nor deletes any legacy cloud records.

## Daily work and history

The selected viewing date is separate from the current operating clock. Personal pages share the selected date; Marketing retains its independent date/batch workflow. Journal drafts and completion evidence retain their occurrence dates. Correcting journal prose does not silently rewrite linked activity facts or reward evidence.

## Freshness and conflicts

Account connection alone is not proof of a saved record. Use the workspace save state and accepted backend receipts. Automatic freshness checks must preserve conflicting local work.

The current journal/daily-records conflict flow compares copies, requires paired download and explicit whole-block acknowledgement, persists a recovery snapshot, revalidates both copies, and resolves only the selected block. Cloud replacements use conditional revision/timestamp matching and verified read-back. See [the conflict contract](sync-conflicts.md) for exact scope and failure behavior.

Legacy broad Push/Pull controls and other sync paths are not a universal automatic merge. Do not infer that one resolved block means every block or device is current.

## Verification and rollout

Desktop-first is the agreed scope. Automated suites and isolated browser/offline tests passed; a live zero-match conditional update left the cloud block unchanged. Physical phone acceptance is deferred by the owner, not passed and not a desktop blocker. Real personal conflict replacement was not used as a test.

See [desktop acceptance evidence](../qa/desktop-history-sync-acceptance.md) and [the active backlog](../project/backlog.md). Credentials, personal imports and private test snapshots never belong in public source or release metadata.

The earlier prototype plan is retained in [the planning archive](../project/archive/sync-plan-legacy.md), not as a current setup gate.
