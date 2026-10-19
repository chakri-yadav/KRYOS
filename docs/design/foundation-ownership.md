# Shared visual foundation ownership

The accepted visual contract is implemented in bounded slices, not a global page redesign.

| Owner | Responsibility | Exclusions |
| --- | --- | --- |
| visual-tokens.css | Approved primitive/semantic palette, spacing, typography and compatibility aliases | No automatic dark-mode activation |
| visual-foundation.css | Shared shell, primary/secondary controls, focus, inputs, save-status surfaces and motion preference | No feature layout, charts, rules or data access |
| visual-foundation.js | Existing read-only status adapter and actual destination/receipt descriptions | No new save operation or business rule |
| day-context.css and day-context.js | Shared date chrome and explicit history/future attribution | Operating clock and dated persistence unchanged; Marketing excluded |
| Existing feature adapters | Page-specific content, layout and interaction | Cannot redefine shared token values |
| legacy-page-surfaces.css, hosted only | Preserved feature selectors extracted from the old mixed foundation | No shared shell, input, button or status ownership; migrate per page after parity tests |

The light foundation is active. Dark semantic values are staged only: existing feature surfaces still need independent migration and rendered verification. Do not activate a dark canvas over light-only feature styles.

The daily-use slice migrates Inner Command, review, journey, Actions and Rhythm into their existing presentation owners. Migrated Actions/Rhythm rules are removed from the hosted legacy file. Career is now refined within career-flow-ui.css; local application details and full-width analytics within marketing-workspace-ui.css; hosted aggregate presentation within marketing-summary.css. Existing workflow and storage owners remain authoritative. Supporting-page presentation is now aligned within the existing Progress, Rewards, Money, Launch and Settings adapters. Domain logic stays in its original owners. Whole-app acceptance and dark-mode activation remain separate milestones.
