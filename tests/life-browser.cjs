const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('index.html')).href);
 // This context is isolated from the user's browser and contains no personal data.
 await page.evaluate(()=>{isSecurityUnlocked=true;document.querySelector('#security-overlay').remove();document.querySelectorAll('.is-locked').forEach(e=>e.classList.remove('is-locked'));setPage('journal');});
 await page.locator('#life-draft').fill('A focused morning. Walked for 20 minutes.');
 await page.getByRole('button',{name:'Save journal',exact:true}).click();
 await page.reload();
 await page.evaluate(()=>{isSecurityUnlocked=true;document.querySelector('#security-overlay').remove();document.querySelectorAll('.is-locked').forEach(e=>e.classList.remove('is-locked'));setPage('journal');});
 assert.equal(await page.locator('.life-entry').count(),1);
 await page.getByText('Add a structured record',{exact:true}).click();
 await page.locator('#life-record-form [name=title]').fill('Morning walk');
 await page.locator('#life-record-form [name=domain]').selectOption('Movement');
 await page.locator('#life-record-form [name=minutes]').fill('20');
 await page.getByRole('button',{name:'Save record',exact:true}).click();
 await page.evaluate(()=>setPage('progress'));
 assert.equal(await page.locator('.life-cell').count(),84);
 await page.screenshot({path:'tests/progress-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'tests/progress-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile horizontal overflow');
 assert.deepEqual(errors,[]);
 console.log('PASS: journal persistence, record creation, progress render, mobile overflow, no runtime errors');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
