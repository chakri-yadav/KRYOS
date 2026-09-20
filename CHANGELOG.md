# Changelog

All notable KRYOS changes should be recorded here.

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
