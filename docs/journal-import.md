# Journal import version 1

Paste this instruction with your journal into your chosen assistant:

Transcribe my notes faithfully. Produce a JSON package using the schema below.
Use a stable, unique package id so that retrying the same import cannot duplicate it.
Do not invent durations, mood ratings, doses, calories, completion, or dates.
Every record must contain an exact excerpt from the journal text as evidence.
Use activity for completed actions, observation for feelings or health observations,
and task for commitments still to do. Unknown durations must be null.
Do not propose VP for mood, sleep quality, extra doses or food quantities.
New concepts belong in Other until a feature is explicitly approved.

```json
{
  "version": 1,
  "id": "journal-2026-09-17-page-1",
  "date": "2026-09-17",
  "text": "I walked for 20 minutes. I felt tired. Call the dentist.",
  "records": [
    {"title":"Walk", "domain":"Movement", "kind":"activity", "completed":true, "minutes":20, "evidence":"I walked for 20 minutes."},
    {"title":"Felt tired", "domain":"Mood", "kind":"observation", "evidence":"I felt tired."},
    {"title":"Call the dentist", "domain":"Personal tasks", "kind":"task", "evidence":"Call the dentist."}
  ]
}
```

Domains: Career, Personal tasks, Job applications, Skincare, Supplements, Food,
Sleep, Mood, Movement, Spiritual practice, Relationships, Other.

## Current release boundary

Text journal, saved drafts, structured records, search, previewed imports, duplicate
package protection and progress views are implemented. These live under `tasks.life`,
so the existing task export and manual cloud block sync include them.

Photos can be transcribed in your assistant, then imported here as text. Original
photo/audio storage and automated extraction are not implemented. Imported records
do not automatically earn VP. Existing VP events remain visible, while a dedicated
reviewed VP-award workflow is pending. Timer and journal durations are shown separately
because describing a timed session in a journal does not establish a second session.

Features proposed from journal content require explicit user approval before building.
No automatic feature creation or publishing is performed.
