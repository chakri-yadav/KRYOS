const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('index.html')).href);

    assert.deepEqual(await page.locator('.nav-item').allTextContents(), ['Inner Command', 'Actions', 'Career', 'Launch', 'Rhythm', 'Money', 'Progress', 'Rewards']);
    await page.locator('#unlock-pass').fill('9619');
    await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    await page.waitForFunction(() => lifeStore().entries.some(entry => entry.packageId === 'assistant-2026-09-17-day-1'));
    await page.waitForFunction(() => lifeStore().entries.some(entry => entry.packageId === 'assistant-2026-09-19-master-actions-page-1'));
    await page.waitForFunction(() => lifeStore().entries.some(entry => entry.packageId === 'assistant-2026-09-19-radhashtami-review'));
    assert.equal(await page.evaluate(() => accountMode), 'personal');
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-17-day-1').length), 1);
    assert.equal(await page.evaluate(() => lifeStore().records.filter(record => record.date === '2026-09-17' && record.completed).length), 17);
    assert.equal(await page.evaluate(() => journalRewardStats().earned), 0);
    assert.equal(await page.evaluate(() => lifeStore().actions.filter(action => action.externalId.startsWith('action-')).length), 13);
    assert.equal(await page.evaluate(() => lifeStore().actions.find(action => action.externalId === 'action-haircut-2026-09-21').deadline), '2026-09-21');
    assert.equal(await page.evaluate(() => lifeStore().actions.find(action => action.externalId === 'action-part-time-payment-balance').nextAction), 'Confirm and collect approximately $225-$226.');
    assert.equal(await page.locator('.command-archetypes article').count(), 3);
    assert.equal(await page.locator('.containment-days button').count(), 45);
    await page.getByRole('button', { name: 'Record breach' }).click();
    await page.locator('#life-containment-form [value=social]').check();
    await page.locator('#life-containment-form [name=note]').fill('Test evidence.');
    await page.getByRole('button', { name: 'Record and return' }).click();
    assert.equal(await page.evaluate(() => innerCommandRecord(toDateKey()).boundary), 'social');
    assert.equal(await page.evaluate(() => innerCommandStatus(toDateKey())), 'breach');

    await page.getByRole('button', { name: 'Actions', exact: true }).first().click();
    await page.locator('.action-add summary').click();
    await page.locator('#action-add-form [name=title]').fill('Renew important document');
    await page.locator('#action-add-form [name=nextAction]').fill('Find the renewal requirements');
    await page.locator('#action-add-form [name=priority]').selectOption('important');
    await page.getByRole('button', { name: 'Keep in Vault' }).click();
    assert.equal(await page.getByText('Renew important document', { exact: true }).count(), 1);
    await page.getByRole('button', { name: 'Edit Renew important document' }).click();
    await page.locator('#action-edit-form [name=title]').fill('Renew important document safely');
    await page.locator('#action-edit-form [name=deadline]').fill('2026-09-30');
    await page.getByRole('button', { name: 'Save changes' }).click();
    assert.equal(await page.getByText('Renew important document safely', { exact: true }).count(), 1);

    await page.setViewportSize({ width: 430, height: 932 });
    assert.equal(await page.locator('#actions-view').evaluate(element => element.scrollWidth <= element.clientWidth), true);
    assert.equal(await page.locator('.action-toolbar').evaluate(element => getComputedStyle(element).position), 'sticky');
    assert.equal(await page.locator('.action-add summary').evaluate(element => element.getBoundingClientRect().height >= 44), true);
    assert.equal(await page.locator('.action-check').first().evaluate(element => element.getBoundingClientRect().width >= 44 && element.getBoundingClientRect().height >= 44), true);
    assert.equal(await page.locator('.action-controls select').first().evaluate(element => element.getBoundingClientRect().height >= 44), true);
    await page.locator('.action-add summary').click();
    assert.equal(await page.locator('#action-add-form').evaluate(element => element.scrollWidth <= element.clientWidth), true);
    await page.locator('.action-add summary').click();
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.getByRole('button', { name: 'Inner Command', exact: true }).first().click();
    await page.locator('#life-draft').fill('A focused journal test.');
    await page.getByRole('button', { name: 'Save to timeline', exact: true }).click();
    await page.reload();
    if (await page.locator('#unlock-pass').count()) {
      await page.locator('#unlock-pass').fill('9619');
      await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    }
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-17-day-1').length), 1);
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-19-master-actions-page-1').length), 1);
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-19-radhashtami-review').length), 1);
    assert.equal(await page.evaluate(() => rhythmValue('water', '2026-09-19')), 2);
    assert.equal(await page.evaluate(() => rhythmValue('dinner', '2026-09-19')), 1);
    assert.equal(await page.evaluate(() => lifeStore().actions.find(action => action.externalId === 'action-stem-premium-fee').completedAt), '2026-09-19T12:00:00.000Z');
    assert.equal(await page.evaluate(() => lifeStore().actions.filter(action => action.externalId.startsWith('action-')).length), 13);
    assert.equal(await page.evaluate(() => innerCommandStatus(toDateKey())), 'breach');

    await page.getByRole('button', { name: 'Career', exact: true }).first().click();
    assert.equal(await page.locator('.career-week-pulse .career-pulse-day').count(), 7);
    assert.equal(await page.locator('.career-heatmap .heat-cell').count(), 364);
    assert.ok(await page.locator('.career-portfolio-row').count() >= 2);
    assert.equal(await page.getByRole('button', { name: 'Edit roadmap' }).count(), 1);
    assert.equal(await page.locator('.career-command').evaluate(element => element.scrollWidth <= element.clientWidth), true);
    assert.equal(await page.locator('.dsa-lane-summary article').count(), 2);
    assert.equal(await page.locator('.career-journey-module').count(), 18);
    assert.ok(await page.getByText('/150', { exact: true }).count() > 0);
    await page.locator('.career-portfolio-row').filter({ hasText: 'API Design & Backend Engineering' }).click();
    assert.equal(await page.locator('.career-phase-brief').count(), 9);
    await page.getByRole('button', { name: 'Edit roadmap' }).click();
    assert.equal(await page.locator('.module-deadline-editor input[type=date]').count(), 9);
    assert.ok(await page.locator('.topic-deadline-editor input[type=date]').count() > 9);
    await page.locator('.module-deadline-editor input[type=date]').first().fill('2026-09-25');
    await page.locator('.topic-deadline-editor input[type=date]').first().fill('2026-09-23');
    await page.getByRole('button', { name: 'Save changes' }).click();
    assert.equal(await page.locator('.module-deadline-summary').count(), 1);
    assert.equal(await page.locator('.topic-deadline-summary').count(), 1);
    assert.equal(await page.locator('#career-view').evaluate(element => element.scrollWidth <= element.clientWidth), true);
    await page.setViewportSize({ width: 900, height: 1000 });
    assert.equal(await page.locator('#career-view').evaluate(element => element.scrollWidth <= element.clientWidth), true);
    await page.setViewportSize({ width: 430, height: 932 });
    assert.equal(await page.locator('.career-detail').evaluate(element => getComputedStyle(element).display), 'grid');
    assert.equal(await page.locator('.career-detail .module-block').count(), 9);
    assert.ok(await page.locator('.career-detail .topic-block').count() > 9);
    assert.ok(await page.locator('.career-detail .check-item.read-only').count() > 20);
    assert.equal(await page.locator('.career-edit-toggle').isVisible(), false);
    assert.equal(await page.locator('.career-quick-add').isVisible(), false);
    assert.equal(await page.locator('.career-mobile-index button').count(), 4);
    assert.equal(await page.locator('#career-view').evaluate(element => element.scrollWidth <= element.clientWidth), true);
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.getByRole('button', { name: 'Launch', exact: true }).first().click();
    assert.equal(await page.locator('.launch-week-pulse article').count(), 7);
    assert.equal(await page.locator('.launch-heatmap i').count(), 84);
    assert.equal(await page.locator('.launch-platforms button').count(), 6);
    await page.getByRole('button', { name: /Built In/ }).click();
    await page.getByRole('button', { name: 'Log market action' }).click();
    await page.locator('#launch-form [name=company]').fill('Example Company');
    await page.locator('#launch-form [name=role]').fill('Software Engineer');
    await page.locator('#launch-form [name=stage]').selectOption('applied');
    await page.getByRole('button', { name: 'Save evidence' }).click();
    await page.getByRole('button', { name: 'Log rehearsal' }).click();
    await page.locator('#launch-form [name=mode]').selectOption('ai');
    await page.locator('#launch-form [name=minutes]').fill('20');
    await page.locator('#launch-form [name=focus]').fill('Behavioral questions');
    await page.getByRole('button', { name: 'Save evidence' }).click();
    await page.getByRole('button', { name: 'Log connection action' }).click();
    await page.locator('#launch-form [name=person]').fill('Professional connection');
    await page.locator('#launch-form [name=note]').fill('Sent a relevant message about their work.');
    await page.getByRole('button', { name: 'Save evidence' }).click();
    await page.getByRole('button', { name: 'Log post' }).click();
    await page.locator('#launch-form [name=topic]').fill('What I learned from system design practice');
    await page.getByRole('button', { name: 'Save evidence' }).click();
    assert.equal(await page.evaluate(() => launchStore().marketEvents.length), 4);
    assert.equal(await page.evaluate(() => launchStore().marketEvents.filter(item => item.type === 'post' && item.status === 'published').length), 1);
    assert.equal(await page.evaluate(() => launchStore().mockSessions.length), 1);

    await page.getByRole('button', { name: 'Rhythm', exact: true }).first().click();
    assert.equal(await page.locator('.rhythm-constellation-grid button').count(), 28);
    assert.equal(await page.locator('.rhythm-weekly-row').count(), 3);
    const breakfast = page.locator('[data-rhythm-toggle="breakfast"]');
    await breakfast.click();
    assert.equal(await page.evaluate(() => rhythmValue('breakfast')), 1);
    await page.reload();
    if (await page.locator('#unlock-pass').count()) {
      await page.locator('#unlock-pass').fill('9619');
      await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    }
    await page.getByRole('button', { name: 'Rhythm', exact: true }).first().click();
    assert.equal(await page.evaluate(() => rhythmValue('breakfast')), 1);
    await page.getByRole('button', { name: 'Launch', exact: true }).first().click();
    assert.equal(await page.evaluate(() => launchStore().marketEvents.length), 4);
    assert.equal(await page.evaluate(() => launchStore().mockSessions.length), 1);

    await page.getByRole('button', { name: 'Money', exact: true }).first().click();
    await page.getByRole('button', { name: 'Set baseline' }).click();
    await page.locator('#money-form [name=friendName]').fill('Friend');
    await page.locator('#money-form [name=original]').fill('2000');
    await page.locator('#money-form [name=owed]').fill('1400');
    await page.getByRole('button', { name: 'Save record' }).click();
    await page.getByRole('button', { name: 'Log contact', exact: true }).first().click();
    await page.locator('#money-form [name=outcome]').selectOption('promised-payment');
    await page.locator('#money-form [name=promised]').fill('250');
    await page.locator('#money-form [name=promiseDate]').fill('2026-09-25');
    await page.locator('#money-form [name=note]').fill('Promised the first payment.');
    await page.getByRole('button', { name: 'Save record' }).click();
    await page.getByRole('button', { name: 'Record payment' }).click();
    await page.locator('#money-form [name=amount]').fill('100');
    await page.getByRole('button', { name: 'Save record' }).click();
    assert.equal(await page.evaluate(() => moneyCurrentOwed()), 130000);
    assert.equal(await page.locator('.money-contact-grid i').count(), 30);
    assert.equal(await page.evaluate(() => moneyStore().contacts.length), 1);
    await page.reload();
    if (await page.locator('#unlock-pass').count()) {
      await page.locator('#unlock-pass').fill('9619');
      await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    }
    await page.getByRole('button', { name: 'Money', exact: true }).first().click();
    assert.equal(await page.evaluate(() => moneyCurrentOwed()), 130000);
    assert.equal(await page.evaluate(() => moneyStore().payments.length), 1);

    await page.getByRole('button', { name: 'Progress', exact: true }).first().click();
    assert.equal(await page.locator('.deadline-progress-panel').count(), 1);
    assert.equal(await page.locator('.deadline-progress-row').count(), 2);
    assert.equal(await page.locator('.life-cell').count(), 84);
    assert.ok(await page.getByText('17', { exact: true }).count() > 0);
    await page.getByRole('button', { name: 'Rewards', exact: true }).first().click();
    assert.equal(await page.locator('.reward-gates > div').count(), 3);
    assert.ok(await page.getByText('Astrology remains protected', { exact: true }).count() > 0);
    assert.equal(await page.evaluate(() => lifeStore().dailyAssessments.filter(item => ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'].includes(item.date)).length), 4);
    assert.deepEqual(errors, []);
    console.log('PASS: Inner Command, Action Vault, Career, Launch, Rhythm, Money, analytics, rewards and persistence');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
