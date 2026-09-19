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

    assert.deepEqual(await page.locator('.nav-item').allTextContents(), ['Journal', 'Progress']);
    await page.locator('#unlock-pass').fill('9619');
    await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    await page.waitForFunction(() => lifeStore().entries.some(entry => entry.packageId === 'assistant-2026-09-17-day-1'));
    assert.equal(await page.evaluate(() => accountMode), 'personal');
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-17-day-1').length), 1);
    assert.equal(await page.evaluate(() => lifeStore().records.filter(record => record.date === '2026-09-17' && record.completed).length), 17);

    await page.locator('#life-draft').fill('A focused journal test.');
    await page.getByRole('button', { name: 'Save journal', exact: true }).click();
    await page.reload();
    if (await page.locator('#unlock-pass').count()) {
      await page.locator('#unlock-pass').fill('9619');
      await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    }
    assert.equal(await page.evaluate(() => lifeStore().entries.filter(entry => entry.packageId === 'assistant-2026-09-17-day-1').length), 1);

    await page.getByRole('button', { name: 'Progress', exact: true }).first().click();
    assert.equal(await page.locator('.life-cell').count(), 84);
    assert.ok(await page.getByText('17', { exact: true }).count() > 0);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.setViewportSize({ width: 320, height: 740 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log('PASS: 9619 personal login, automatic Day 1 import, deduplication, journal persistence and responsive progress');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
