# KRYOS Mobile Product Specification

## Purpose

KRYOS mobile is a focused iPhone experience for the founder's ADHD support
workflow. It is for arriving, choosing the next action, recording evidence,
and returning after drift. It is not a compressed copy of the desktop app.

## Target

The first target is iPhone 15 Plus in Safari, portrait-first with landscape
remaining usable. The layout must respect safe areas, the Dynamic Island, the
Home Indicator, Dynamic Type, and touch targets of at least 44 by 44 points.

## Mobile destinations

The bottom navigation has exactly four stable destinations:

1. **Inner Command** — purpose, containment, next physical action, return, and
   compact daily evidence.
2. **Actions** — active commitments, quick status changes, deadlines, and
   adding/editing one persistent Action Vault record.
3. **Career** — current roadmap, module, topic, next unfinished item, deadline,
   and quick checklist completion.
4. **Rhythm** — daily foundations, spiritual practice, weekly maintenance, and
   recovery evidence.

## Explicitly excluded from mobile navigation

Launch, Money, Progress, and Rewards remain desktop-oriented. Their data may
still contribute to shared evidence and rewards; they simply do not become
mobile destinations in the first mobile line.

Security, backup, sync status, lock, and recovery remain available through a
small utility surface. They are services, not primary destinations.

## Interaction rules

- Keep one primary decision visible at a time.
- Use progressive disclosure for detail and analytics.
- Use focused sheets for scoped editing rather than dense inline forms.
- Keep the bottom navigation visible and stable.
- Never create mobile-only shadow records.
- Save locally first; cloud synchronization is debounced and non-blocking.
- Show saving, synced, and cloud-unavailable states clearly.
- Never hide unsaved work behind navigation.

## Non-functional acceptance criteria

- No horizontal page overflow at the iPhone 15 Plus viewport.
- No content or controls overlap safe areas.
- Primary controls are touch-safe and have visible press states.
- Refresh preserves the active page and saved data.
- Offline/local work remains usable.
- Cloud failure preserves local data and exposes recovery state.
- Mobile and desktop render the same underlying records.
- Text remains usable with larger system text settings.
- Lock and backup flows do not expose private content.

## Release sequence

- `0.5.0` — mobile shell and navigation.
- `0.5.1` — Inner Command mobile.
- `0.5.2` — Actions mobile.
- `0.5.3` — Career mobile.
- `0.5.4` — Rhythm mobile.
- `0.5.5` — backup, sync, lock, and recovery hardening.
- `0.5.6` — accessibility, performance, and visual polish.

Each milestone must have its own release document and pass the release
governance Definition of Done before the next one begins.
