# KRYOS Version Policy

KRYOS uses a long-horizon private product version format:

```text
major.minor.patch
```

Canonical current version:

```text
0.5.11
```

## Meaning

- `0`: private product built for the founder's personal ADHD support.
- `5`: the focused iPhone mobile experience line.
- Patch: a compatible correction with no new user workflow or data migration.
- Minor: a complete compatible user capability or milestone.
- Major: an incompatible product or data foundation change.

## Version Bands

| Version band | Meaning |
| --- | --- |
| `0.1.x` | Private local stabilization |
| `0.2.x` | Personal/demo separation |
| `0.3.x` | Sync foundation |
| `0.4.x` | Life Execution Foundation |
| `0.5.x` | Focused iPhone mobile experience |
| `1.0.0` | Future public-ready product line |

## Bump Rules

- Patch: bug, accessibility, cache, copy, or visual correction with no new workflow.
- Minor: complete compatible workflow, product area, mobile milestone, or migration.
- Major: incompatible data or product foundation change.

## Release Note Requirement

Every version change must have:

- summary
- user-facing changes
- technical/data changes
- QA performed
- known risks

## Release evidence

No version may change until it has a stated product reason, acceptance criteria,
identified data ownership, persistence and error-state verification, documented
sync/backup impact, QA evidence, updated README/CHANGELOG/release documentation,
and a matching Git tag for a published milestone.

The older display forms such as `0.004.030` are retired. New canonical tags use
the standard form, currently `v0.5.11`.
See `docs/project/release-governance.md` for the complete workflow.
