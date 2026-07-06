# Security Model

KRYOS Phase 1 security is a local screen lock.

## Current Capabilities

- create PIN/passphrase
- unlock app
- manual lock
- inactivity lock
- recovery questions
- privacy blur mode
- credential-based Personal/Demo profile entry

## Current Non-Goals

- full encryption
- server authentication
- multi-user permissions
- secure key management

## Session Rules

- Manual lock should stay locked through refresh.
- If inactivity lock is enabled, refresh can stay open only while active.
- If inactivity lock is disabled, manual lock is the primary lock rule.
- Import should clear active session state for the active space.
- Personal and Demo sessions are separate.
- Demo opens from demo credentials at the lock screen, not from an in-app Settings switch.
- Demo Mode is a showcase/data-separation feature, not a privacy, encryption, or server-auth boundary.

## Future Security Requirements

Before sync:

- design account identity
- decide what data syncs
- decide what secrets never sync
- document recovery limits
- keep public demo data separate from personal data
