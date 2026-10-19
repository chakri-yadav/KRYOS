# Contextual daily corrections and review

Daily correction presentation is owned by daily-corrections.js/css. Existing
domain operations retain validation, records, linked-task updates and persistence.
The previous premium dialog was already active; this change strengthens its
lifecycle and removes the inactive browser-prompt fallback.

## Correction transaction

Opening captures the selected date, record ID, day revision and stable operation
ID. The dialog shows that date, the original target/progress or incident, the
proposed correction and a required reason. Only the existing task.correct or
breach.correct operation writes data.

The modal lives outside the rerendered journal section. A background render
cannot erase its inputs. Saving requires the captured revision; a newer revision
blocks submission without overwriting facts. Load latest record is explicit:
the original-value display and revision refresh while target/reason stay drafted.
The owner reviews and submits again.

Cancel and Escape do not mutate data. Success returns focus to the original
control or its rerendered replacement, reopening its containing disclosure if
needed. Changing viewing dates, Back or hash navigation closes the correction
without retargeting it.

This is a local-record mutation using existing synchronization. The existing save
indicator explains actual cloud confirmation; closing the dialog does not invent
a cloud receipt.

## Review clarity

Past days distinguish Needs answers from Ready to review. Previously confirmed
days with later edits remain awaiting confirmation. Missing requirements link
directly to their answer controls; an unconfirmed must-do plan links to its step.
Incomplete tasks link back to completion entry.

The result remains a preview until confirmed through the existing engine. A stale
preview is rejected and can be explicitly refreshed. Correcting a mistaken
incident retains its audit record and may leave affected requirements unanswered;
it does not automatically mark them kept.

## Date scope

The independent current operating clock remains 07:00–07:00 America/Chicago.
Shared date context controls personal views; Marketing keeps its own date scope.
Operating-day rollover publishes the same viewing-context notification used by
explicit date changes, allowing open dialogs to close safely.

## Acceptance

Pure tests cover invalid target/reason, stale revision, original-date attribution,
linked completion, retained incident and unanswered requirement, and both DST
transitions at the fixed operating cutoff.

Isolated browser tests cover real modal actions, cancel/Escape, stale draft and
refresh, focus return, date changes, answer links, stale result confirmation,
incident correction and four widths in local and hosted builds. Existing daily
workflow tests retain task links, counters, history, review and refresh coverage.
Production personal data and reward rules are not changed by these tests.
