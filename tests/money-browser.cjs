const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    await page.locator('#unlock-pass').fill('9619');
    await page.getByRole('button', { name: 'Enter KRYOS' }).click();
    await page.getByRole('button', { name: 'Money', exact: true }).first().click();
    assert.equal(await page.locator('.money-metric').count(), 3);
    await page.getByRole('button', { name: 'Add split' }).click();
    await page.locator('#money-form [name=verifiedDate]').fill('2026-09-26');
    await page.locator('#money-form [name=card]').fill('1000');
    await page.locator('#money-form [name=friendCard]').fill('700');
    await page.locator('#money-form [name=ownCard]').fill('200');
    await page.locator('#money-form [name=direct]').fill('100');
    await page.locator('#money-form [name=request]').fill('100');
    await page.getByRole('button', { name: 'Save record' }).click();
    assert.match(await page.locator('.money-form-error').textContent(), /must equal/);
    await page.locator('#money-form [name=ownCard]').fill('300');
    await page.getByRole('button', { name: 'Save record' }).click();
    assert.equal(await page.evaluate(() => moneySettlement().differenceCents), 0);
    assert.match(await page.locator('.money-reconcile').textContent(), /matches to the cent/);
    await page.getByRole('button', { name: 'Open call brief' }).first().click();
    assert.equal(await page.locator('.money-call-focus').count(), 1);
    assert.match(await page.locator('.money-focus-amount').textContent(), /\$100\.00/);
    await page.getByRole('button', { name: 'Overview' }).click();
    assert.equal(await page.locator('.money-metric').count(), 3);
    assert.deepEqual(errors, []);
    console.log('PASS: Money checkpoint validation, reconciliation, and call focus');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
