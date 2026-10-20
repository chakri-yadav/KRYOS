# Current runtime and storage ownership

This is the current architecture contract. Earlier release notes and historical
version bands explain past milestones; they do not override this document.

## Distributions

The laptop distribution and hosted distribution have independent versions and
deployment procedures. Each checkout's app.js APP_VERSION is its version source;
VERSION.md, README.md, CHANGELOG.md and its matching release note must agree.
Run `node scripts/check-release-contract.mjs` before packaging.

| Area | Laptop distribution | Hosted distribution |
| --- | --- | --- |
| Application records and documents | Local service, SQLite and file storage | No job records or document bytes |
| Learning roadmap structures/progress | Local service at /api/career/state | Separate Supabase-backed copy |
| Personal daily records | Existing browser persistence; cloud only where explicitly configured | Signed-in Supabase synchronization with browser recovery copy |
| Application evidence | Derived from local application workspace | Approved dated aggregate snapshots |
| Rewards | Existing local preview | Authoritative cloud spending and confirmed receipts |
| UI preferences | Browser/profile scoped | Browser/profile scoped |

## Code responsibilities

| Owner | Responsibility |
| --- | --- |
| index.html and app.js | Shell, application bootstrap and existing core state |
| ui-runtime.js and ui-navigation.js | Presentation registration and navigation lifecycle |
| day-context.js | Shared personal viewing date; independent of the current clock |
| Feature modules | Domain operations, validation and existing persistence |
| Page presentation adapters | Layout, focus and readable rendering; no independent scoring rules |
| Local service | Persistent application workspace/files and local learning state |
| Supabase operations | Hosted synchronization and authoritative supported operations |

Personal operating dates use 07:00–07:00 America/Chicago. Selecting history changes
the viewing date, not the clock or current wallet. The application workspace has
its own dates and does not follow personal-page date changes.

## Transfer and save confirmation

Only explicitly requested dated counts cross from the laptop application
workspace into hosted progress/rewards. The transfer excludes job descriptions,
employers, contacts and files. Reuse snapshot identity on retry and require an
accepted receipt plus cloud readback. Missing evidence differs from confirmed zero.

A connection is not a confirmed save. A local accepted revision and a hosted
accepted receipt describe different storage destinations. A frontend deployment
does not prove a personal record was saved.

## Deployment and recovery

The laptop application workspace uses a per-render read snapshot and 50-result
list windows, not truncated storage. Its IndexedDB recovery cache holds workspace
JSON/metadata when browser key/value quota is insufficient; the local service
database and files remain authoritative. Pending cache writes are not accepted
service receipts. Unchanged revision polls and identifier-only date queries keep
large workspace transfers bounded. Hosted Marketing does not load this adapter.

The verified restore utility accepts a backup source and a separate new
destination. It verifies database integrity, revision and document hashes before
and after staging. Existing or active destinations are rejected. See
[recovery and scale acceptance](../qa/recovery-scale-acceptance.md) for evidence,
commands, benchmark limits and desktop-access coverage.

Public changes originate only from the clean public engineering checkout.
Never merge private pre-cleanup history into public branches. Public metadata
uses technical feature descriptions and excludes personal imports and paths.

Release local and hosted software deliberately. Preserve each storage adapter.
Back up data independently of source packages; restore only into the intended
destination after verification. Never replace the laptop data store with a
hosted browser copy. See [Release governance](../project/release-governance.md)
and [desktop acceptance](../qa/desktop-release-acceptance.md).
