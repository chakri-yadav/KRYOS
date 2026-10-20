# KRYOS

A desktop-first directed-attention workspace connecting daily commitments, journal evidence, routines, learning roadmaps and progress.

## Current status

The shared foundation, daily pages, learning workspace and supporting pages follow the [accepted design contract](docs/design/visual-contract-v1.md). See [supporting-page acceptance](docs/qa/supporting-visual-acceptance.md) and [Career/workspace acceptance](docs/qa/career-marketing-visual-acceptance.md). Whole-app acceptance and dark-mode activation remain separate milestones.

- Hosted release: **0.50.0**. Laptop release: **0.33.0**.
- Current phase: selected-day workflows, journal corrections and guarded block-conflict resolution completed for desktop scope.
- Hosted personal records: browser copies with signed-in Supabase synchronization.
- Marketing: laptop-only job records and files; hosted progress receives only explicitly requested dated aggregate statistics.
- Career: local-service storage on the laptop; separate Supabase-backed hosted copy.
- Phone acceptance: deferred by the owner; not represented as tested or required for desktop closeout.
- Documentation-only closeout does not change application versions, private data, credentials or storage.

## Current product records

- [Current runtime and storage ownership](docs/architecture/current-runtime.md)

- [Active backlog](docs/project/backlog.md)
- [Desktop acceptance evidence and test limits](docs/qa/desktop-history-sync-acceptance.md)
- [Current sync plan](docs/architecture/sync-plan.md)
- [Conflict resolution contract](docs/architecture/sync-conflicts.md)
- [Version policy](VERSION.md)

The active backlog separates shipped work from deferred work. Older prototype plans are archived rather than treated as live requirements.

## Product Promise

KRYOS should answer three questions in the moment:

1. What is the one outcome that matters now?
2. What is the smallest physical action I can start?
3. When attention breaks, where should it be redirected?

## Core Areas

- Journal: saved drafts, free writing, structured life records, reviewed JSON imports and search.
- Progress: 84-day activity grid, scheduled streaks, existing VP totals, focus history and domain counts.
- Import contract and current limits: `docs/journal-import.md`.
- Assistant ingestion implementation and deployment: `docs/architecture/assistant-ingestion-implementation.md`.
- Money: private historical checkpoint plus dated card payments, reimbursements, posted statement interest, reconciliation, and clearly provisional APR estimates. The user still needs statement evidence for new cycles; the app never treats a projection as an issuer charge.

- Today: one outcome, one first action, at most two support tasks, and four daily non-negotiables.
- Focus: a five- or twenty-five-minute build/analyze session with visible output.
- Redirect: short protocols for urges, distraction, slips, and minimum viable recovery.
- Rewards: Alignment XP earned only from verified behaviors, with explicit reward costs.
- Project: one breakthrough project, its next physical action, and shipped artifacts.
- Weekly Review: read-only evidence for build ratio, redirects, slips, artifacts, and recovery.
- Settings: privacy, lock behavior, export, import, and reset.

## Product Rules

- One page owns one decision.
- The system must route behavior, not merely describe it.
- One breakthrough project is active at a time.
- Build time and analyze time are measured separately.
- XP comes from append-only behavior events; totals are derived, never manually edited.
- A slip never creates negative points. Recovery is always available.
- Weekly Review reads evidence; it does not create work.
- Personal and demo storage remain separated.
- Existing task and career blocks still own behavior state. Version 0.7.0 adds the 48-day commitment cycle and evidence-derived reward rules without replacing those blocks.

## Documentation Map

- Product: `docs/product/`
- Design: `docs/design/`
- Architecture: `docs/architecture/`
- Decisions: `docs/decisions/`
- QA: `docs/qa/`
- Releases: `docs/releases/`
- Project workflow: `docs/project/`

## Development Principle

KRYOS is being built like a company product, even while it is private. Every major feature should have:

- clear owner page
- reason for existence
- expected user behavior
- data ownership
- QA checklist
- release note
