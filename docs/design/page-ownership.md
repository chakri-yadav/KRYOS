# Page Ownership

The [accepted visual contract](visual-contract-v1.md) defines presentation.
Storage is defined by [Current runtime](../architecture/current-runtime.md).

This document is the duplicate-feature guardrail.

| Page | Owns | Does not own |
| --- | --- | --- |
| Inner Command (journal route) | reading context, daily requirements, journal and result review | independent scoring rules |
| Career | roadmaps, modules, topics, career checklist completion | job application pipeline, daily todo board |
| Actions | canonical tasks, status and dated completion | copied tasks for another page |
| Rhythm | routine records and familiar counters | one-off task ownership |
| Launch | work entry points, mocks, articulation and integrated evidence | duplicate job records |
| Marketing | local applications, details, documents and application analytics | hosted job/file storage |
| Money | ledger, contacts, obligations and statement evidence | inferred financial outcomes |
| Progress | read-only analytics | manual entry |
| Settings | lock, privacy, backup, import, reset | daily work |
| Rewards | earned-credit explanation and redemption through the existing authority | a second scoring engine |

## Decision Rule

When adding a feature, ask:

1. Which page owns the user decision?
2. Which data source powers it?
3. Does another page already do this?
4. Is this input or analytics?
5. Should it exist on mobile?

