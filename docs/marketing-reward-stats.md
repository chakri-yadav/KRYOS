# Marketing statistics → Personal Rewards

Marketing jobs, resumes, JDs and attachments remain laptop-only. Do not upload a Marketing batch to Supabase.

When the owner asks to hand off completed marketing, run the authoritative laptop script:

```text
node scripts/kryos-marketing-reward-stats.mjs --date YYYY-MM-DD --output-dir <ignored .private directory>
```

It reads the persisted SQLite workspace, excludes demo/test postings, deduplicates submitted applications, and exports only date, workspaceId, source revision and submittedCount. It never reads file bytes. Dates are operating days, 07:00–07:00 America/Chicago.

The generated request uses `marketing.stats.import`. Prefer the existing encrypted assistant bridge if available. Reuse the same generated request/idempotency key on retry. If that credential is unavailable but the signed-in Supabase CLI is available, run the generated ignored SQL with `supabase db query --linked --project-ref ogpkaxprhjhrewoxsyla --file <private SQL path>`. This calls the same validated stats-only snapshot store; it is not a browser import. A single Personal profile is required; ambiguity must be resolved, not guessed.

Require accepted receipt, then verify the dated summary in the tasks block. Remove the generated plaintext JSON and SQL after verification. A duplicate retry must leave the tasks revision unchanged. Lower counts from a newer local revision replace the day, allowing corrections to reverse credits.

Cloud Rewards uses the larger of the cloud Launch count and the local Marketing summary count, not their sum, because aggregate overlap cannot be proven. This may conservatively undercount disjoint activity; it never silently doubles rewards.

# Rewards V5

Effective operating date: 2026-10-11. Previous assessments remain under their recorded rules. Shared rules are in `reward-rules-v5.js`; browser adapter in `reward-ui-v5.js`; server uses the same rules and an advisory-lock/revision-checked transaction.

Typed assistant work operations: `reward.work.record` requires kind, title, stable source_id and an exact action excerpt; `reward.work.correct` requires that source_id and reason. Types: application-start, career-start, concept, practice, mock, articulation-small, articulation-medium, shift. Never turn journal prose or intentions into a completion automatically. Exact source references prevent duplicate work across pages.

Catalog: bounded-video 5, friend-call 25, movie 90, initiated-call 100. Day scores cap at 100 / 20 spendable points. Only initiated-call requires five qualified dates in the previous seven. Support, sleep and necessary breaks are unrestricted.

Local Rewards is a browser preview; the main GitHub Pages app is authoritative for cloud redemption. Protected savings are one wallet allocation, not a second currency. Pending redemption IDs survive retries. The server, not browser balances, approves spending.
