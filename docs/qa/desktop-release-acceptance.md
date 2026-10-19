# Desktop release verification and recovery

Date: 2026-10-18 (America/Chicago). Laptop 0.25.14; hosted 0.45.19.

## Release decision

Desktop visual and isolated persistence/transfer acceptance passes. Finance next-action text and buttons now explicitly override legacy dark-panel colors on the approved light surface. This is a compatible correction; no schema, reward-rule or storage migration.

A signed-in production Supabase write/read round trip is **not verified in this acceptance**. Do not present the two-client simulation or deployed software version as a confirmed personal cloud save. Physical-phone and full accessibility certification remain deferred.

## Evidence

- Laptop: 180 automated checks. Hosted: 296 automated checks.
- Desktop/narrow reflow: all page families, including 1440, 1024, 760, 390 and 320 pixel viewports where applicable; reduced motion, reading order and keyboard actions.
- Fifteen rendered critical text/background pairs per build pass normal/large-text contrast thresholds; shared palette, action states and essential-control boundaries have separate numerical tests. This is sampled verification, not exhaustive WCAG certification.
- Linked tasks, history corrections, review/confirmation, date isolation, refresh persistence and familiar counters pass in disposable contexts.
- Local uploads: a real UI upload to an isolated service; exact filename and byte-for-byte download; unsupported extension rejected; attachment preserved after refresh.
- Offline local behavior: unavailable status, recovery data held locally, reconnect save accepted. Real Marketing data is not used as a write-test fixture.
- Two independent simulated cloud clients: online transfer, historical correction, offline persistence, conflicting edits preserved, stale writes rejected. Production cloud writes: zero.
- Local backend import/attachment tests also cover idempotency, preserved source fields and service restart.
- Live hosted assets and permanent laptop service are verified independently after publication.

## Backup boundaries

Separate private artifacts contain the laptop software package, hosted Git bundle and local database/file snapshot. These are not committed, attached to releases, or uploaded to hosted storage. An initial pre-correction software package is retained as the rollback baseline; a final verified package is retained separately.

The local database backup passes SQLite integrity verification, and every stored document hash matches its copied file. Inventory counts, source revision and recovery locations are retained privately, not published. Backup filenames may use UTC; acceptance dates use the stated product timezone.

The local database snapshot includes locally owned workspace tables. It is not a backup of the hosted Supabase account or every browser-only record. No production cloud-data backup is claimed here. Code tags and a Git bundle are software backups, not account-data backups.

## Laptop rollback

1. Preserve current records and create another backup before any recovery.
2. Close the local application and stop only its identified local-service process.
3. Extract the chosen laptop software archive into a separate recovery folder first. Inspect its version and file list. Never replace the local app with hosted sources.
4. Restore only the archived software files into the authoritative local app folder; keep private credential folders and local database/files unchanged.
5. Run the standard launcher, check the displayed version and verify read-only records/documents. Do not sign local Career or Marketing into cloud to repair a visual issue.
6. A database restore is a separate data-recovery procedure, not part of normal visual rollback. If genuinely required, retain the current database and files first and restore a matched database/file snapshot with the service stopped.

## Hosted rollback

Use the retained clean public tags/bundle. Restore the affected presentation assets from the chosen known-good tag onto a new engineering branch, preserving any later domain changes. Run acceptance checks, publish a forward recovery release, and verify Pages deployment plus the served version. Do not force-rewrite history, merge private history, or restore account data to reverse a visual issue.

## Remaining live-account acceptance

Using the owner's signed-in hosted session, first export an account backup. Confirm the displayed release and save destination; verify one explicitly approved reversible edit, its accepted cloud confirmation and read-back after refresh. Do not overwrite a pending conflict or use blanket Push/Pull as a test. This step requires a real signed-in session and is not substituted by assistant-import authorization.
