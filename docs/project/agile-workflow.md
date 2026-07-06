# Agile Workflow For KRYOS

KRYOS should use lightweight agile tracking.

Jira is useful in companies, but it is too heavy for the current stage. Use GitHub Issues and GitHub Projects first.

## Work Hierarchy

```text
Vision
  -> Roadmap
    -> Epic
      -> Feature
        -> Task
          -> Bug / Improvement
```

## Issue Types

- Epic: large product phase.
- Feature: user-visible capability.
- Task: implementation work.
- Bug: broken behavior.
- Design: UI/UX decision or cleanup.
- Architecture: technical structure or data decision.
- Documentation: docs, release notes, or process.

## Status Columns

Use these columns in GitHub Projects:

- Inbox
- Ready
- In Progress
- Review
- QA
- Done
- Deferred

## Recommended Fields

- Area: Foundation, Career, Today, Habits, Journal, Progress, Settings, Field Mode, Docs, Architecture.
- Type: Epic, Feature, Task, Bug, Design, Documentation.
- Priority: P0, P1, P2, P3.
- Version: target version.
- Risk: Low, Medium, High.

## Sprint Rule

For now, use mini-sprints of 3 to 7 days.

Each sprint should have:

- 1 main outcome
- 3 to 7 issues maximum
- no more than 1 risky architecture change

## Definition Of Ready

An issue is ready when:

- owner page is clear
- success criteria are clear
- data ownership is clear
- scope is small enough to finish

## Definition Of Done

An issue is done when:

- code is implemented
- no duplicate behavior introduced
- manual QA is complete
- docs updated if needed
- changelog updated for user-facing changes

