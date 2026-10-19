# Supporting workspace visual acceptance

Date: 2026-10-18. Laptop 0.25.13; hosted 0.45.18.

## Owner map

Presentation remains in the existing progress-flow-ui.css, rewards-flow-ui.css, reward-ui-v5.css, money-flow-ui.css, launch-flow-ui.css and settings-flow-ui.css owners. Shared semantic tokens supply surfaces, text, actions, focus and statuses. The current wallet label is clarified in the existing reward renderer; rules and ledger functions are not changed.

The laptop allowed-route list now includes the existing Settings page. This repairs a blocked sidebar destination, not a cloud-storage change.

## Accepted meanings and preservation

- Progress uses informational effort presentation, distinct from categorical daily outcomes. Missing evidence is not failure.
- Rewards keeps historical-day evidence separate from the current wallet and current eligibility. Partial evidence and unavailable rewards are neutral, qualified evidence positive.
- Money retains current account position, record-date context, units and ledger calculations. A due item is attention, a real error is destructive/error, and verified source context is information.
- Launch keeps existing logs and rehearsal workflows, with a clear next action and Marketing entry.
- Settings separates software version, storage destination, connection and actual save confirmation.
- Reward rules, prices, cooldowns, earning, reservations, balances, roadmap data, dates and synchronization are unchanged.
- Marketing application records/files stay local. No aggregate handoff or personal cloud write is performed.

## Verification

- Local automated suite: 179 passing checks.
- Hosted automated suite: 295 passing checks.
- Both isolated browser builds: all five pages visible, without document overflow at 1440, 1024, 760, 390 and 320 pixels after layout settles.
- Normal sidebar Settings entry works. Release disclosure and storage explanation remain available.
- Selecting two historical reward dates preserves the current wallet amount.
- Money section navigation moves focus to the section heading. Contact dialog opens, fits a constrained viewport and cancels without saving.
- Launch entry dialog opens and cancels without saving.
- Keyboard focus and reduced motion use shared conventions.
- Screenshot inspection included each page. Narrow reward/Launch overflow and the missing laptop Settings route were corrected.
- Browser contexts are disposable and external mutations are blocked. These checks do not claim that test fixtures were saved to personal stores.

## Limits and release

Confirm the actual laptop service and fresh hosted release assets independently. Physical-phone acceptance, full screen-reader certification and activated dark mode remain excluded. This bounded visual slice is not a claim of bug-free software or exhaustive financial/reward acceptance.

Rollback consists of restoring prior presentation assets/cache references and the prior software metadata. Preserve data stores, files and credentials; no schema migration or database restoration is required.
