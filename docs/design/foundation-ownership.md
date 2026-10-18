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

Later slices handle reading-first composition, complete feature-status mapping, full-width analytics and page-specific typography. This foundation does not claim those page redesigns are finished.
