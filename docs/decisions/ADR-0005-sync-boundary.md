# ADR-0005 - Sync Boundary

Date: 2026-07-06

## Status

Accepted for planning. No sync implementation is approved yet.

## Context

KRYOS is local-first and currently stores data in browser local storage. The product now has separate Personal and Demo profiles. Before any backend work, the sync boundary must be explicit so phone/laptop sync does not damage private data or mix demo records with personal records.

## Decision

KRYOS will use block-level sync for the first sync prototype.

The first syncable blocks are:

- Foundation
- Career
- Tasks and habits
- Journal entries
- UI metadata that is safe to recreate

The first non-sync blocks are:

- active security session
- local lock timing state
- raw recovery answers
- browser-only temporary state
- any future secret or token

Personal and Demo must sync as separate profiles. Demo data must never merge into Personal data.

## Conflict Rule

The first prototype will not attempt silent conflict merging. If phone and laptop both edit the same block after the last sync, KRYOS must preserve both versions and show a conflict warning before replacing data.

## Rollback Rule

Export/import remains the rollback path. Sync cannot ship unless a user can export the current local state before enabling sync.

## Consequences

- Sync is slower to build, but safer.
- The data model remains understandable.
- KRYOS avoids pretending to be multi-user before the privacy model is ready.
- A backend decision can now be made against a clear boundary.
