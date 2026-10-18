# Visual design contract — v1

Status: **Accepted / design locked**  
Decision date: 2026-10-18  
Scope: local and hosted presentation. Implementation is not included in this decision.

## Approval and authority

The owner approved the forest-and-warm-neutral palette, clear statuses, reading-first Inner Command and full-width Marketing analytics, with existing features, content and reward rules preserved.

This is the authoritative visual baseline. It supersedes conflicting visual advice in earlier design notes, including treating every missed item as danger red or using intensity heatmaps for categorical daily outcomes. It does not supersede domain rules, data ownership, privacy boundaries or the approved import contracts.

Any later departure must state what changes, why, the impact and the owner's approval. A preview is illustrative, not authoritative personal content or an import source.

## Locked visual foundations

| Semantic role | Light | Dark |
| --- | --- | --- |
| Canvas | #F4F5F3 | #151A19 |
| Opaque surface | #FFFFFF | #1E2523 |
| Main text | #202B28 | #E6EEEA |
| Secondary text | #55645E | #A9BBB1 |
| Decorative divider | #DCE3DE | #38463F |
| Essential control boundary | #78887F | #879C90 |
| Primary action | #17614E | #80D5B4 |
| Text on primary action | #FFFFFF | #112C21 |
| Positive/selected surface | #E8F2EC | #223A2E |
| Information | #355FB3 | #8FB3FF |
| Information surface | #EDF2FC | #26334C |
| Learning/interview context | #7752A3 | #C1A5EB |
| Learning surface | #F3EDF9 | #332942 |
| Attention | #89560E | #F0C785 |
| Attention surface | #FFF3DF | #382F22 |
| Negative outcome | #9C4650 | #E9A4AB |
| Negative outcome surface | #FBEFF0 | #38262C |
| Error/destructive | #AE353D | #FFA5AD |
| Keyboard focus | #355FB3 | #8FB3FF |

Use primitive → semantic → component tokens, not page-specific hardcoded palettes. The same color has the same meaning across pages. Saturated color highlights actions or meaningful data; neutral surfaces dominate. No decorative glass, blur behind text, flashing urgency or rainbow dashboards.

Typography baseline: system/Inter-style sans, 16px reading text, 14px metadata, 12px nonessential annotations, 28–32px page headings, 20–22px section headings. The promise may use a restrained 22–24px serif. Use aligned tabular figures for counts. Essential instructions are not tiny annotations.

Spacing baseline: 4/8px rhythm, 24–32px desktop page padding, 24px section separation, 12–16px surface radius, 8px control radius. One obvious main action per task region, not one card per sentence. Final responsive geometry must satisfy reflow and content-fit checks.

## Locked status meanings

- Forest + check/text: completed, won or confirmed save; primary action uses the same family but a separate semantic token.
- Blue + label: information, in progress, applied, or storage destination. Blue does not mean completed.
- Violet + label: learning/interview context, not automatic mastery.
- Amber + question/text: review, reconfirmation, conflict or an actual actionable due item.
- Restrained rose + cross/text: not-won outcome, localized rather than a danger banner.
- Red + explanation: real error or destructive action, not ordinary incomplete work.
- Neutral + label: unknown, waiting, future, optional or locked reward; these states remain distinguishable by text.

Color is never the only signal. Selection, current date, outcome and keyboard focus remain separate states.

## Locked page composition

Inner Command is reading-first: date context → prominent complete-promise access → one next action → chosen must-do tasks → daily outline → explained result/review → 48-day journey → journal capture/history. Preserve every approved promise/outline point; an excerpt is not permission to delete the full text.

Battle results use existing evidence and review rules. Not recorded is not failure. Current days stay in progress; corrections require reconfirmation as already implemented. Keep multiple-boundary breach reporting, exact dated task linkage and original history.

Actions keeps its existing task ownership, smallest next step and active-work limit. Rhythm preserves full-row tap counters, approved increments/wrap behavior, correction and Undo. Career preserves exact roadmaps, IDs, content and its distinct learning/practice workflows; coverage is not mastery.

Launch is a clear workspace entry, not another dashboard. Marketing retains its separate identity, return navigation and independent date range.

Marketing analytics uses a dedicated full-width content view. Do not squeeze it into a lower half-pane or display it alongside an already crowded job detail. At constrained widths, job details use a roomy full-width view with Back. Preserve search, filters, selected job, scroll and drafts on return. Documents, downloads, manual entry, imports and updates remain available.

Progress separates effort, elapsed time and confirmed outcomes. Rewards separates selected-day earning from current wallet and current eligibility. Money uses readable amounts and actual obligations, not an invented pressure score. Settings visibly explains destinations, versions, confirmed saves and guarded recovery.

## Locked analytics rules

Use one color for one measure across time. Use categorical colors only when categories matter; label them directly. Use sequential intensity only for real quantities, never as a substitute for outcome states.

The 48-day grid represents categorical outcomes; days won and days elapsed remain separate. Its range and labels derive from shared configuration, not text literals.

Every chart names metric, unit, period, source and relevant denominator/coverage. Missing, zero, future and not applicable are distinct. Keep a readable source/table alternative. No unsupported conversion funnel, artificial score, decorative gauge or misleading percentage.

Local Marketing may show locally supported record analytics. Hosted Marketing displays only fields actually present in the approved dated aggregate handoff; the design does not authorize sending extra data.

## Non-negotiable preservation

- No reward weights, costs, earning rules, qualification rules, cooldowns, reservations, ledger events or balances change in the visual work.
- No existing feature, approved content, curriculum, stable ID, record, dated evidence, task relationship or correction history is removed or replaced by preview examples.
- No dates, operating-day boundary, calendar clock, win rules or selected-day semantics change.
- Marketing job records, contacts, descriptions and documents remain laptop-only. Only approved aggregate counts may be handed off.
- Laptop Career and hosted Career remain separate copies under their existing owners.
- No cloud write is claimed from a style change; save labels reflect actual receipts.

## Implementation gate

Next authorized phase: shared token/component foundation, with a component-owner map before replacing styles. Do not stack a global theme over unresolved renderer/style owners. Domain logic and persistence remain in existing modules.

Each implementation slice requires preserved behaviors/content, before/after review, keyboard/focus and contrast checks, history/future/empty/error states, and appropriate integration tests. Target WCAG 2.2 AA, without claiming conformance from palette arithmetic alone. Check 200% zoom, 320px reflow, reduced motion and readable controls.

Local and hosted builds must be verified and released independently. Physical-phone acceptance remains deferred. Record actual test results and retain rollback instructions; never promise bug-free software.

## Research rationale

- [Atlassian color roles and tokens](https://atlassian.design/foundations/color/): semantic roles, independent selection/focus and separate theme values.
- [Carbon chart palettes](https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes): categorical versus sequential purposes.
- [W3C contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): legibility and non-color signals.
- [W3C cognitive focus](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o5-user-focus/): reduce distractions and support reorientation.

This palette is an approved product direction, not a medical claim or universally optimal ADHD palette. Functional clarity is validated with the owner.

