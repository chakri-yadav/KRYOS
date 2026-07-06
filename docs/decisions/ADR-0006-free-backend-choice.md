# ADR-0006 - Free Backend Choice

Date: 2026-07-06

## Status

Proposed. Build is blocked until manual QA hardening is complete.

## Context

KRYOS needs basic laptop/phone sync eventually, but the user is a student and the system must stay free or near-free. The backend must support private personal data, profile separation, and a rollback path.

## Options Considered

### Supabase Free

Pros:

- free hosted Postgres tier
- authentication included
- row-level security
- browser-friendly client
- easy JSON block storage

Risks:

- security rules must be correct
- schema discipline is required
- free tier limits must be monitored

### Firebase Free

Pros:

- generous free tier
- strong client ecosystem
- realtime sync is mature

Risks:

- data model can become loose
- rules language must be learned carefully
- vendor lock-in can grow quickly

### GitHub-Backed Private JSON

Pros:

- already has private repo
- excellent audit history
- no new backend account needed

Risks:

- poor mobile UX
- awkward auth
- not a real app sync model
- easy to create merge conflicts

### Export/Import Only

Pros:

- safest
- free
- no privacy expansion

Risks:

- not enough for real phone/laptop daily use
- depends on discipline

## Decision

Supabase Free is the first backend candidate for a prototype only.

The prototype should store each major KRYOS block as profile-scoped JSON first. Do not normalize the full domain model until repeated usage proves which queries matter.

## Non-Goals

- public launch
- multi-user collaboration
- paid infrastructure
- syncing secret/session state
- replacing export/import

## Exit Criteria Before Build

- real-file Personal/Demo QA completed
- backup/export still works
- sync boundary ADR accepted
- rollback process documented
- one small prototype branch planned
