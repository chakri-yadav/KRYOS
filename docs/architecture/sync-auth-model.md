# Sync Auth Model

Status: planned for `0.003.x`.

KRYOS has two different kinds of access:

- Local screen lock: the current Phase 1 PIN/passphrase that blocks casual local access.
- Cloud identity: the future Supabase Auth account that allows laptop/phone sync.

These must not be confused.

## Decision

Use Supabase Auth for the sync prototype, but keep local KRYOS PIN separate.

Initial rule:

- one owner account
- no open public signup
- Personal and Demo are separate profile rows for the same owner
- Demo must be tested first
- local PIN/recovery/session data never enters Supabase in `0.003.x`

## Why Not Use The Local PIN For Sync

The local PIN is a screen lock, not a cloud identity. Reusing it as backend auth would be weak and misleading.

The sync account needs server-backed identity and row-level security. The local PIN can still protect the device after the app opens.

## Static App Configuration

The Supabase project URL and anon key are not private secrets. They can exist in a static browser app later because RLS is the real protection.

Even so, KRYOS should not add those values until:

- schema is created
- RLS policies are reviewed
- Demo profile exists
- export backup is taken
- sync conflict behavior is implemented

## Login Behavior

For `0.003.x`, the clean product behavior is:

1. User unlocks KRYOS locally.
2. Settings shows sync is not connected or connected.
3. User signs in to Supabase only when enabling sync.
4. Demo sync is tested before Personal.
5. Personal remains local until Demo sync is proven.

## Rejected Shortcut

Do not store Supabase credentials, passwords, recovery answers, or user secrets inside localStorage as plain product data. KRYOS can store non-secret sync status locally, but the real authenticated session should be handled by the Supabase client when the prototype is built.
