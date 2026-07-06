# Component Inventory

This file documents the reusable UI patterns in KRYOS.

## Navigation

### Sidebar Navigation

Used on desktop.

Purpose:

- move between major product areas
- show the product structure clearly

Rules:

- one item per major page
- active page must be visually clear
- do not add sub-navigation here until the product needs it

### Mobile Navigation

Used only for Field Mode.

Purpose:

- Today
- Add
- Habits
- Pulse

Rules:

- keep four actions
- no full desktop navigation on mobile

## Cards And Panels

### Section Card

Used for focused content groups.

Rules:

- do not nest cards inside cards
- keep headings compact
- use for clear sections, not decoration

### Repeated Item Card

Used for roadmaps, tasks, habits, and journal items.

Rules:

- each card should represent one object
- avoid making cards look like forms unless editing is intentional

## Status Components

### Chip

Used for small status labels.

Examples:

- done
- partial
- missed
- priority
- confidence

### Progress Track

Used for completion progress.

Rules:

- must be based on real records
- do not use as decoration

### Heatmap

Used for long-term consistency evidence.

Rules:

- green levels represent activity intensity
- each cell should map to a date

## Inputs

Inputs should appear where the user is intentionally editing or capturing data.

Read-first pages should avoid always-visible text inputs.

## Icon Buttons

Used for repeated utility actions.

Current rule:

- pencil icon opens Career roadmap edit mode
- check icon closes Career roadmap edit mode
- delete actions can remain text or icon depending on risk clarity

## Mobile Controls

Mobile controls should be:

- full width when needed
- touch-friendly
- low decision count
- safe from bottom navigation overlap

