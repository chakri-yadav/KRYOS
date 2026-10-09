# KRYOS
\n+0.28.3 gives the promise to Devi Mother stronger visual prominence and readable premium styling.
\n+0.28.2 adds the always-visible 48-day Sadhana journey map, keeping days won separate from elapsed time.

0.28.1 adds the premium Daily Command interface with readable promises, shared must-do cards and stable editing controls.

Inner Command 0.28.0 adds a 48-day Sadhana cycle, dated must-do commitments shared with Actions, quantity targets, multi-boundary records, and audited daily battle review.

Career 0.27.0 supports the updated Debugging studio: numbered exercises, mixed sessions, optional reinforcement, read-only field guides and diagnostic evidence notes.

Career 0.26.0 supports phased workplace-learning roadmaps, workplace-language reference cards, safe simulation checklists, readiness gates and private practice evidence.

Career visual release 0.25.1: a focused learning studio with one next action, roadmap-specific visual lanes, collapsible modules, and retained progress/editing. No data migration.

KRYOS is a private directed-attention operating system. It converts intention, distraction, urges, and setbacks into small physical actions that produce visible evidence.

It is not a generic todo app, journal, or habit tracker. KRYOS is designed to help one person choose one outcome, enter focus quickly, redirect impulses, recover from slips, and advance one breakthrough project without turning self-improvement into more reading.

## Current Status

- Version: `0.25.0`
- Stage: Marketing cloud sync reconciliation and assistant batch import
- Audience: private personal daily use
- App type: local-first browser application
- Marketing: batches and application records sync to the Personal Supabase profile; attached file bytes remain in the browser's local file store and are not yet cross-device or cloud-backed.
- Sync status: local-first with revision-checked Supabase sync for core records and Marketing; successful sign-in pulls fresh Personal data and starts Realtime/foreground refresh
- Backend status: assistant ingestion supports journal, actions, rhythm, career, money statements, and Marketing batch imports; the encrypted assistant credential stays out of GitHub

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
- Existing task and career blocks still own behavior state. Version 0.7.0 adds the 48-day Devi Sadhana and evidence-derived reward rules without replacing those blocks.

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
