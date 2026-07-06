# Architecture Overview

KRYOS is currently a local-first static browser application.

## Current Runtime

- `index.html` provides the shell.
- `styles.css` provides the design system and responsive behavior.
- `app.js` owns state, rendering, events, storage, backup, security, and all page behavior.

## Architecture Style

Current style:

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
