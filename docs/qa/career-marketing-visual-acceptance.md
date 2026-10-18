# Career and application workspace visual acceptance

Date: 2026-10-18. Laptop 0.25.12; hosted 0.45.17.

## Ownership and scope

- Career layout remains in career-flow-ui.css; existing renderers, workflow lanes, stable IDs and curriculum own learning behavior.
- Local application details and analytics remain in marketing-workspace-ui.css, with document/file operations in existing local owners. marketing-flow-ui.css inherits the same semantic palette.
- Hosted analytics remain in marketing-summary.css and the existing aggregate receipt renderer. No local file, job, contact or description field is added to the hosted summary.
- No reward rule, roadmap structure, backend schema, operating-day boundary or synchronization rule changes. No statistics handoff is implied or performed.

## Acceptance evidence

- Local suite: 176 passing tests, including isolated service batch/idempotency/document-byte checks.
- Hosted suite: 292 passing tests, including aggregate validation and publication checks.
- Isolated browser checks: render every installed fixture roadmap; serialized curriculum unchanged before/after rendering; coverage remains distinct from mastery.
- Local browser checks: document controls, synthetic file download with filename and byte verification, Overview/Documents/Updates keyboard tabs, empty and restored search results, action-first/weekly analytics and separate full-width analytics.
- Hosted browser checks: counts-only surface, period presets, custom dates, unknown versus confirmed zero, bar drill-down and receipt coverage.
- Reflow checked at 1440, 1024, 760, 390 and 320 pixels. Keyboard focus uses the shared focus token; reduced-motion rendering checked.
- Manual screenshot review corrected narrow date fields and clipped chart labels.
- Offline and saving indicators are differentiated from a confirmed local save. Screenshots from a disconnected static test are not evidence of a connected service.

## Release verification and limits

Confirm versioned assets from the permanent laptop service and deployed hosted page independently before announcing availability. Browser tests block external mutations and use disposable browser contexts; they do not establish a new cloud save or alter personal records. Physical-phone acceptance, assistive-technology certification, activated dark mode and a claim of bug-free behavior are excluded.

## Recovery

This is a compatible presentation patch. Restore the prior presentation assets and cache references to roll back; no data migration, database restore or document relocation is required. Never overwrite the independent personal or laptop stores to reverse a visual change.
