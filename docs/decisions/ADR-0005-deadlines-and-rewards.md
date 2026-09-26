# ADR-0005: Module Deadlines and Local-First Rewards

Status: accepted for `0.004.026`.

## Context

KRYOS needs to externalize time without turning every checklist item into another planning burden. Career modules are the smallest useful milestone boundary. The reward flow also appeared broken because qualification rules and cloud confirmation were hidden from the user.

## Decision

- A Career roadmap may have a broad target date; every module may independently have an optional target date.
- Individual checklist items do not receive dates.
- Completing the final checklist item records the module completion time automatically. Reopening the module clears that completion time.
- Deadline state is derived from stored facts: unscheduled, scheduled, due soon, overdue, completed on time, or completed late.
- The delivery score is finalized only for completed dated modules: `100` when on time or early; otherwise `max(40, 100 - 6 * daysLate)`.
- The overall delivery score is the average of finalized module scores. Open work never pretends to have a final performance score.
- On-time module completion is Career evidence, but Career remains capped at two evidence points per daily reward review.
- Daily reward credits are calculated and stored locally immediately after explicit review. Supabase mirrors awards and confirms redemptions; cloud availability does not erase locally earned credits.

## Product Rationale

CHADD recommends externalizing time and making deadlines visible for ADHD time-management challenges. Atlassian's project guidance supports milestones, timelines, overdue-work visibility, and burndown-style early warning. KRYOS adopts those principles at personal scale without importing enterprise project-management complexity.

## Sources

- CHADD, “Understanding and Applying the Science of Time Management”: https://chadd.org/webinars/understanding-and-applying-the-science-of-time-management/
- CHADD, “Time Management and ADHD: Day Planners”: https://chadd.org/for-adults/time-management-planner/
- Atlassian, “How to Track Project Progress”: https://www.atlassian.com/work-management/project-management/project-progress
- Atlassian, “Agile Burndown Chart”: https://www.atlassian.com/agile/tutorials/burndown-charts
