# Changelog

All notable KRYOS changes should be recorded here.

## 0.002.001 - Profile Login Correction

Date: 2026-07-06

### Added

- Demo profile opens from the lock screen with fixed demo credentials.
- Demo data is seeded automatically without a demo setup flow.
- Demo profile has configured lock behavior by default.
- Settings shows a fixed demo credential notice when inside Demo.

### Changed

- Removed the in-app Personal/Demo switch from Settings.
- Personal credentials are checked before demo credentials to avoid accidental Personal lockout if credentials collide.
- In-app version moved to `0.002.001`.

### Verification

- `app.js` syntax check passed.
- Static scan confirmed the old Settings switch hooks were removed.
- Mocked login simulation confirmed PIN `9619` opens Demo and creates a demo session.
- Browser QA passed on an isolated local test origin: test Personal PIN opened Personal, demo PIN `9619` opened Demo, Demo pages loaded sample data, and active-profile backup labels/export notices appeared correctly.

### Known Limitations

- Browser visual QA still needs to be completed in a reliable local browser session.
- Demo uses a fixed local showcase PIN, not a server-authenticated account.

## 0.002.000 - Private Mode Separation

Date: 2026-07-06

### Added

- Personal/Demo data space selector in Settings.
- Separate Demo Mode storage keys for Foundation, Career, Tasks, Journal, Security, UI state, and session state.
- Safe demo seed data for interview and walkthrough use.
- Persistent Demo Mode badge to prevent accidental personal-data exposure.
- Rebuild demo sample data action.
- Backup metadata for active account mode and space label.

### Changed

- Backup export now exports only the active space.
- Backup import now imports only into the active space.
- Reset now clears only the active space.
- Backup format moved to version `3`.
- In-app version moved to `0.002.000`.

### Verification

- `app.js` syntax check passed.
- Static scan confirmed mode-aware storage routing.
- Mocked startup smoke test confirmed Demo seeds only `kryos-demo-*` data keys.

### Known Limitations

- Free cloud sync is not implemented.
- Browser visual QA still needs to be completed in a reliable local browser session.

## 0.001.005 - Private Stabilization

Date: 2026-07-06

### Added

- Company-level documentation system.
- In-app product identity panel in Settings.
- In-app release notes and next milestone card.
- Version policy for long-term private product development.
- Product, design, architecture, QA, release, and project-management docs.
- GitHub-style issue and pull request templates.

### Changed

- Career roadmap UX now uses one roadmap-level edit toggle instead of many visible edit controls.
- Career checklist text is read-only by default.
- Today task views are simplified by removing the duplicate visible `Anytime` tab.
- Backup format moved to version `2` and includes UI state.
- Manual lock behavior is stricter after refresh.
- Date handling is stabilized for local date keys.

### Fixed

- Manual lock could be bypassed by refresh when startup locking was disabled.
- Date-only values could shift backward because of timezone parsing.
- Mobile layout gained safe-area and overflow protection.

### Verification

- `app.js` syntax check passed.
- Date logic test passed.
- Security session logic test passed.
- Static scans passed for old Career edit controls.

### Known Limitations

- Browser visual QA could not be completed inside the in-app browser sandbox for local URLs.
- Free cloud sync is not implemented.
- Personal/demo separation is not implemented yet.
