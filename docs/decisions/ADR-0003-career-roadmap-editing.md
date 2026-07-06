# ADR-0003: Career Roadmaps Are Read-First

Status: accepted

Date: 2026-07-06

## Context

Career roadmaps were becoming too editable by default. Modules, topics, and checklist items looked like form controls, which made the page feel messy.

The intended experience is progress visualization first, editing second.

## Decision

Career roadmap detail is read-first.

- One roadmap-level pencil opens editing.
- Modules and topics show text by default.
- Checklist text is read-only by default.
- Checklist completion remains available in read mode.
- Add/delete/rename controls appear only in edit mode.

## Consequences

Positive:

- cleaner roadmap experience
- less accidental editing
- more premium visual feel
- stronger page ownership

Negative:

- editing requires one extra step
- some power users may want inline editing later

