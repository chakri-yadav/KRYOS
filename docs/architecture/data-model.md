# Data Model

This document defines the main KRYOS data domains.

## Account Mode

Global storage key:

```text
kryos-account-mode-v1
```

Owns:

- active space: `personal` or `demo`

Personal mode uses the base storage keys below. Demo mode uses mode-prefixed equivalents, for example `kryos-demo-foundation-v1`.

## Foundation

Storage key:

```text
kryos-foundation-v1
```

Owns:

- declaration
- why
- vows
- do principles
- don't principles
- strengths
- weaknesses
- return protocol
- review metadata

## Career

Storage key:

```text
kryos-career-v1
```

Owns:

- roadmaps
- modules
- topics
- checklist items
- career activity log

Career activity is logged when a roadmap checklist item is completed.

## Tasks

Storage key:

```text
kryos-tasks-v1
```

Owns:

- one-off tasks
- recurring routines
- habit-like tasks
- scheduled dates
- carry-forward behavior
- checklist records
- daily task records
- habit measurements

Tasks power Today, Habits, and parts of Progress.

## Journal

Storage key:

```text
kryos-journal-v1
```

Owns:

- daily entries
- arrival checkbox
- state metrics
- mind dump
- truth filter
- shutdown
- tomorrow top 3
- drift tags
- sealed day metadata

## Security

Storage key:

```text
kryos-security-v1
```

Owns:

- configured status
- hashed PIN/passphrase
- recovery questions
- hashed recovery answers
- privacy settings
- auto-lock settings

## UI State

Storage key:

```text
kryos-ui-state-v1
```

Owns:

- current page
- selected date
- selected roadmap
- selected habit
- active task view
- mobile field tab

## Session State

Storage key:

```text
kryos-security-session-v1
```

Owns:

- unlocked timestamp
- last activity timestamp
- manual locked status

Session state is not included as trusted backup state.
