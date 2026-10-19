# Local document version and retrieval contract

The pure marketing-documents.js policy projects explicit submission references
and merges independent attachment IDs. It does not read files, search employers,
write records, award points or synchronize personal data.

Local upload uses POST /api/marketing/documents/attach with job ID, expected
workspace revision, stable request identity and existing file metadata/bytes.
Document insertion, normalized workspace metadata and receipt commit together.
Staged bytes are cleaned on rollback. An identical retry returns the accepted
receipt; a stale revision rejects before file replacement. The older byte-only
endpoint remains compatible with the existing import bridge.

Deletion uses the explicit revision-checked version-removal operation. Metadata
gets a deletion marker; submission references remain untouched. The download
endpoint rejects tombstoned or missing files. Physical cleanup follows the commit;
if cleanup fails, the response reports pending cleanup and retrieval remains
blocked. There is no claim that filesystem and SQLite share a transaction.

Downloads check recorded size and handle stream errors. Original filenames use
UTF-8 Content-Disposition encoding. New uploads never infer which file was
submitted. Correcting designation uses existing reasoned submission history.
Same-name files retain distinct IDs; replacement does not erase old attribution.

Browser view preferences are separate from records/drafts. Default is Added today;
search bypasses date range but retains its labelled status filter. Applied-date
drilldown uses actual submission projection. New-day reload returns to today's
default rather than resurrecting an old automatically selected day.

No Marketing record, contact, description or file is sent to hosted storage.
Approved dated aggregate handoff remains explicit and unchanged.
