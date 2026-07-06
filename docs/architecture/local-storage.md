# Local Storage Architecture

KRYOS currently stores data in browser local storage.

## Benefits

- free
- no backend required
- works from the local HTML file
- simple backups
- fast private iteration

## Risks

- data is tied to browser/device
- data can be cleared by browser reset
- data is not encrypted
- laptop and phone do not automatically sync
- backup discipline is required

## Account Mode

The active space is stored globally:

| Key | Purpose |
| --- | --- |
| `kryos-account-mode-v1` | Active data space: `personal` or `demo` |

Personal mode keeps the original storage keys for backward compatibility. Demo mode prefixes equivalent keys with `kryos-demo-`.

The active space is changed by successful profile login. It should not be exposed as a casual Settings switch.

## Storage Keys

### Personal Mode

| Key | Purpose |
| --- | --- |
| `kryos-foundation-v1` | Foundation content |
| `kryos-career-v1` | Career roadmaps and activity |
| `kryos-tasks-v1` | Tasks, routines, habits, records |
| `kryos-journal-v1` | Journal entries |
| `kryos-security-v1` | Phase 1 lock settings |
| `kryos-ui-state-v1` | Last app view and selections |
| `kryos-security-session-v1` | Current unlock session |

### Demo Mode

| Key | Purpose |
| --- | --- |
| `kryos-demo-foundation-v1` | Demo Foundation content |
| `kryos-demo-career-v1` | Demo Career roadmaps and activity |
| `kryos-demo-tasks-v1` | Demo tasks, routines, habits, records |
| `kryos-demo-journal-v1` | Demo journal entries |
| `kryos-demo-security-v1` | Demo Phase 1 lock settings |
| `kryos-demo-ui-state-v1` | Demo last app view and selections |
| `kryos-demo-security-session-v1` | Demo current unlock session |

## Rule

All user-visible data must be either:

- stored in one of the main data blocks, or
- derived from those blocks.

Do not create hidden duplicate stores without documenting them here.

Backup, import, reset, and session lock behavior must operate on the active space only.
