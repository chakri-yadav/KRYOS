# KRYOS Version Policy

KRYOS uses a long-horizon private product version format:

```text
major.minor.patch
```

Canonical current version:

```text
0.27.0
```

## Meaning

- `0`: private product built for the founder's personal ADHD support.
- Minor: a complete compatible user capability or milestone.
- Patch: a compatible correction with no new user workflow or data migration.
- Major: an incompatible product or data foundation change.

## Version Bands

| Version band | Meaning |
| --- | --- |
| `0.1.x` | Private local stabilization |
| `0.2.x` | Personal/demo separation |
| `0.3.x` | Sync foundation |
| `0.4.x` | Life Execution Foundation |
| `0.5.x` | Focused iPhone mobile experience |
| `0.6.x` | Assistant capture and revision-safe sync |
| `0.7.x` | Devi Sadhana and automatic reward system |
| `0.8.x` | Money command and verified statement checkpoints |
| `0.9.x` | Living Money ledger and statement-interest allocation |
| `0.10.x` | Private statement evidence and interest-pressure analytics |
| `0.11.x` | Evidence integrity, journal guardrails, and focused redemption |
| `0.12.x` | Connected-page flow and direct next-step navigation |
| `0.13.x` | Evidence-based reward credits and strict qualification |
| `0.14.x` | Historical reward recalculation and private adjustment audit |
| `0.15.x` | Marketing workspace shell and visual refinement |
| `0.16.x` | Marketing batch import, posting review, and application tracking |
| `0.17.x` | Marketing manual role capture and role-detail reliability |
| `0.18.x` | Book-based general SDE system design roadmap |
| `0.19.x` | Single canonical system-design roadmap and duplicate cleanup |
| `0.20.x` | General SDE-2 interview debugging roadmap |
| `0.21.x` | Resume interview speaking and claim defense roadmap |
| `0.22.x` | Resume interview mastery system |
| `0.22.1` | Complete supplied resume interview curriculum crosswalk and mastery rules |
| `0.23.x` | SDE-2 HLD system-design roadmap imported from the supplied structure |
| `0.23.1` | Remove the standalone System Design depth guide while retaining per-topic levels |
| `0.24.x` | Marketing records in Personal cloud sync, assistant batch import, and safe batch reconciliation |
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
the standard form, currently `v0.11.1`.
See `docs/project/release-governance.md` for the complete workflow.
