# Product Backlog

This backlog starts after `0.002.002`.

## Done: Phase 1 Stabilization Finish

Target: `0.001.006`

- Bug: complete visual QA in browser.
- Task: add in-app version identity in Settings. Done in `0.001.005`.
- Task: add release notes panel. Done in `0.001.005`.
- QA: run full manual test plan.
- Documentation: update release note after QA.

## Done: Personal And Demo Separation

Target: `0.002.000`

- Architecture: define account mode storage key strategy. Done in `0.002.000`.
- Feature: add Personal/Demo mode selector. Done in `0.002.000`.
- Feature: add demo seed data. Done in `0.002.000`.
- Feature: add Demo Mode badge. Done in `0.002.000`.
- Feature: add reset demo data. Done in `0.002.000`.
- QA: confirm personal export cannot include demo data and demo export cannot include personal data. Pending browser/manual QA.

## Done: Profile Login Correction

Target: `0.002.001`

- Feature: open Demo from lock screen credentials. Done in `0.002.001`.
- Task: remove in-app Personal/Demo Settings switch. Done in `0.002.001`.
- Task: keep demo credentials fixed for showcase access. Done in `0.002.001`.
- QA: confirm Personal PIN opens Personal and demo PIN opens Demo. Done in `0.002.002`.

## Done: GitHub Product Setup

Target: `0.002.002`

- Task: create private GitHub repo. Done.
- Task: add labels for type, area, priority, and risk. Done.
- Task: create milestones for `0.002.002` and `0.003.000`. Done.
- Task: create first backlog issues. Done.

## Done: Manual QA Hardening

Target: `0.002.002`

- Feature: active profile badge polish. Done in `0.002.002`.
- Documentation: demo walkthrough script. Done in `0.002.002`.
- Architecture: sync boundary ADR. Done in `0.002.002`.
- Architecture: free backend choice ADR. Done in `0.002.002`.

## Done: Free Sync Foundation

Target: `0.003.000`

- Architecture: define Supabase sync schema. Done in `0.003.000`.
- Security: define what must not sync. Done in `0.003.000`.
- Architecture: define sync auth model. Done in `0.003.000`.
- Architecture: define conflict behavior. Done in `0.003.000`.
- Feature: add sync readiness status. Done in `0.003.000`.
- Feature: add local dry-run trigger. Done in `0.003.000`.

## Epic: Demo Sync Prototype

Target: `0.003.001`

- Task: create Supabase Free project.
- Task: apply schema and RLS policies.
- Task: add environment/config loading for Supabase URL and anon key.
- Feature: write Demo profile blocks to Supabase.
- Feature: read Demo profile blocks from Supabase.
- QA: test phone/laptop sync with Demo data first.
- Guardrail: Personal sync stays blocked until Demo round trip is proven.
