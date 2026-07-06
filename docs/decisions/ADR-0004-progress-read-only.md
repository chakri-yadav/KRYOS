# ADR-0004: Progress Is Read-Only

Status: accepted

Date: 2026-07-06

## Context

Progress dashboards can become fake if they require separate manual input.

KRYOS progress should show what the user actually did in Today, Habits, Journal, and Career.

## Decision

Progress is read-only.

It derives evidence from:

- task records
- habit records
- journal entries
- career activity log

## Consequences

Positive:

- one source of truth
- less duplicated input
- more trustworthy analytics

Negative:

- Progress depends on the quality of upstream records
- missing data upstream means weak analytics

