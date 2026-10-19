# Dated application evidence contract

Decision: implement one read-only projection shared by Launch, Progress and Rewards.

## Data ownership

Local Marketing records are authoritative on the laptop. Hosted pages consume only approved dated snapshots already present in the personal tasks block. No browser script transfers job records, contacts, descriptions or documents. The assistant statistics handoff remains explicit and keeps existing receipt/idempotency requirements.

The laptop reads its current local workspace projection; disconnected recovery copies are labeled. Hosted receipt freshness reports received time, covered date and source revision, not a claim of continuous laptop synchronization. Missing snapshots remain unknown; a recorded zero is a known zero.

## Count and meaning

For each behavior date, deduplicate valid Launch applications with stable references, and use max(distinct Launch submissions, Marketing snapshot count). Add other qualifying market actions only for exposure counts. Do not manufacture Launch log entries to represent aggregates. Draft posts and voided logs are excluded. Subsequent updates to the same directly logged application do not become new submissions.

Weekly exposure, the exposure grid and applied totals now read the projection. Responses/interviews/offers remain explicitly sourced from Launch logs, because a count-only handoff cannot describe employer outcomes.

Application counts are separate from activity-record counts. A dated summary can be one Progress evidence record while representing multiple applications. Reward formulas, caps, qualification and wallet rules are not changed; daily earnings are labeled as all-category totals, not a per-application payout.

## Interaction and component ownership

marketing-evidence.js owns validation and pure projection helpers. marketing-integration-ui.js owns source panels, earlier-date actions and local-status refresh. marketing-integration-ui.css owns the semantic source panel. Existing Launch renderers own logs, controls and weekly targets. No second wallet or database is introduced.

The shared selected date controls all three personal pages. Earlier-date buttons select that date; opening Marketing retains its independent workspace/date context. Source panels explain the selected day and latest receipt separately.

## Verification and recovery

Seven projection tests cover duplicate references, newer corrections, explicit zero/missing dates, invalid snapshots, local demo exclusion, draft/void exposure and read-only boundaries. Browser checks cover all three panels, earlier-date navigation, applied pipeline totals, local versus hosted sources, zero/unknown states, reflow and refresh.

Local suite: 187 passing checks. Hosted suite: 303 passing checks. Existing daily-use and supporting-page workflows remain covered. No personal records or statistics are imported for this UI release.

Rollback restores the prior software package or clean public tag; no data migration or deletion is required. The approved local/cloud storage separation remains in force.
