# Backup And Restore

KRYOS backup is the safety net before cloud sync.

## Current Backup Version

```text
3
```

## Backup Contains

- Foundation data
- Career data
- Task data
- Journal data
- Security settings
- UI state
- active space metadata

## Backup Does Not Trust

- active security session
- external backend state
- future server auth tokens

## Export Rule

Export should create a JSON file that can restore the active space later.

Personal export must not include Demo data. Demo export must not include Personal data.

## Import Rule

Import should replace the active space data blocks cleanly and clear the old active session for that same space.

## QA Scenarios

- export after editing Foundation
- export after completing career checklist
- export after adding tasks
- export after adding journal entry
- export in Personal and verify Demo data is absent
- export in Demo and verify Personal data is absent
- import Personal backup while Personal is active
- import Demo backup while Demo is active
- import into clean browser
- import over existing data
- confirm imported session requires correct lock behavior
