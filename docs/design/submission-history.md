# Submission history and explicit corrections

The laptop workspace retains append-only submission facts separately from a
job's current stage. Shared projection code powers local charts, evidence and
the aggregate exporter. Hosted pages continue to receive approved counts only.

## Data contract

submission_history has version 1, migration timestamp and legacy_groups.
submission_events retains submitted, corrected, voided and linked events.
Each actual submission has a stable root ID, job/source references, appliedDate,
recordedAt, sourceOperationId and submittedDocumentIds. Corrections/voids reference
the original root and retain their reason. recordedAt is the capture time, not
proof of the historical application timestamp.

Legacy migration does not infer which current document was submitted. Such
document attribution is explicitly unconfirmed. The owner can link existing
application document IDs when recording or correcting a submission.

## Migration

Use scripts/kryos-marketing-history.mjs --preview for a read-only metadata
comparison. It reports source revision, dated counts, candidate count and
ambiguous-group count without exposing employers or file bytes.

Back up the local database/files before enabling. Then use --migrate with an
explicit --expected-revision and --idempotency-key. The service requires identical
before/after counts, commits migration and receipt atomically, and returns an
accepted receipt. Read the state and dated counts back afterwards.

Unambiguous legacy submissions receive deterministic IDs. Ambiguous repeated
identities/dates preserve the legacy count until the owner explicitly confirms
which recorded dates represent actual submissions. All original jobs and files
remain available. Repeating migration does not duplicate facts.

## Typed local application.update operations

Supply exact jobId, expectedRevision and stable idempotency_key. The submission
field accepts:

- record: appliedDate and reason, for a first valid submission.
- reapply: appliedDate and reason, explicitly confirming another submission.
- correct: submissionId, appliedDate and reason.
- void: submissionId and reason, for a mistaken entry.
- resolve: legacyIdentity, selected dates and reason, for ambiguous legacy groups.

submittedDocumentIds is optional and must refer to documents already linked to
that application. A genuine reapplication is distinct even on the same date.
Import retries or later stage changes never imply a reapplication.

The local bridge forwards these fields through its existing application.update
path. Reuse the entire request, expected revision and operation key on an uncertain
retry. Accepted receipts are checked before stale-revision rejection so a lost
response can be retried safely. A different payload under the same key conflicts.

## Manual workflow and failures

The Updates section shows each submission, correction trail and void state.
The older editable date becomes a compatibility display. Changing dates requires
the explicit reasoned form. Job stage changes preserve submission evidence.

Pending requests survive tab refresh in session storage and can be checked and
retried. Confirmed validation/conflict errors clear the pending request.
Conflicts show fresh history while preserving the draft for review. Only accepted
receipt plus state readback shows saved confirmation.

Ordinary full-workspace saves preserve the server's history. Imports cannot
silently replace it. Newly applied records gain a single captured fact; duplicate
identities link to existing facts. New normalized metadata is read back to the
browser after save.

## Recovery and compatibility

Use the local database/files backup to restore submission history, with a
disposable restore verification first. Browser workspace imports do not replace
the authoritative audit trail; importing history into a fresh store is rejected
with recovery instructions rather than silently dropping it.

Prefer forward repair after history edits. Old software can display only the
legacy compatibility fields and may undercount reapplications; do not export
statistics using downgraded code against an edited history database. A full data
rollback requires the matching verified database/files snapshot and an explicit
decision about later work.

No cloud migration or automatic reward recalculation is part of enabling local
history. A later correction handoff remains an explicit counts-only operation.
