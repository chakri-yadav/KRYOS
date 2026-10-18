# Shared visual foundation acceptance — 2026-10-18

## Delivered scope

Approved light palette and staged dark values; shared shell, navigation, primary/secondary controls, input readability, keyboard focus, save-state surfaces, and explicit historical/future date attribution.

The hosted mixed foundation was split: preserved feature-specific selectors live in legacy-page-surfaces.css; shared presentation is owned by visual-foundation.css and visual-tokens.css. Conflicting Inner Command shell overrides were removed at source in both builds.

No storage API, reward core, record schema, cycle rule, task relationship or saved personal content changed. The date-mode attribute and explanatory copy read the existing context; they do not change date semantics.

## Evidence

- Hosted suite: 282 automated checks passed.
- Local suite: 168 automated checks passed.
- Contrast unit checks cover specified light/dark text pairs, primary states and essential boundaries.
- Isolated browser checks cover configured navigation at 1440px, 1024px and 390px, computed palette values, historical/current/future date states, Marketing exclusion and visible keyboard focus. No uncaught runtime errors.
- Shared-date and cycle browser regressions passed on hosted source: date routing, refresh, cross-page attribution, preparation boundary, Day 1/48, preserved old-cycle history and review queue.
- Developer browser contexts use isolated storage and block external mutations. Screenshots contain only isolated fixture/empty-browser state, not a read of the owner's signed-in cloud profile.
- Production availability and fresh-asset browser checks are recorded in the release handoff after publishing; this record alone is not proof of deployment.

## Limits and known observations

This is the shared-foundation slice, not the complete page redesign. Feature-specific hardcoded surfaces and charts remain under existing page owners until later parity-tested slices. Dark mode is not activated over those light-only styles. Full-width analytics and reading-first composition are not newly claimed as completed by this slice.

The laptop APP_PAGES currently excludes Settings; the hosted route includes it. This pre-existing navigation difference was not silently changed as part of styling. Local checks cover its nine configured pages; hosted checks cover ten. Any change to the laptop settings route is a separate scoped task.

390px checks are layout/navigation regressions, not physical-phone acceptance. No full accessibility certification, live cloud mutation test, upload/download retest or production data migration is claimed by this CSS-oriented slice.

## Rollback

Hosted source rollback must use the clean public release parent, not private-history commits. Revert this release's code changes and publish a new patch; do not overwrite cloud records. The preceding public commit is 3cfde08. Keep design-decision documentation if rolling back a rendering defect.

Local source rollback restores only this slice's files from a known release copy; do not reset the dirty shared checkout or touch the persistent database/files. Browser rollback must use cache-busted assets; never clear user storage to solve a style-cache issue.

