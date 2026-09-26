# ADR-0006: Topic deadlines and single-app synchronization

Status: accepted for `0.004.027`.

## Context

KRYOS is currently one GitHub Pages web application backed by one Supabase project. Career modules can contain many topics and questions, so module-only deadlines are too coarse. The active pages must also reflect a saved change without manual refresh.

## Decision

- Store `targetDate` and `completedAt` on Career topics inside the existing Career JSON block.
- Use dated topics as the primary delivery-score units. Score a dated parent module only when it has no dated topics, preventing double counting.
- Update Career, Progress, and Rewards from the same in-memory state immediately; then persist locally and autosave the changed Supabase block after a 400ms debounce.
- Award the capped Responsibility evidence point only for an Action that is Critical or Important, has a real deadline, and is completed no later than that deadline.
- Treat GitHub Pages as code hosting and Supabase as persistence. No mobile or multi-device synchronization behavior is added in this release.

## Consequences

Existing Career data migrates when loaded because missing topic fields normalize to empty values. No SQL migration is required. Fine-grained deadlines are visible without inflating scores through parent and child milestones.
