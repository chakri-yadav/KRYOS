# Product Backlog

This backlog starts after `0.002.001`.

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
- QA: confirm Personal PIN opens Personal and demo PIN opens Demo. Pending browser/manual QA.

## Epic: GitHub Product Setup

Target: `0.002.002`

- Task: create private GitHub repo.
- Task: add GitHub Project board.
- Task: add labels for type, area, priority, and risk.
- Task: create first milestone for `0.002.001`.

## Epic: Free Sync Planning

Target: `0.003.000`

- Architecture: define Supabase sync schema.
- Security: define what must not sync.
- Feature: add last synced status.
- Feature: add manual sync trigger.
- QA: test phone/laptop sync with demo data first.
