# Public publication policy

Public source, filenames, commit messages, branches, pull requests, release notes and documentation use technical feature descriptions. Keep private statements, imported records, contact details, documents, personal-practice terminology, tooling branding and user-home paths out of public updates.

Develop public changes only from the clean public checkout using the engineering/ namespace. Never merge pre-cleanup private history. Existing private credential storage and compatibility identifiers are not moved or regenerated to clean public presentation.

Before committing, run:

```sh
node scripts/check-public-surface.mjs
node --test tests/*.test.cjs tests/*.test.mjs
```

After committing, also run the checker with --metadata. It checks the newest commit message, author/committer fields and branch label. This is a preventative gate, not an assertion that all historical or cached surfaces are removable by the repository owner.

An optional PUBLICATION_POLICY_FILE may point to an ignored local JSON file with a terms array for private vocabulary checks. Never publish that file. Reports show filenames and violation categories, not matching private contents. Ordinary technical API paths and device-related terminology are not user-home paths.

Release packaging must separately inspect the actual pull request title/body, release title/body and relevant comments. Repository file checks cannot inspect GitHub-held metadata. Closed pull-request source labels, old review references and cached pages can remain after branch/history cleanup; request GitHub Support assistance and verify their response rather than claiming those surfaces were purged.
