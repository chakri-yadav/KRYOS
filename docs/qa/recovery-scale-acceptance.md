# Recovery, scale and desktop access acceptance

Local 0.36.0 / hosted 0.53.0. Synthetic fixtures only; production records were not
used for destructive, offline or performance experiments.

## Scale

The laptop service and browser were exercised with 1,000 and 10,000 unique jobs,
long descriptions, unknown fields and six document-metadata entries per job.
Duplicate identifiers were separately rejected before any save, with a useful
validation response. Search still includes every record. The list renders a
50-result window, with explicit paging and automatic navigation to a selected
record. Per-render read snapshots avoid repeated parsing. No data is discarded.

Milliseconds, median / p95:

| Operation | 1,000 jobs | 10,000 jobs |
| --- | --- | --- |
| Cold entry | 80 / 687 | 126 / 1,202 |
| Search | 40 / 51 | 98 / 194 |
| Date selection | 34 / 51 | 191 / 210 |
| Detail selection | 35 / 48 | 246 / 289 |
| Chart rendering | 17 / 26 | 95 / 154 |

Interaction results use 15 samples after two warmups. Cold entry uses only three
navigations: its p95 is exploratory, not a robust tail-latency estimate. Windows,
16 GiB RAM, Core i7-13650HX, Node 22.16.0 and headless Microsoft Edge were used.
Payloads were 1.69 MB and 16.95 MB. These are measured desktop results, not a
universal device guarantee or a sustained-load benchmark.

The larger fixture survived offline reload, a retained offline edit, another
reload and reconnect to its disposable service despite localStorage quota.
IndexedDB is a recovery cache, not the authoritative laptop database or a file
backup. Browser storage can still be cleared or denied. Pending/failed recovery
writes warn before leaving. Files remain in the laptop service, not this cache.
Unchanged revision polling and identifier-only range queries avoid full-state
transfers. Existing full-state APIs remain compatible.

## Recovery

A disposable service imported a synthetic record and attachment, created an
accepted backup, restored into a second new directory and served the restored
record and exact downloadable bytes. IDs, revision, unknown metadata and SHA256
matched. Corrupt/incomplete backups and existing destinations were rejected
without overwriting valid files. Source and destination are verified separately.

`node scripts/restore-local-backup.mjs --source BACKUP_DIRECTORY --destination NEW_DIRECTORY`

The destination must not exist and must be outside the active store and source
backup tree. This tool does not replace the running production store. A software
rollback must not restore an older database over current records. Retained
references for explicitly deleted documents or removed jobs are not reconstructed
as active documents. Real backup verification is recorded privately.

## Desktop access and regressions

Both distributions passed keyboard traversal, visible focus, named-control
inspection, native modal containment/Escape, reduced-motion checks and layouts
at 320, 390, 760 and 1,440 CSS pixels. Viewport/DPR emulation checked 200%-equivalent
reflow; this is not native browser-zoom certification. The exercised accessibility
trees had no unnamed controls. Modal headings and date focus were corrected.
User navigation now cancels delayed restoration rather than overriding Tab input.
Outside-cycle dates render a neutral dated view before accessing cycle records.

Regressions include draft preservation, historical edits, linked completion,
roadmap continuity, wallet/date separation, finance, analytics, actual file
upload/download, offline/reconnect and simulated two-client conflicts. Production
cloud writes, physical phones and complete screen-reader/WCAG certification are
not claimed. Fifteen critical rendered text/surface contrast pairs are sampled;
they do not cover every possible content/state combination.

Reference basis: [modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
and [target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
No reward, curriculum, financial or storage-ownership rules changed. Hosted
Marketing remains approved aggregate statistics only, with no local job/file copy.
