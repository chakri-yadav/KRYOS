# Security Model

KRYOS currently uses a Phase 1 local screen lock. This is privacy protection, not full cryptographic security.

## Current Protection

- PIN/passphrase lock.
- Recovery questions.
- Manual lock.
- Inactivity lock.
- Refresh stays unlocked only while session rules allow it.
- Privacy mode can blur sensitive panels.

## Current Limits

- Browser local storage is not encrypted.
- A person with access to browser developer tools may be able to inspect local data.
- Recovery questions reset the screen lock only.
- There is no server-side authentication yet.
- There is no cloud sync yet.

## Required Future Improvements

Before KRYOS stores synced personal data:

- define account authentication
- define secret handling
- separate personal/demo data
- avoid syncing raw PINs or recovery answers
- document threat model
- add backup restore verification

## Security Rule

Never commit:

- real personal journal data
- real recovery answers
- PINs or passphrases
- API keys
- backend service keys
- private exports

