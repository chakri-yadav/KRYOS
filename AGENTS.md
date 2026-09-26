# KRYOS workspace instructions

KRYOS is a personal ADHD support application. The owner may report daily facts or journal thoughts directly to the assistant. Treat these reports as data-entry requests when the intent is clear.

## Personal data goes to Supabase

- Journal text, water intake, spiritual practice, Action completion, Career progress, and Inner Command observations belong in the Personal Supabase profile.
- Never put private journal text, raw personal statements, API tokens, or database exports into GitHub commits, issues, pull requests, release notes, or test fixtures.
- A code change or GitHub commit is not evidence that a personal KRYOS record was saved. Say it was saved only after receiving an accepted cloud receipt.
- The local `9619` screen PIN does not authorize backend writes.

## Assistant ingestion workflow

When the owner says they did something or asks to record a journal entry:

1. Identify the intended KRYOS date in the owner's timezone. KRYOS's operating day begins at 7:00 AM; ask only if a date is genuinely ambiguous.
2. Preserve the original statement as `raw_text`. Write a polished `journal.capture` text only if the owner intended a journal entry; do not invent facts.
3. Convert each explicit, completed fact into a supported operation documented in `docs/architecture/assistant-ingestion-implementation.md`. Use exact evidence excerpts from `raw_text`.
4. For existing Actions or Career checks, use exact IDs from current cloud data. Never guess an ID from a similar title.
5. Use one stable idempotency key for the user's message and reuse it on retries.
6. If the ingestion endpoint and `KRYOS_ASSISTANT_TOKEN` are configured, send the request through `scripts/kryos-ingest.mjs`. Read the receipt before telling the owner it succeeded.
7. If the endpoint, credential, or profile is unavailable, explain the precise missing connection. Do not claim that local files or GitHub updated the app.

Do not infer completion from intentions such as “I should read” or from negations such as “I did not finish.” A correction to an earlier statement needs the original record identified before changing it. Rewards derive from evidence and current review rules; never fabricate a review or credit.

## Product development

- Develop public code from a clean public base. The main local checkout may contain unpublished personal history.
- Use strict versioning from `VERSION.md`. Do not bump a live version for an untested or undeployed backend change.
- Test changes in proportion to their risk. Supabase migrations and assistant writes require a real cloud round trip before announcing a production release.
