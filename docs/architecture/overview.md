# Architecture Overview

The current authority is [Current runtime and storage ownership](current-runtime.md).
The browser-only description below is a historical baseline, not the current
deployment contract. The laptop now has a local service and the hosted
distribution uses Supabase. Feature modules and page adapters share ownership
with the original application shell.

KRYOS is currently a local-first static browser application.

## Historical browser-only runtime

- `index.html` provides the shell.
- `styles.css` provides the design system and responsive behavior.
- `app.js` owns state, rendering, events, storage, backup, security, and all page behavior.

## Architecture Style

Historical style:

- single-page application
- local state loaded from browser local storage
- direct DOM rendering
- no framework
- no backend
- no build step

## Major State Blocks

- Foundation state
- Career state
- Task state
- Journal state
- Security state
- UI state
- Security session state
- Account mode state

## Data Flow

```text
User action
  -> event handler
  -> state mutation
  -> active-space local storage save
  -> render
  -> derived analytics update
```

## Derived Views

Progress, habit analytics, streaks, and career heatmaps should be derived from stored records. They should not create separate competing records.

## Current Limit

The app is powerful but concentrated in one large JavaScript file. Before public scale, it should eventually be modularized by domain.
