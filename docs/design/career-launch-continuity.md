# Learning and launch continuity

## Ownership

career-flow-ui.js owns presentation context. Browser preference records contain
only existing module/topic IDs and panel booleans, never copied curriculum or
note text. Keys are scoped by local/hosted workspace, account mode, hosted user
identity (or unsigned-in device) and roadmap ID. No preference is a progress fact
or a cloud synchronization block. Storage denial falls back to session memory.

The next-step selector prefers an unfinished non-optional step in the remembered
topic/module, otherwise the existing next-step policy. Removed IDs are ignored.
Continue opens ancestors and focuses the actual checklist input without marking
it complete. User-selected context and progress retain their independent meaning.

Notes use scoped session drafts during re-render/navigation. Existing field
change handlers save through the authoritative owner. Reload uses saved notes;
uncommitted typing is not silently represented as a saved or cloud-confirmed fact.
The UI explains reload behavior and registers a native pending-draft warning.

launch-flow-ui.js owns a date/account-scoped session focus only. Market and mock
routes use existing forms. Speaking uses the self-rehearsal mode with an editable
focus label. Choosing/opening/cancelling does not create activity or earnings.
Aggregate application evidence remains owned by marketing-integration-ui.js;
the focus link opens that existing source/date section without generating events.

ui-navigation.js owns Marketing open/return delegation, captures these controls
before older handlers and preserves the existing history and return contract.
The hosted page remains aggregate-only. No local job/file data moves to cloud.
