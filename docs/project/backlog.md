# Product Backlog

## Current scope and release

Visual upgrade: the accepted design, shared light-mode foundation and daily-use slice are delivered. Next bounded slice: Career and Marketing presentation. Dark-mode activation and the remaining supporting-page migration are not yet complete. See [daily-use acceptance](../qa/daily-use-visual-acceptance.md).

Hosted application: **0.45.16**. Laptop application: **0.25.11**.
These are independent release lines, not competing versions of the same deployment.

The selected-day, journal-correction and guarded-conflict-resolution phase is **complete for the agreed desktop scope**. Phone acceptance is explicitly deferred by the owner and does not block desktop completion. This does not mean the entire product is finished or every legacy workflow has been revalidated.

## Completed in this phase

Subsequent authorized delivery in 0.45.13: hosted aggregate Marketing date-range analytics, handoff freshness and navigation rendering repair. The laptop workspace and private job storage remain unchanged. The desktop history/sync acceptance record below remains the evidence for its original release, not a claim to retest every product feature.

- [x] Shared selected date across personal pages, separate from the actual operating clock.
- [x] Historical date navigation, browser history and date persistence.
- [x] Guided daily review with an explained result and reconfirmation after corrections.
- [x] Review queue for elapsed days needing attention.
- [x] Selected-day progress and reward summaries; current wallet clearly separate.
- [x] Dated completion evidence isolated from edits to other days; duplicate one-off action credit prevented.
- [x] Date-scoped journal timeline, explicit all-days view and search.
- [x] Inline journal text corrections, prior-text history and stale-edit rejection.
- [x] Initial cloud recovery protects journal entries, linked records and drafts.
- [x] Read-only comparison and paired download of browser/cloud snapshots.
- [x] Explicit per-block browser/cloud resolution with backup, acknowledgement, freshness checks and conditional cloud writes.
- [x] Independent desktop browser/offline/conflict verification.
- [x] Current backlog, conflict contract and QA evidence documented.

## Verification evidence

- Hosted code: 268 automated checks passed.
- Laptop code: 159 automated checks passed.
- Browser regression checks cover shared dates, journal save/cancel/history, scope changes, refresh, conflict choices and account-change clearing.
- Two isolated desktop browser contexts passed online propagation, historical correction, offline persistence, concurrent-change preservation and stale-write rejection against a simulated shared transport.
- A live authenticated conditional-update check matched zero rows and confirmed that the cloud block was unchanged.
- The hosted release was deployed and browser-tested. No real personal block was replaced to test a conflict choice.

See [desktop acceptance evidence](../qa/desktop-history-sync-acceptance.md).

## Deferred, not blocking

- [ ] Physical phone acceptance and real laptop-to-phone offline/reconnect testing. Resume only when the owner requests mobile work.
- Automatic field-level merging is not approved scope and is not silently added to the backlog.
- A recovery-snapshot restore/import UI is not part of this phase. Saved recovery snapshots are not standard full-application backup files.

## Product boundaries

Marketing job records and documents remain laptop-only. Career in the laptop app remains separate from the hosted Career copy. Guarded conflict resolution handles only the selected daily-records or legacy-journal block; it does not publish Marketing, migrate Career, resolve every block at once, or change reward rules.

## Completion rule for future work

New tasks need a concrete observed issue or an explicitly approved requirement, a bounded scope, acceptance checks and a release/documentation record. Do not treat repeated continuation requests as permission to invent an endless feature queue.

[Historical prototype backlog](archive/backlog-legacy.md) is retained for reference only; its old status statements are not the current product plan.
