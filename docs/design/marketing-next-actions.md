# Explicit application next actions

The laptop application selects work using marketing-next-action.js. The hosted
application continues to display approved aggregate evidence only. This shared
policy module is published for reproducibility; hosted pages do not acquire
application records or planning controls.

## Selection order

1. Incomplete follow-up or interview preparation explicitly due today or earlier.
2. Selected Saved/To review role.
3. Today's saved role, then an older saved role with its date shown.
4. Unscheduled Interview/Follow-up record, labelled Review details or Plan follow-up.
5. A clear no-pending-work state.

Ordering is deterministic, with due date followed by stable job ID. Deferred,
closed, applied-only and synthetic records do not become unfinished applications.
No elapsed-time rule invents an employer deadline.

## Local planning contract

Existing application metadata holds next_action:
`{id,kind,due_date,status,created_at,completed_at?,cancelled_at?}`.
Kinds are follow-up and interview-preparation; statuses are Open, Completed and
Cancelled. It is an optional additive field; no existing records are migrated.
Complete or cancel an open plan before making another.

Manual controls live in the application Updates section. The existing workspace
save queue and expected revision protect persistence. A concurrent change to the
same plan rejects the merge and leaves recovery data available.

The existing local application.update operation accepts:

```json
{
  "operation": "application.update",
  "idempotency_key": "stable-operation-key",
  "jobId": "exact-job-id",
  "expectedRevision": 7,
  "nextAction": {
    "type": "schedule",
    "id": "stable-plan-id",
    "kind": "follow-up",
    "due_date": "2026-10-20"
  }
}
```

Complete/cancel use the same exact job and plan IDs, a new operation key and
nextAction `{type:"complete",id:"stable-plan-id"}` or type cancel. Reuse the
operation key on retry and require accepted receipt plus readback. A stale
expectedRevision returns conflict before saving. Invalid operations produce no
persisted partial update.

Completion writes one stable activity ID linked to the plan. It does not change
the job stage, applied date or submission count. Cancellation writes no completed
follow-up. Future dates stay upcoming; the owner may complete work early.

No cloud transfer, reward change, reminder service or automatic outreach is
introduced. Existing top-level scheduling collections remain intact; the new
manual controls own only this explicit per-application plan.
