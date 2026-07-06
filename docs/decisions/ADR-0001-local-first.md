# ADR-0001: Local-First Before Sync

Status: accepted

Date: 2026-07-06

## Context

KRYOS needs to work for daily private use before it becomes a synced or public product.

Cloud sync is valuable, but it multiplies data bugs if local behavior is not stable first.

## Decision

KRYOS remains local-first until Phase 1 stabilization is complete.

## Consequences

Positive:

- faster private iteration
- no hosting cost
- lower setup complexity
- better focus on product behavior

Negative:

- laptop and phone do not share data automatically yet
- backup discipline is required
- local storage can be cleared by the browser

## Follow-Up

Before sync:

- finish personal/demo separation
- verify export/import
- define sync schema
- document privacy model

