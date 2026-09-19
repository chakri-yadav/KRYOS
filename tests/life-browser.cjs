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

    assert.deepEqual(await page.locator('.nav-item').allTextContents(), ['Journal', 'Actions', 'Career', 'Progress', 'Rewards']);
    await page.locator('#unlock-pass').fill('9619');
    await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    await page.waitForFunction(() => lifeStore().entries.some(entry => entry.packageId === 'assistant-2026-09-17-day-1'));
    await page.waitForFunction(() => lifeStore().entries.some(entry => entry.packageId === 'assistant-2026-09-19-master-actions-page-1'));
    assert.equal(await page.evaluate(() => accountMode), 'personal');
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-17-day-1').length), 1);
    assert.equal(await page.evaluate(() => lifeStore().records.filter(record => record.date === '2026-09-17' && record.completed).length), 17);
    assert.equal(await page.evaluate(() => journalRewardStats().earned), 0);
    assert.equal(await page.evaluate(() => lifeStore().actions.filter(action => action.externalId.startsWith('action-')).length), 13);
    assert.equal(await page.evaluate(() => lifeStore().actions.find(action => action.externalId === 'action-haircut-2026-09-21').deadline), '2026-09-21');
    assert.equal(await page.evaluate(() => lifeStore().actions.find(action => action.externalId === 'action-part-time-payment-balance').nextAction), 'Confirm and collect approximately $225-$226.');

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

    await page.getByRole('button', { name: 'Journal', exact: true }).first().click();
    await page.locator('#life-draft').fill('A focused journal test.');
    await page.getByRole('button', { name: 'Save to timeline', exact: true }).click();
    await page.reload();
    if (await page.locator('#unlock-pass').count()) {
      await page.locator('#unlock-pass').fill('9619');
      await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    }
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-17-day-1').length), 1);
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-19-master-actions-page-1').length), 1);
    assert.equal(await page.evaluate(() => lifeStore().actions.filter(action => action.externalId.startsWith('action-')).length), 13);

    await page.getByRole('button', { name: 'Career', exact: true }).first().click();
    assert.equal(await page.locator('.career-week-pulse .career-pulse-day').count(), 7);
    assert.equal(await page.locator('.career-heatmap .heat-cell').count(), 364);
    assert.ok(await page.locator('.career-portfolio-row').count() >= 2);
    assert.equal(await page.getByRole('button', { name: 'Edit roadmap' }).count(), 1);
    assert.equal(await page.locator('.career-command').evaluate(element => element.scrollWidth <= element.clientWidth), true);

    await page.getByRole('button', { name: 'Progress', exact: true }).first().click();
    assert.equal(await page.locator('.life-cell').count(), 84);
    assert.ok(await page.getByText('17', { exact: true }).count() > 0);
    await page.getByRole('button', { name: 'Rewards', exact: true }).first().click();
    assert.ok(await page.getByText('Astrology remains protected', { exact: true }).count() > 0);
    assert.ok(await page.getByText('No reviewed days yet. Journal evidence alone does not create credits.', { exact: true }).count() > 0);
    assert.deepEqual(errors, []);
    console.log('PASS: journal, Action Vault, Career command center, analytics, rewards and persistence');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
