# KRYOS Release Governance

This document defines how KRYOS moves from a feature idea to a documented,
versioned GitHub release. It applies to code, data behavior, UI changes,
imports, migrations, and production fixes.

## Release principles

- Versions describe completed user-facing outcomes, not file counts.
- One version has one clear product reason.
- Every release is reproducible from an immutable Git tag.
- Local data safety comes before cloud convenience.
- Documentation, code, QA, and GitHub metadata must agree.
- A planned feature is not a released feature.

## Version decision

Use a **patch** for a compatible bug, accessibility, cache, copy, or visual
correction with no new workflow or migration.

Use a **minor** release for a complete compatible workflow, product area,
mobile milestone, or data migration that preserves existing records.

Use a **major** release only for an incompatible data or product foundation
change.

## Feature-to-release workflow

1. **Define:** record the user problem, product reason, owner page, data owner,
   exclusions, and acceptance criteria.
2. **Build:** implement the smallest complete slice; preserve shared records and
   local-first behavior.
3. **Verify:** test behavior, refresh persistence, responsive layout, backup,
   sync states, and regression impact.
4. **Document:** update the release note, changelog, README status, architecture
   or design docs, and QA evidence.
5. **Decide:** assign patch/minor/major using `VERSION.md`; do not guess.
6. **Package:** update the app version, commit the complete change, create the
   matching `vX.Y.Z` tag, and publish a GitHub Release.
7. **Review:** record known limitations and the next bounded milestone.

## Definition of Done

- The intended user workflow works end-to-end.
- The owning data record is identified and no duplicate record is created.
- Local saves survive refresh.
- Cloud failure does not lose local work.
- Backup/import behavior is documented and safe.
- Automated tests or a written manual QA record exist.
- Desktop and mobile regression scope is explicit.
- `app.js`, `VERSION.md`, `README.md`, `CHANGELOG.md`, and
  `docs/releases/<version>.md` agree.
- GitHub issue/milestone, tag, and release notes identify the same version.

## Release note template

Every release note must include: release date, product reason, user problem,
included scope, explicit exclusions, data impact, sync/backup impact,
acceptance criteria, QA performed, known limitations, and next milestone.
