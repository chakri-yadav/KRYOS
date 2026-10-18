# Desktop historical-day and sync acceptance

## Scope

Hosted 0.45.12; laptop 0.25.8. Desktop-first acceptance is the current owner-approved scope. Physical phone testing is deferred, not passed and not a desktop blocker.

## Evidence ledger

| Check | Result | Evidence boundary |
| --- | --- | --- |
| Hosted automated suite | 268 passed | Source-level and deterministic regression tests |
| Laptop automated suite | 159 passed | Source-level and deterministic regression tests |
| Shared-day browser workflows | Passed | Date navigation, history, refresh, review and Marketing exclusion |
| Journal correction browser workflows | Passed | Save, cancel, stale edit, prior text, draft preservation and reload |
| Conflict choice browser workflows | Passed | Both directions, acknowledgement, paired download, recovery persistence and account clearing; simulated cloud |
| Two independent desktop browser contexts | Passed | Shared simulated HTTP transport; online propagation, historical correction, offline persistence, concurrent conflict and stale write |
| Live authenticated conditional update | Passed, zero rows matched | Impossible expected revision; block revision/timestamp unchanged |
| Hosted deployment/browser regression | Passed | Published application assets, isolated browser data |
| Real personal conflict replacement | Not performed | No user's real winning copy chosen during QA |
| Physical laptop/phone round trip | Deferred by owner | Not represented as verified |

No private journals, credentials, job records or downloaded snapshots belong in public test fixtures or documentation.

## Desktop acceptance scenarios

- [x] Selecting history does not change the actual operating clock.
- [x] Personal pages follow the selected date; Marketing stays independent.
- [x] Past daily reviews explain missing requirements and require reconfirmation after correction.
- [x] Later task edits preserve earlier completion evidence; one-off work is not paid repeatedly.
- [x] Journal text edits preserve date, identity, linked records and unfinished drafts.
- [x] Offline edits remain available after refresh.
- [x] Concurrent browser/cloud changes preserve both copies and reject stale writes.
- [x] Conflict comparison is read-only.
- [x] Replacement requires a paired download and explicit whole-block acknowledgement.
- [x] Backup failure, changed accounts, stale copies and unverifiable receipts reject resolution in automated checks.
- [x] Per-block resolution leaves Marketing, Career and other blocks unchanged.

A newer-cloud-schema rejection guard is implemented. A dedicated live newer-schema scenario was not performed; it is not included in the live endpoint evidence above.

## Closeout

The bounded desktop implementation and automated acceptance phase is closed. This is not a blanket bug-free claim or completion of the entire product. Future discoveries enter the active backlog as specific issues.

## Mobile resumption checklist

When requested later: verify the current release and account on the physical phone without clearing site data; preserve backups; agree on a disposable test record; then verify laptop-to-phone and phone-to-laptop corrections, offline/reconnect, conflict handling and refresh. Obtain actual receipts before marking the physical-device check complete.
