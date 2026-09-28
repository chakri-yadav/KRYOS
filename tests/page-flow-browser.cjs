const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    for (const width of [1440, 430]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve('index.html')).href);
      await page.locator('#unlock-pass').fill('9619');
      await page.getByRole('button', { name: 'Enter KRYOS' }).click();
      await page.locator('.command-next [data-page]').waitFor();
      assert.equal(await page.locator('#page-connections [data-page]').count(), 2);
      const expectedPage = await page.locator('.command-next [data-page]').getAttribute('data-page');
      await page.locator('.command-next [data-page]').click();
      assert.equal(await page.evaluate(() => currentPage), expectedPage);
      assert.equal(await page.locator('#page-connections [data-page]').count(), 2);
      await page.locator(width < 720 ? '.mobile-nav-item[data-page="journal"]' : '.nav-item[data-page="journal"]').click();
      await page.locator('#page-connections [data-page="career"]').first().click();
      assert.equal(await page.evaluate(() => currentPage), 'career');
      assert.equal(await page.locator('#career-current-focus').isVisible(), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS: dynamic next-step and connected-page navigation at desktop and narrow widths');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
