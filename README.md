# KRYOS

KRYOS is a private directed-attention operating system. It converts intention, distraction, urges, and setbacks into small physical actions that produce visible evidence.

It is not a generic todo app, journal, or habit tracker. KRYOS is designed to help one person choose one outcome, enter focus quickly, redirect impulses, recover from slips, and advance one breakthrough project without turning self-improvement into more reading.

## Current Status

- Version: `0.6.0`
- Stage: Assistant Capture and Safe Sync
- Audience: private personal daily use
- App type: local-first browser application
- Sync status: local-first with Supabase task, career, and reward paths configured
- Backend status: Personal assistant ingestion and revision-checked task/career writes use Supabase; a private assistant token is required for direct capture

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
- Existing task and career blocks still own behavior state. Version 0.6.0 adds a metadata and assistant-event migration without replacing those blocks.

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
