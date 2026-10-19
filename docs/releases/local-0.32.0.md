# Local document versions and retrieval

19 October 2026 · local 0.32.0. Hosted remains 0.49.0.

## Outcome

Local Marketing separates Overview, Application, Documents and Updates. Original
job text remains intact. Search explicitly covers all saved dates; application
chart drilldown labels Applied dates instead of Added dates. Safe view preferences
remember selection/tab/status/range for the operating day; missing IDs fall back.

Document rows show category, original filename, version ID/label, recorded date
and size. The submitted resume comes from an explicit submission reference, never
the latest upload. Unconfirmed legacy attribution is labelled honestly. Existing
reasoned submission corrections manage designation changes and retain old files.

An atomic local endpoint saves bytes plus metadata with revision checks and
idempotent receipts. Concurrent versions merge independently or reject a conflict.
Failed receipt creation rolls the metadata transaction back and cleans staged bytes.
Lost-response retries reuse request identity within the session.

Deletion retains version metadata and submission references while denying file
retrieval. Missing bytes show File unavailable with retry/replacement controls.
Uploads add versions without automatically changing submitted attribution.
Unicode download names and exact bytes are preserved. Existing type/size limits
remain; an extension is not evidence of file-content validation.

## Verification

224 local tests / 335 public engineering tests pass. Disposable-service browser
checks cover archived record search, four tabs/full description, exact submitted
resume vs newer same-name upload, another document category, exact Unicode names
and bytes, correction selection, missing files, type/size rejection, conflicting
updates/retry, lost-response retry, deletion history, applied-date scope, preference
reload and five widths. Existing history, planning, layout, offline/reconnect and
file-transfer regressions pass. No production documents are used as test fixtures.

## Distribution and recovery

Marketing jobs/files remain laptop-only. Public publication contains shared pure
document policy, synthetic fixtures and technical documentation—not local job or
file data or hosted upload controls. No Supabase deployment, statistics handoff,
reward change or record migration is required.

Back up the local database/files separately from source before restarting the
local service. A source rollback must retain the document-version reader or
forward repair: older readers may not understand retained deletion markers.
Do not restore old records merely to undo presentation changes.
