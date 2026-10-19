# Submission history and explicit corrections
+
+19 October 2026 · laptop 0.28.0 / hosted compatibility 0.46.2.
+
+## Outcome
+
+Laptop applications retain submission facts when job stages change. Updates
+supports date correction with a reason, explicit reapplication, mistaken-entry
+voiding and review of ambiguous legacy dates. Submitted-document references are
+explicit; old uploads are not guessed to be the submitted version.
+
+## Data and deployment
+
+An additive local event history is enabled through a backed-up, revision-checked,
+count-preserving migration. Ambiguous dates preserve existing counts until
+reviewed. Mutations and receipts commit together, retries remain idempotent and
+ordinary workspace saves cannot overwrite authoritative history.
+
+The hosted release includes shared reader compatibility and public engineering
+documentation/tests. It continues to show only approved aggregates. No jobs,
+contacts, descriptions, documents, cloud migration or reward recalculation are
+published or transferred.
+
+## Verification
+
+208 local tests and 321 public tests passed. Disposable service tests covered
+count-preserving migration/rerun, correction/reapplication, stale revisions,
+tampered full-save history, forced transactional rollback, restart, verified
+backup restore and exact file bytes. Browser checks exercised actual correction
+and reapplication forms, lost-response retry, stage independence, legacy-group
+review, four widths and refresh. Existing workspace and planning checks passed.
+
+## Recovery and limits
+
+Use matched database/files backups for history recovery. Browser workspace
+imports do not replace audit history. Prefer forward repair: older code reading
+only compatibility fields may undercount repeated submissions after history
+edits. Migration does not claim a historical submitted-document version.
+Explicit aggregate corrections remain separate approved operations.
+
+Next milestone: shared date and daily-review correction clarity.
