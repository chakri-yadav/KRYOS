# Changelog

All notable KRYOS changes should be recorded here.

## 0.22.1 - Resume mastery curriculum fidelity

- Complete the supplied Resume Interview Mastery System import with the explicit 11-bullet-to-shared-module map, exact five-pass study cadence, four claim-led depth tiers, and the interruption/challenge/change-scenario mastery standard.
- Add private Role A/Role B prompts for chronology and coherent system pictures without publishing employer names, dates, or personal work-history details in shared code.
- Upgrade the existing Career roadmap in place; retain its stable ID, matching completed checks, unrelated roadmaps, and activity history.
- No schema change; a signed-in app writes the updated Career block using normal revision-checked sync when opened.
- QA: dedicated curriculum/migration and deployment tests plus the full automated suite. Cloud persistence requires opening the signed-in release and confirming Career sync.

## 0.22.0 - Resume Interview Mastery System

- Upgrade the existing resume interview roadmap in place to a five-layer, 20-module curriculum: claim control, shared technical foundations, bullet-specific mastery, interview speaking, and mock/retrieval practice.
- Cover the shared SDE foundations from the supplied plan, including APIs, testing/CI, SQL/PostgreSQL, caching, workflows/concurrency, distributed reliability, security, observability, hardening, partitioning/reporting, and Docker/Jenkins.
- Add a reusable 12-field claim card, four spoken answer lengths, answer grammar, eight follow-up families, actual-to-hypothetical system-design bridging, behavioral story practice, and a five-pass retrieval loop.
- Preserve the stable roadmap ID, unrelated Career roadmaps, activity history, and completed checks where the checklist text still matches. Do not put private resume or employer details in shared code.
- No schema change; signed-in app applies migration through normal revision-checked Career sync. Existing Career content remains visible.
- QA: dedicated content/migration checks and full automated suite; Pages availability checked after merge/deploy. Personal cloud migration is confirmed only after opening the signed-in release and successful Career sync.

## 0.21.0 - Resume interview speaking roadmap

## 0.21.0 - Resume interview speaking roadmap

- Add a five-module Career roadmap focused on explaining and defending resume claims aloud: truth/ownership, concise story construction, claim-relevant technical explanation, follow-ups, and mock speaking practice.
- Keep the private resume audit as a personal reference; no resume text, employer names, or company-specific history is embedded in public code.
- Emphasize evidence boundaries, honest uncertainty, and flexible spoken answer lengths; do not create a broad technical curriculum or guarantee an interview-ready date.
- Add an idempotent Career migration preserving other roadmaps, activity history, and completed checks.
- QA: dedicated content/scope/migration tests and full test suite.
- No schema change; a signed-in app applies normal revision-checked Career sync after deployment.

## 0.20.0 - SDE-2 Interview Debugging roadmap

- Add a focused five-module Career roadmap: trace state, reproduce/minimize failures, select boundary tests and verify fixes, explain debugging in interviews, and repeat the process during regular DSA practice.
- Use flexible evidence-based readiness checks rather than a guaranteed 6–8 week outcome or a strict 15-minute pass/fail threshold.
- Keep the scope general SDE-2 coding interviews; exclude Amazon-specific material and production/on-call debugging topics.
- Add an idempotent Career migration that preserves existing roadmaps, activity history, and completed checks on reconciliation.
- QA: roadmap-content/migration tests, cloud migration wiring, and full test suite.
- No schema change; first cloud persistence occurs through normal Career sync after opening the signed-in release.

## 0.19.0 - Canonical System Design roadmap cleanup

- Keep the book-based SDE system-design roadmap and display its title as `System Design Roadmap`.
- Remove duplicate roadmaps named `System Design Roadmap` or `System Design Roadmap (Book-Based)` while preserving unrelated roadmaps, the retained checklist progress, and historical Career activity.
- Apply the idempotent cleanup to local Career data and after cloud refresh, then persist using normal revision-checked Career sync.
- QA: duplicate cleanup tests, migration/idempotency/progress-preservation checks, and full test suite.
- No schema change; signed-in release needs to open and finish Career sync for the Personal cloud copy to reflect the cleanup.

## 0.18.0 - Book-based SDE system design roadmap

- Import a 17-module, general SDE roadmap aligned to System Design Interview Chapters 1–15, followed by reliability/operations and final synthesis.
- Each design moves from concepts and book study into an explicit practice artifact; crawler, video, and file-sync designs are marked optional stretch.
- No Amazon-specific scope, arbitrary deadline, or pre-completed checklist items.
- Add a one-time Career migration that preserves existing roadmaps and activity history, avoids same-title collisions, and retains checklist completion on reconciliation.
- Migration is applied to local Career data and after a fresh cloud Career pull; existing revision-checked Career sync writes the migrated state back to Personal cloud.
- QA: dedicated roadmap content/migration tests and full test suite.
- Known limitation: the Personal assistant-ingestion API does not expose roadmap creation; import occurs through the signed-in app's normal Career sync after this release is opened.

## 0.17.0 - Manual Marketing role capture

- Add a low-friction manual job entry form for company, title, original link, location, salary, work arrangement, sponsorship, posted date, posting text, responsibilities, requirements, and unknowns to verify.
- Let the user choose the initial tracking status; saved roles open in the existing detail view to continue with application contacts, notes, résumé version, and attachments.
- Add manual roles to the selected non-demo batch; when the demo batch is selected, create a separate real "Manually added roles" batch rather than mixing real entries into fictional fixtures.
- Validate required fields and source URL protocol; retain imported-batch workflow and preserve disclosures about browser-local storage.
- No cloud schema or personal KRYOS data changed.
- QA: Marketing/deployment tests, full test suite, diff validation, and live-page verification.
- Known limitation: Marketing records and files remain browser-local and are not cloud-synced or included in KRYOS backups.

## 0.16.7 - Reliable Marketing role collapse state

- Explicitly hide role-detail panels when their disclosure state is collapsed, even when the premium layout uses CSS Grid.
- Add regression coverage for the collapsed-state rule.
- No application data, workflow, sync behavior, or schema changed.
- QA: Marketing/deployment tests, full test suite, live-page state inspection, and diff validation.
- Known limitation: Marketing records and attached files remain browser-local and are not cloud-synced or backed up.

## 0.16.6 - Focused Marketing role detail experience

- Rebuild the expanded role view as a focused briefing: role identity, at-a-glance facts, responsibilities, requirements, unknown/verify items, and a separate application record.
- Keep the full captured posting available on demand; keep the original source action prominent.
- Group application progress and contact details with semantic fieldsets, while preserving status, dates, résumé version, contact fields, notes, and all file controls.
- No Marketing record schema, cloud-sync behavior, or personal data changed.
- QA: Marketing unit tests, deployment/cache tests, full test suite, and diff validation.
- Known limitation: Marketing records and attached files remain browser-local and are not cloud-synced or backed up.

## 0.16.5 - Premium Marketing visual refinement

- Elevate the existing Marketing batch panel, job list, status chips, posting details, application fields, and attachment area with a consistent premium visual hierarchy.
- Improve text contrast, focus visibility, touch target sizing, and responsive spacing without removing job data or changing application behavior.
- Distinguish KRYOS account sync state from browser-local Marketing batch and file storage; clarify demo and local-storage notices.
- No Marketing record schema, cloud-sync behavior, or personal data changed.
- QA: Marketing unit tests, deployment/cache tests, full test suite, and diff validation.
- Known limitation: Marketing records and attached files remain browser-local and are not cloud-synced or backed up.

## 0.16.4 - Visible Sadhana drift evidence

- Render assistant-recorded `drift` statuses as visible Day 1–48 drift markers instead of grey, unreviewed-looking days.
- Count saved drift statuses in the Inner Command summary and today state while retaining compatibility with existing `breach` entries.
- Add a calm amber drift visual and cache-bust the Inner Command styles and app script.
- Add regression coverage for assistant-recorded drift visibility and counting.

## 0.16.3 - Immediate Personal cloud recovery

- After a successful Cloud sign-in, immediately reconcile the open page from the Personal Supabase profile and start its realtime and five-second freshness monitor.
- Treat an increased sync-block revision as new data even if the block timestamp did not change.
- Preserve local work on detected conflicts; sign-in recovery never pushes local data over the cloud.
- Add regression checks for sign-in recovery and revision-based freshness.

## 0.16.2 - Marketing application files

- Add per-role file attachments for résumés, cover letters, portfolios/work samples, certificates, job descriptions, and custom supporting files.
- Keep binaries in browser IndexedDB and small attachment metadata with each role; preserve résumé version context and support download/removal.
- Reject empty, unsupported, and over-10-MB files before saving; report browser storage failures and clean up a file when its metadata cannot be saved.
- Keep file attachments browser-local and explicitly outside cloud sync and JSON backups.
- Add failure-path coverage for file validation, browser storage errors, and attachment save/download/remove lifecycle.

## 0.16.1 - Active application count correction

- Do not count closed `Not selected` records as active applications.

## 0.16.0 - Marketing batch import and application tracking

- Add JSON batch import, a searchable Marketing role list, complete source/posting detail, and editable per-role application notes.
- Auto-import ten varied fictional job records on the first Marketing visit. All source links use the reserved `.invalid` domain; the demo can be removed and will stay removed.
- Keep Marketing data separate from Career and Rewards, provide active-space reset cleanup and an explicit remove-demo action.
- Keep this experiment browser-local; cloud synchronization for Marketing batches is not claimed by this release.

## 0.15.1 - Cloud visibility and Progress polish

- Restore the direct desktop route to Cloud & versions and keep that destination on refresh.
- Show snapshot times and revisions for four cross-device data areas alongside the complete release history.
- Redesign the four optional reward choices and Progress's today evidence card for clearer, calmer visuals.

## 0.15.0 - Marketing workspace shell

- Add a separate Marketing workspace entry from Career Launch, with a dedicated current-batch and saved-role list shell.
- Add smooth in-app return and browser Back/Forward routing, and reuse the shared KRYOS cloud state without claiming empty Marketing records are synced.
- Keep batch import, job records, and résumé storage out of this shell milestone; preserve all existing Career Launch data.

## 0.14.0 - One reward rule for every recorded date

- Recalculate all past and future reward days from completed source evidence using the same bounded rules.
- Preserve old daily assessments in the Personal data block and retain every cloud credit change in the private adjustment audit.
- Retire old day and weekly award entries when unified awards replace them, including after a correction.
- Recognize clearly completed historical journal facts in Career, meals, care, supplements, spirit, and articulation without converting intentions into completion.
- Show original and recalculated earnings on the Rewards page after cloud reconciliation.

## 0.13.0 - Strict evidence-based rewards

- Initiated call costs 100 credits; movie night remains 90.
- New earning rules take effect September 29, 2026. Historical earning rules remain intact.
- Separate daily points, spendable credits, and six-gate qualified days; partial effort still earns bounded credit.
- Include due Money follow-ups, completed card payments, and payment reconciliation. Prevent repeated Career toggles and parent summaries from inflating rewards.
- Add serious mock completion without a timer, explicit return evidence after drift, and limited weekly maintenance awards.
- Calculate confirmed awards from cloud records, enforce catalogue prices and cooldowns in a serialized transaction, and retain correction adjustments.
- Verify shared rules, historical regression checks, browser navigation, and a live cloud transaction.

## 0.12.0 - Connected next-step navigation

- Inner Command's dynamic Continue action now opens the right page and lands on the current Career step.
- Added small contextual page links so core pages lead into the next relevant action or evidence view.
- Corrected dynamic page buttons across the app and tightened the next-step card's layout and focus treatment.

## 0.11.1 - Dated journal activity evidence

- Added a dedicated dated-evidence record for completed journal activity that must appear in Progress and Rewards without becoming an unfinished Action Vault commitment.
- Important and critical dated evidence can earn bounded responsibility credit under the same daily cap as Actions.

## 0.11.0 - Evidence integrity and focused rewards

- Prevented past journal activity from being created as a new Action Vault commitment without explicit unfinished-action evidence.
- Preserved the journal date for assistant-completed actions instead of showing backdated work as completed today.
- Replaced ambiguous Undo behavior with Reopen and added an explicit Remove from vault control that keeps journal evidence intact.
- Added structured social, astrology, information, and validation drift capture with severity, duration, and conscious-return evidence.
- Reduced redemption choices to two extra ADHD relief breaks, casual time, one initiated call, and movie night.
- Required five qualified days in the current seven-day window for an initiated call.

## 0.10.1 - Sadhana spirit rhythm patch

- Restored Nama Japa to the Rhythm spirit practice surface.
- Made Aditya Hridayam and Hanuman Chalisa visible 0/3 counted practices before completion.
- Added assistant ingestion support for exact counted Rhythm practices so late journal capture can still update the correct day.
- Kept Reward scoring strict: counted practices only qualify when their configured target is reached.

## 0.9.0 - Living Money ledger

- Added private, dated card-payment and cash-reimbursement events after the existing checkpoint.
- Added statement-interest posting with daily-balance-weighted allocation or explicit evidence-based split, and a visible reconciliation difference.
- Added a guarded APR forecast that is never posted as a charge and is withheld when dates or intervening activity make it unreliable.
- Existing historical interest remains inside the checkpoint and is not posted twice. No private financial values appear in public code.

## 0.8.1 - Money checkpoint context

- Shows the founder-confirmed historical reconciliation details saved privately in the Personal profile.
- Labels the recorded date as a reconciliation checkpoint rather than implying it is the statement close date or a live balance.
- Preserves those details when the checkpoint form is edited.

## 0.8.0 - Money Command

- Rebuilt the Money page with a clear next action, a focused call brief, and separate card and direct reimbursement figures.
- Added dated statement checkpoints with exact card-split reconciliation and direct reimbursement validation.
- Preserved prior Money balances, contacts, promises, payments, adjustments, and card snapshots.
- Kept personal settlement amounts out of the public code; a checkpoint is shown only after it is saved to the Personal profile.

## 0.7.0 - Devi Sadhana and Automatic Rewards

- Reframed Inner Command as a 48-day Devi Sadhana from September 26 through November 12, 2026.
- Added evidence-derived nourishment, care, spiritual, Career, Launch, articulation, Action, and boundary scoring.
- Added rolling exercise, hair-care, grocery, Career, Launch, and articulation consistency gates.
- Added the founder's small, social, medium, movie, and important-call reward catalog.
- Made current reward days recalculate automatically while preserving historical reward rules.
- Included the production assistant ingestion bridge so spoken or written reports can update the existing Personal data blocks.
- Added evidence-safe Rhythm, Action, and Career checklist reopening so corrections remove only their affected progress and reward lane.
- Corrected the weekly Rewards explanation and refreshed every browser asset cache key.

## 0.6.0 - Assistant Capture and Safe Sync

- Added an authenticated assistant-to-Supabase capture path for dated Journal, Rhythm, Actions, Career progress, and Inner Command observations.
- Added one-time assistant access creation and revocation in Personal cloud settings; the local screen PIN is not a cloud credential.
- Added atomic request receipts, idempotency, evidence records, and revision-checked task and career writes to prevent stale-device overwrites.
- Kept Rewards derived from accepted evidence; daily reward review remains a deliberate action.
- Preserved existing personal block payloads and local-first behavior.

## 0.5.13 - Reliable Refresh and Covenant

- Added cache-free Supabase reads and foreground refresh on normal tab reload and resume.
- Kept the visible mobile refresh control on the conflict-safe cloud refresh path.
- Extended Inner Command from 45 to 55 days, ending November 12, 2026.
- Preserved existing kept days and breach history.

## 0.5.12 - Confirmed Historical Reviews

- Marked Personal reward reviews for Sunday September 21 through Wednesday September 24, 2026 as founder-confirmed truthful reviews.
- Reused the existing dated evidence and reward rules; no scores or evidence were invented.
- Kept Demo profiles unchanged and made the correction idempotent so it runs once.

## 0.5.11 - Career Sync Ordering

- Fixed the Career startup race that could upload a local roadmap migration before the first cloud pull completed.
- Made signed-in startup reconcile cloud Career data before scheduling any migration write.
- Reapplied required roadmap migrations only after the accepted cloud payload is loaded.
- Added a regression check that prevents startup Career autosave from moving ahead of cloud recovery again.

## 0.5.10 - Cross-device Recovery

- Fixed blank or stale phones ignoring completed desktop Career progress because local starter timestamps appeared newer.
- Added a separate remembered cloud version for every synchronized data block.
- Added safe Career recovery based on real completion evidence while preserving genuine concurrent edits as conflicts.
- Recorded successful Career, Actions, full push, and manual pull checkpoints consistently.
- Bumped every browser asset URL so iPhone Safari requests the corrected application code.

## 0.5.9 - Mobile Actions and Live Sync

- Reworked Actions mobile into a compact one-handed capture and update surface.
- Corrected the mobile action-card grid so 44-point completion controls no longer collide with action content.
- Added clearer live, saving, synchronized, and offline language.
- Added Supabase realtime block listening with an immediate page-entry check and five-second visible-page fallback.
- Applied safe remote blocks in memory without a disruptive page reload.
- Preserved locally changed blocks when the remote copy also changed.

## 0.5.8 - Mobile Career Read Mode

- Restored the full selected Career roadmap on mobile: purpose, target, modules, topics, confidence, deadlines, progress, and checklist items.
- Kept every checklist completion reversible and connected to the existing Career local-first and cloud-sync path.
- Added a thumb-friendly Career section navigator for Now, Deadlines, Roadmaps, and Full plan.
- Removed roadmap creation and editing controls from the mobile reading flow without removing any desktop capability.
- Refined mobile Career hierarchy, spacing, cards, progress signals, and 44-point completion targets.

## 0.5.7 - Mobile Freshness

- Added conflict-safe cloud freshness checks on app launch, foreground resume, and manual refresh.
- Prevented Safari back-forward cache from restoring a stale KRYOS screen.
- Added a premium iPhone shell with safe-area coverage, compact utilities, icon-led navigation, and calmer visual hierarchy.
- Preserved local-first use: cloud failures never block the app, and concurrent local/cloud edits are not silently overwritten.

## 0.5.6 - Mobile Quality

- Added mobile focus visibility, text-size resilience, reduced-motion behavior, and touch feedback.
- Prevented avoidable iPhone input zoom from small form controls.
- Preserved safe-area layout, shared records, local-first saves, and cloud status behavior.

## 0.5.5 - Mobile Reliability

- Added a mobile Settings utility path beside the shared cloud state and lock controls.
- Preserved access to active-profile backup/import, lock, privacy, and sync recovery from mobile.
- Added mobile-safe utility sizing without changing security, backup, or cloud data models.

## 0.5.4 - Rhythm Mobile

- Reworked Rhythm for fast one-handed daily foundation capture.
- Kept Nourish, Care, Spirit, hydration, weekly goals, and recovery evidence accessible.
- Reduced mobile noise by hiding the large constellation, seven-day pulse, and desktop insight panel.
- Preserved shared Rhythm events, targets, local persistence, and cloud synchronization.

## 0.5.3 - Career Mobile

- Reworked Career for a guided mobile learning path.
- Kept the current roadmap, next unfinished evidence step, deadlines, and quick checklist completion visible.
- Reduced mobile noise by hiding broad heatmaps, portfolio analytics, and full roadmap journey from the primary flow.
- Preserved shared roadmap records, completion evidence, confidence, deadlines, and career cloud synchronization.

## 0.5.2 - Actions Mobile

- Reworked the Action Vault for touch-safe iPhone use.
- Kept active capacity, deadlines, status changes, and the smallest next action visible.
- Added mobile-friendly filter scrolling, add-action controls, action cards, and edit dialog sizing.
- Preserved one shared Action Vault record across desktop and mobile with local-first save and existing cloud sync.

## 0.5.1 - Inner Command Mobile

- Reworked Inner Command for focused iPhone capture and containment review.
- Added compact mobile layouts for purpose, covenant, return guidance, and daily journal capture.
- Preserved the shared journal, containment, and evidence records across desktop and mobile.
- Kept timeline evidence available below the focused capture surface without introducing a mobile data model.

## 0.5.0 - Mobile Foundation

- Added the iPhone-focused four-destination mobile shell: Inner Command, Actions, Career, and Rhythm.
- Replaced the previous mobile navigation entries for Progress and Rewards.
- Added safe-area-aware mobile spacing, sticky top context, bottom navigation, press states, and overflow protection.
- Kept Launch, Money, Progress, and Rewards out of primary mobile navigation while preserving their desktop routes and shared records.
- Updated GitHub Pages asset cache keys to the canonical `0.5.0` version.
- Preserved local-first persistence and shared desktop/mobile data ownership.

## 0.4.30 - Multi-day Journal and Containment Import

- Imported the September 20–24 journal entries with backdated health, spiritual, and activity evidence.
- Added assistant-import support for 45-day containment kept/breach records.
- Recorded Thursday's astrology and social-feed breach honestly without treating anxiety as a breach.

## 0.004.029 - NeetCode 150 Architecture

- Reorganized DSA into the canonical 18 NeetCode 150 modules and exact 150-problem Core path.
- Added a separate Extra Practice topic to every module and preserved 72 unique problems from the previous roadmap.
- Prevented extras from inflating the NeetCode `x/150` completion score.
- Preserved existing completion evidence through normalized names and aliases such as `LCA of BST`.
- Prioritized unfinished Core problems globally before suggesting Extra Practice.
- Added separate Core and Extra progress visuals in the portfolio, roadmap header, and module journey.
- Retained topic and module deadline support inside the new structure without requiring a Supabase schema change.

## 0.004.028 - Reviewed September 19 Journal

- Imported the reviewed September 19 Radhashtami journal as an encrypted, idempotent assistant package.
- Recorded breakfast, lunch, dinner, protein shake, supplements, two litres of water, and the explicitly reported skincare components in Rhythm.
- Closed the existing STEM processing fee Action on September 19 with its real deadline and Important priority.
- Recorded the eight-hour hotel shift and eight hours of sleep while preserving DSA and system design as incomplete observations.
- Extended assistant imports to update backdated Rhythm evidence and use the journal date for completed Actions.
- Kept sunscreen and uncompleted Career work unrecorded rather than inferring evidence.

## 0.004.027 - Topic Deadline Control

- Added target dates and automatic completion timestamps to individual Career topics.
- Made topic milestones the primary delivery-score units while retaining module dates as broader checkpoints without double counting.
- Integrated topic deadline signals into Career and Progress immediately from the same live Career record.
- Limited Action deadline rewards to on-time Critical or Important completions, capped at one Responsibility evidence point per reviewed day.
- Reduced Career and Actions Supabase autosave delay from 900ms to 400ms for the single KRYOS website workflow.
- Kept the existing Supabase schema because the new fields remain inside the Career and Tasks JSON blocks.

## 0.004.026 - Deadline Control and Reward Repair

- Added optional target dates to every Career module and automatic completion timestamps when its final checklist item is finished.
- Added honest module states: scheduled, due soon, overdue, completed on time, and completed late.
- Added a finalized 0–100 delivery score, on-time rate, upcoming deadline lane, and module deadline analytics in Career and Progress.
- Added on-time module completion as bounded Career evidence without bypassing the existing daily category cap.
- Reworked Rewards to select the latest evidence day, expose qualification gates, save credits locally first, and describe cloud failures precisely.
- Kept Supabase storage schema unchanged because module dates live inside the existing Career JSON block.

## 0.004.025 - Career Responsive Fit

- Removed fixed-width pressure from Career roadmaps, phase metadata, modules, topics, and checklist rows.
- Added a compact intermediate layout for laptop-width screens before the narrow stacked layout begins.
- Preserved intentional horizontal scrolling only for the year heatmap and roadmap journey.
- Verified immediate local persistence and retained the debounced Supabase Career-block autosave with visible status.

## 0.004.024 - API Design Roadmap

- Imported the complete nine-phase API Design and Backend Engineering roadmap.
- Preserved the 80% coding, 20% theory learning contract and all 20 fixed interview questions.
- Added goal, core-pattern, and difficulty metadata to phased Career roadmaps.
- Added separate Theory, Build, and Interview Gate evidence lanes with every item initially unchecked.
- Added a one-time migration so the roadmap reaches the existing personal profile and cloud block.

## 0.004.023 - Cross-Feature Integration

- Added a persistent global cloud-state signal across every active workspace.
- Added visible reward provenance for Inner Command, Actions, Career, Launch, Rhythm, and Money.
- Verified that all active workspaces feed one capped, manually confirmed daily reward review.
- Preserved the existing strict score caps, qualification floor, cooldowns, and Supabase transaction boundary.

## 0.004.022 - Complete DSA Roadmap

- Imported 163 DSA problems across 14 focused topics.
- Reset every imported problem to unchecked, ignoring stale document completion labels.
- Grouped the roadmap into pattern foundations, core data structures, and advanced algorithms.
- Added a one-time profile migration so existing personal data receives the roadmap and syncs it to Supabase.

## 0.004.021 - Reward Sync Feedback

- Added an immediate syncing state beside the Reward ledger button.
- Added an explicit successful zero-data message when no qualifying daily review exists yet.
- Added the cloud-confirmed credit balance after a populated ledger sync.

## 0.004.020 - Self-Hosted Supabase Client

- Bundled the official Supabase browser client inside the KRYOS repository.
- Removed runtime dependence on third-party CDN execution for authentication and cloud sync.

## 0.004.019 - Supabase CDN Compatibility

- Switched the official Supabase v2 browser client to its documented unpkg distribution.
- Avoided the jsDelivr execution failure observed on the deployed GitHub Pages app.

## 0.004.018 - Supabase Client Restoration

- Restored the official Supabase JavaScript v2 browser client on GitHub Pages.
- Fixed the false “Supabase library did not load” failure before credential validation.
- Kept the publishable browser key protected by the existing row-level security policies.

## 0.004.017 - Music Reward and Ledger Guidance

- Added one 30-minute music session as a four-credit reward after two qualifying days.
- Added a three-day cooldown so music remains an occasional reward.
- Added an explicit cloud-account status and direct Cloud settings action to the reward ledger.
- Clarified that running the Supabase migration does not sign a browser into Supabase.

## 0.004.016 - Unified Evidence Rewards

- Added one reviewed score across Career Launch, Career Skills, Actions, Money, Rhythm, Inner Command, and Journal.
- Added bounded daily credits, a five-day consistency bonus, and sustained-day gates for larger rewards.
- Replaced automatic effort points with auditable evidence and retained the original rules for historical reviews.
- Aligned the astrology boundary with the 45-day Inner Command covenant: lapses pause progress without erasing prior kept days.
- Added an idempotent Supabase reward ledger and atomic redemption function.
- Added a premium reward dashboard with weekly cadence, evidence drill-down, covenant progress, targets, and audit history.

## 0.004.015 - Network and Visibility

- Added a dedicated Network and Visibility module inside Career Launch.
- Added meaningful connection requests, messages, comments, follow-ups, referral asks, and career conversations.
- Added a two-published-posts-per-week target with a visible seven-day cadence.
- Kept drafts visible while allowing only published posts to satisfy exposure and weekly publishing targets.
- Added connection and post evidence to the unified Launch timeline and synced task block.

## 0.004.014 - Career Launch

- Added a dedicated Launch page so career learning cannot postpone market exposure.
- Added weekday application, connection, message, follow-up, and visibility evidence.
- Added a configurable platform circuit with LinkedIn, Built In, Glassdoor, Indeed, company sites, and custom sources.
- Added self/AirPods and AI mock interview sessions with a 3–6 weekly target.
- Added parallel-lane guidance, weekly pulse, 12-week exposure field, application pipeline, and evidence timeline.
- Stored all source events in the existing Supabase-synced task block.

## 0.004.013 - Inner Command

- Reframed Journal as one page for sacred purpose, strict containment, and truthful daily evidence.
- Added concise Rama, Sita, and Hanuman principles for direction, protected energy, and service.
- Added the September 19 to November 2, 2026 45-day covenant with an auditable day grid.
- Added boundaries for astrology seeking, Instagram/Snapchat, and validation-seeking contact.
- Treated anxiety and cravings as return signals rather than automatic failures.
- Stored daily kept/breach records in the existing cloud-synced task block.

## 0.004.012 - Responsibility Recovery

- Added a separate Money page focused on one friend-credit responsibility.
- Added contact logging, next follow-up scheduling, promise tracking, payment records, interest adjustments, and card snapshots.
- Added premium responsibility-orbit, balance movement, contact-rhythm, card-health, and accountability-versus-recovery visuals.
- Kept credit-card position separate from the amount the friend owes.
- Stored source records in the existing synced task block, with analytics derived at render time.

## 0.004.011 - Sustainable Rhythm

- Added one Rhythm workspace for Daily Health, Weekly Health, and Spiritual Practice.
- Separated ten essential daily foundation actions from optional spiritual opportunities.
- Added weekly goal tracks for exercise, hair care, and groceries without assigning arbitrary weekdays.
- Added a 28-day Body/Care/Spirit constellation, sustainable foundation streak, recovery average, and weekly rhythm.
- Stored only source events inside the existing synced task block; all visual analytics are derived at render time.
- Added immediate local persistence and the existing debounced Supabase task-block synchronization.

## 0.004.010 - Career Evidence Command Center

- Restored Career as a first-class desktop workspace without mixing in job search or interview preparation.
- Added a seven-day qualified-work pulse and a 52-week Career evidence field derived from roadmap completions.
- Added roadmap journey, coverage-versus-confidence, skill portfolio, and current-module focus views.
- Preserved the existing single-pencil roadmap editor and the current Supabase career block, requiring no database migration.
- Kept detailed analytics in Career and limited global Progress to a compact Career summary.

## 0.004.009 - Premium Action Surface

- Rebuilt Actions with a stronger command hierarchy, calm task rows and human-readable deadline urgency.
- Added a clear three-slot active-capacity visualization without changing the existing containment rule.
- Replaced browser prompts with a focused editor for title, next action, domain, priority, status and deadline.
- Added immediate local persistence followed by debounced Supabase task-block synchronization when signed in.
- Added honest on-device, saving, cloud-saved and cloud-unavailable status feedback.
- Preserved the single Action Vault, existing records, filters and three-action active limit.

## 0.004.008 - Reviewed Action Import

- Imported the 13 reviewed actions from notebook page one into the personal Action Vault.
- Preserved explicit deadlines for STEM processing, the USCIS call, October payroll, the haircut, timesheet update and ADP bank-account change.
- Recorded the remaining part-time work payment as approximately $225-$226.
- Used a stable assistant package identifier so refreshes and future releases cannot duplicate the imported actions.

## 0.004.007 - Visual Momentum

- Rebuilt Journal as a focused daily-capture surface with autosave state, a writing canvas and evidence-led timeline cards.
- Added daily action/domain/rhythm context without requiring extra input.
- Added a premium Progress command band for weekly momentum, current streak and weekly action volume.
- Added personal records for evidence days, strongest day, leading domain and strictly qualified days.
- Added an accessible 28-day effort-pulse chart with exact values available to assistive technology.
- Rebuilt the 12/52-week contribution field with five evidence intensities, filters, selected-day inspection and period summary.
- Upgraded domain analytics with 14-day micro-trends and distinct visual accents.
- Preserved Journal as the only capture surface and retained all existing personal data.

## 0.004.006 - Containment Economy

- Separated completed-action evidence from spendable reward credits.
- Added a reviewed 10-point daily discipline score with a hard two-credit daily cap.
- Added bounded weekly consistency bonuses: two credits for five qualified days, three for six and five for seven.
- Required meaningful priority progress for a day to qualify, preventing routine-task inflation.
- Added the September 19 to November 2, 2026 containment covenant.
- Removed astrology from the reward shop; access now requires 36 qualified days, no unresolved extension and an approved Day-45 review.
- Added a three-day covenant extension for each recorded astrology-seeking breach.
- Added transparent recent scorecards and daily/weekly credit provenance to Rewards.

## 0.004.005 - Effort Reinforcement

- Added the Action Vault as the single persistent system for long-lived responsibilities.
- Added Open, Active, Waiting and Done states, three-item active capacity, priorities, optional deadlines and smallest next actions.
- Extended reviewed journal packages to add, update and complete the same Action Vault records without duplication.
- Restored Rewards without restoring the old operational complexity.
- Reviewed completed actions earn 1-5 effort credits; observations earn none.
- Added nine user-relevant rewards, explicit costs, redemption controls and reward history.
- Added 14-day activity graphs for every recorded domain alongside the heatmap and totals.
- Kept Journal as the only input surface; Progress and Rewards remain read/redeem surfaces.

## 0.004.004 - Journal Foundation

- Reduced the visible application to Journal and Progress.
- Corrected `9619` to open the personal profile instead of an empty demo profile.
- Removed first-run setup, recovery controls, Supabase loading and links into hidden feature areas.
- Simplified Progress to journal days, completed actions, journal streaks, domain totals and a completion calendar.
- Preserved the older feature data and implementation outside the active navigation for possible later reuse.
- Added asset versioning so GitHub Pages does not reuse stale JavaScript after a release.
- Verified the September 17 entry imports once with 17 completed actions and drives the Progress view.

## 0.004.003 - Assistant-Maintained Progress

- Added a repository-maintained feed for reviewed, non-private journal outcomes.
- New packages import exactly once into the existing personal profile after unlock.
- Added Day 1 records for September 17, 2026 across food, personal, spiritual, skincare, supplements, career and mood.
- Defined the KRYOS day as 7:00 AM through 6:59 AM and kept civil calendar calculations stable.
- Validation: nine data tests and the isolated desktop/mobile browser workflow passed.
- Structured records are encrypted before entering the public repository; raw journal images and full private notes are excluded.

## 0.004.002 - Visual Progress

- Added a daily outcome finish line, weekly status strip and full-history personal-best streaks.
- Split calendar measures into outcomes, timed focus and journal domains, with 12/52-week views.
- Added a saved reward selection and VP progress bar, separate from lifetime VP.
- Added calendar-week focus bars, reduced-motion support and responsive controls.
- See docs/releases/0.004.002.md for calculation rules and limitations.

## 0.004.001 - Journal and Progress

- Added text journal, locally saved drafts, dated life records and timeline search.
- Added JSON import validation, evidence preview, confirmation and duplicate package rejection.
- Added progress calendar, scheduled streaks, VP level display, timer bars and domain summaries.
- Schedule changes take effect tomorrow; historical schedules are retained.
- Journal-reported duration stays separate from timer duration to avoid double counting.
- New data is included in the existing task block export and manual sync path.
- Validation: four data tests and isolated desktop/mobile browser workflow checks passed.
- Not yet implemented: media storage, automatic transcription, reviewed import VP awards,
  specialized health charts and feature-proposal management. No cloud round-trip was performed.

## 0.004.000 - Directed Attention

Date: 2026-09-17

### Changed

- Replaced the broad dashboard navigation with Today, Focus, Redirect, Rewards, Project, Weekly Review, and Settings.
- Reframed KRYOS from a journal-heavy life dashboard into a behavior-routing execution system.
- Reduced Today to one outcome, one first physical action, two optional support tasks, and four non-negotiables.
- Added separate Build and Analyze focus modes with five- and twenty-five-minute sessions.
- Added redirect flows for urges, distraction, slips, and minimum viable recovery.
- Added one-breakthrough-project constraints and artifact shipping.
- Added a weekly evidence review instead of another planning surface.

### Data

- Added normalized behavior state inside the existing task block.
- Added append-only point events with idempotency keys and daily caps.
- Existing personal data, export/import, profile separation, and Supabase push/pull remain compatible.
- No database migration is required.

### Verification

- JavaScript syntax check passed.
- Diff whitespace check passed.
- Desktop browser smoke test confirmed the new navigation and Today command screen render.

### Known Limitations

- Focus countdown state is not restored after closing the page.
- Supabase synchronization remains manual push/pull.
- Historical legacy data remains stored for compatibility but is not exposed in primary navigation.

## 0.003.001 - Manual Supabase Sync

Date: 2026-07-07

### Added

- Supabase project URL and publishable key configuration.
- Settings email/password Supabase sign-in.
- Manual push from this device to Supabase.
- Manual pull from Supabase to this device.
- SQL schema file for one-time Supabase setup.

### Known Limitations

- You must paste `supabase-schema.sql` into Supabase SQL Editor before sync works.
- First sync is manual push/pull, not automatic realtime sync.

## 0.003.000 - Free Sync Foundation

Date: 2026-07-06

### Added

- Settings sync readiness panel with status, safe blocks, local checks, dry run, and disabled Supabase connection action.
- Profile-aware sync state in local storage.
- Sync payload preview that includes safe data blocks only.
- Supabase schema documentation.
- Sync auth model documentation.
- Sync conflict behavior documentation.

### Changed

- Version identity moved to `0.003.000`.
- Sync plan now separates completed foundation work from unproven remote sync.
- Supabase backend ADR is accepted for prototype, not public production.

### Verification

- `app.js` syntax check passed.
- Static review confirmed the sync preview excludes security/session storage keys.
- Browser smoke check confirmed Settings sync panel renders on desktop and narrow mobile width without horizontal overflow.

### Known Limitations

- Supabase is not connected yet.
- Demo profile has not completed phone/laptop round-trip sync.
- Personal sync remains intentionally blocked.

## 0.002.002 - Manual QA Hardening

Date: 2026-07-06

### Added

- Active profile badge in the desktop topbar.
- Active profile identity in Settings product identity.
- Demo walkthrough script for safe product sharing.
- Sync boundary ADR.
- Free backend choice ADR.

### Changed

- Version identity moved to `0.002.002`.
- Product roadmap and backlog now reflect completed GitHub setup and manual QA hardening.
- Sync plan now references accepted/planned architecture decisions before implementation.

### Verification

- Real-file Personal/Demo profile QA was manually confirmed by the product owner.
- `app.js` syntax check passed.
- Browser-isolated profile QA from `0.002.001` remains valid.

### Known Limitations

- Sync is not implemented.
- GitHub milestones exist, but GitHub Projects board automation is not configured.

## 0.002.001 - Profile Login Correction

Date: 2026-07-06

### Added

- Demo profile opens from the lock screen with fixed demo credentials.
- Demo data is seeded automatically without a demo setup flow.
- Demo profile has configured lock behavior by default.
- Settings shows a fixed demo credential notice when inside Demo.

### Changed

- Removed the in-app Personal/Demo switch from Settings.
- Personal credentials are checked before demo credentials to avoid accidental Personal lockout if credentials collide.
- In-app version moved to `0.002.001`.

### Verification

- `app.js` syntax check passed.
- Static scan confirmed the old Settings switch hooks were removed.
- Mocked login simulation confirmed PIN `9619` opens Demo and creates a demo session.
- Browser QA passed on an isolated local test origin: test Personal PIN opened Personal, demo PIN `9619` opened Demo, Demo pages loaded sample data, and active-profile backup labels/export notices appeared correctly.

### Known Limitations

- Browser visual QA still needs to be completed in a reliable local browser session.
- Demo uses a fixed local showcase PIN, not a server-authenticated account.

## 0.002.000 - Private Mode Separation

Date: 2026-07-06

### Added

- Personal/Demo data space selector in Settings.
- Separate Demo Mode storage keys for Foundation, Career, Tasks, Journal, Security, UI state, and session state.
- Safe demo seed data for interview and walkthrough use.
- Persistent Demo Mode badge to prevent accidental personal-data exposure.
- Rebuild demo sample data action.
- Backup metadata for active account mode and space label.

### Changed

- Backup export now exports only the active space.
- Backup import now imports only into the active space.
- Reset now clears only the active space.
- Backup format moved to version `3`.
- In-app version moved to `0.002.000`.

### Verification

- `app.js` syntax check passed.
- Static scan confirmed mode-aware storage routing.
- Mocked startup smoke test confirmed Demo seeds only `kryos-demo-*` data keys.

### Known Limitations

- Free cloud sync is not implemented.
- Browser visual QA still needs to be completed in a reliable local browser session.

## 0.001.005 - Private Stabilization

Date: 2026-07-06

### Added

- Company-level documentation system.
- In-app product identity panel in Settings.
- In-app release notes and next milestone card.
- Version policy for long-term private product development.
- Product, design, architecture, QA, release, and project-management docs.
- GitHub-style issue and pull request templates.

### Changed

- Career roadmap UX now uses one roadmap-level edit toggle instead of many visible edit controls.
- Career checklist text is read-only by default.
- Today task views are simplified by removing the duplicate visible `Anytime` tab.
- Backup format moved to version `2` and includes UI state.
- Manual lock behavior is stricter after refresh.
- Date handling is stabilized for local date keys.

### Fixed

- Manual lock could be bypassed by refresh when startup locking was disabled.
- Date-only values could shift backward because of timezone parsing.
- Mobile layout gained safe-area and overflow protection.

### Verification

- `app.js` syntax check passed.
- Date logic test passed.
- Security session logic test passed.
- Static scans passed for old Career edit controls.

### Known Limitations

- Browser visual QA could not be completed inside the in-app browser sandbox for local URLs.
- Free cloud sync is not implemented.
- Personal/demo separation is not implemented yet.
# 0.10.0 - Statement evidence and interest pressure

- Added private, deduplicated statement-cycle ingestion through the assistant bridge.
- Added premium balance, interest, APR, minimum-payment, and payoff-pressure visuals to Money.
- Kept raw PDFs out of browser state and GitHub; only structured financial facts sync privately.
