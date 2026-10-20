# Page render lifecycle

## Contract

All primary pages enter the shared render registry. Existing domain functions
remain the base owners; a single explicitly registered replacement is permitted.
Presentation sections have unique IDs and explicit numeric order rather than
capturing and replacing global renderers. Registration order does not determine
section order. Duplicate section IDs or base owners fail immediately.

One synchronous update captures scoped view state, reads the existing domain
model in its owner, renders the base, applies ordered sections and restores view
state in reverse order. HTML-returning components use the same registry's value
projection. Recursive updates of the same component do not render it twice.
Failure propagates, attempts all registered restorations and releases the guard
for a later retry. Rendering does not retry any domain mutation.

## Ownership

| Entry | Explicit sections |
| --- | --- |
| Inner Command | reading base, date guard, review state, review queue, scoped form context |
| Actions | domain vault, active focus, next-step cards and linked commitment references |
| Rhythm | domain view, existing habit/group presenters, dated controls and feedback |
| Career | workflow base, distribution-specific package control, learning context |
| Launch | source projection, domain view, selected next action, dated count evidence |
| Marketing | local workbench projection or hosted aggregate base, never both |
| Progress | domain analytics, presentation, shared day summary, review queue, count evidence |
| Rewards | current rule-version base, shared day summary, count evidence |
| Money | existing domain ledger base and presentation; no calculation replacement |
| Settings | existing base/receipt presentation and conflict-review section |

Shared navigation supplies scoped focus, active unsaved text, reading position
and ID-based disclosure restoration. Existing specialized form/note/tab owners
remain responsible for richer drafts. File controls are not replayed.
Account/mode/date identity must match before restoration. Marketing remains
independent of the personal selected date. Daily-form drafts are session-only,
keyed by account/mode/date. Scheduled focus restoration is cancelled by a newer
render, account/day change or navigation away. Navigation positions and entry
form drafts are scoped to the same account/date context.

## Refresh and subscriptions

Local application storage emits kryos:marketing-state with only reason,
revision, connected, ready, dirty and status. Bootstrap, dirty/save success or
failure, conflict refresh, reconnect and other-window revision are covered.
The existing local service poll remains the transport for outside writes; it is
not replaced by a claim of server push. Consumers coalesce DOM work into one
animation frame. Open dialogs or focused source controls defer replacement;
focusout/close resumes the pending refresh. Settings refreshes its owned receipt
card without rebuilding credential forms.

The current local provider advertises notification version 1 and does not install
the former 1.5-second evidence-signature timer. A compatibility fallback remains
only when that capability is absent. The shared operating clock remains; a
redundant Progress-specific rollover timer is removed. Existing delegated events
are registered once at module setup, never on each render. Registry registration
returns a section disposer for transient owners; current static owners live for
the document lifetime. Repeated navigation does not multiply listeners or panels.

## Verification and boundaries

245 local / 353 public checks pass. Browser checks include repeated full-page
navigation and render, stable registration/listener counts, unchanged task and
roadmap JSON, scoped drafts, source-focus deferral, other-window import,
offline/reconnect, pending/successful save, upload/download and existing dated
review and reward flows. No production account writes are used in fixtures.

No database migration, scoring/catalogue/cooldown change, financial calculation
change, curriculum rewrite or automatic statistics transfer is introduced.
Local Marketing records/documents and Career remain separate from hosted data.
Physical-device, full screen-reader and complete restore-drill acceptance belongs
to the separate final acceptance package, not this lifecycle refactor.
