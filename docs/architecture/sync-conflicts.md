# Sync conflict contract

Status: implemented for the desktop journal/daily-records workflow in hosted 0.45.12 and laptop 0.25.8. Phone acceptance is deferred.

## Unit and boundaries

Resolution replaces one complete block, not an individual sentence or field:

- `tasks`: current journal entries and linked daily data, including Actions, Rhythm, Launch and Money.
- `journal`: legacy journal workspace.

The confirmation explicitly names the whole-block impact. Marketing and Career are excluded. Existing broad Push/Pull controls are not equivalent to this guarded per-block workflow. This is not a universal replacement for every legacy sync path.

## Review and choice

1. Read the current account's browser and cloud copies.
2. Show journal entry differences, draft counts, linked-record differences and correction-history counts.
3. Download both reviewed copies together.
4. Choose Keep browser copy or Use cloud copy for one block.
5. Acknowledge that the paired download was kept and that the whole selected block will be replaced.
6. Confirm the direction explicitly.

Comparison does not write data. No automatic merge or default winning copy is selected.

## Preconditions and backup

- Reject unsupported blocks, signed-out/demo contexts, changed accounts and newer unsupported cloud formats.
- Refuse overlapping active sync; pause background task writes during resolution.
- Recheck cloud revision, timestamp and content, plus current browser content.
- Persist and read back a profile-scoped recovery snapshot before replacement. Backup failure stops the operation.
- Keep a downloadable last recovery snapshot on this browser. Later attempts replace that last-snapshot slot; the required paired downloads preserve earlier reviewed copies independently.
- Snapshot content is private and must not be published.

The paired/recovery format is not the standard full-application backup format. There is no one-click restore UI or automatic rollback in this phase; restoration requires an explicitly reviewed recovery operation.

## Keep browser copy

Update only the selected profile/block row. Require both its reviewed revision and payload timestamp to match; increment revision on success. Read cloud back and verify revision and semantic JSON content. JSON field ordering alone must not produce a failure.

An unmatched conditional update is a conflict, not permission for an unconditional retry. Lost receipts or changed read-back data are not reported as successful resolution. Browser edits made while the request is in flight remain preserved and require another review.

## Use cloud copy

Recheck cloud and browser again after backing up, then persist the reviewed cloud payload only to the selected browser block. Verify browser storage and reload the appropriate in-memory state. Do not write cloud, change the selected viewing date or touch unrelated blocks.

Cloud may advance after the final read; the chosen snapshot is not a distributed lock. Later changes must be detected by subsequent normal freshness checks.

## Result and failure reporting

Only a verified selected-block result is called resolved. Do not clear unrelated conflicts or claim every device received it. Account changes clear loaded comparisons. Failure preserves the recovery copy, explains what could or could not be verified, and requires comparison again rather than blindly overwriting.

The first-recovery guard additionally prevents action-count heuristics from silently replacing existing journal work when the browser has no known cloud baseline.

## Evidence and limits

See [desktop acceptance evidence](../qa/desktop-history-sync-acceptance.md). Automated and simulated desktop tests are not evidence of physical phone acceptance. No real personal block was replaced as a test.
