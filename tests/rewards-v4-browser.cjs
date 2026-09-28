const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-09-30T18:00:00Z'));
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.locator('#unlock-pass').fill('9619');await page.getByRole('button',{name:'Enter KRYOS'}).click();
  await page.locator('.command-next').waitFor();
  await page.locator('.nav-item[data-page="rewards"]').click();
  await page.getByRole('heading',{name:'Earn it. See why.'}).waitFor();
  assert.equal(await page.locator('.reward-v4-gates button').count(),6);
  assert.equal(await page.getByText('100 credits',{exact:true}).count(),1);
  assert.equal(await page.getByText('90 credits',{exact:true}).count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('.reward-v4-gates [data-page="career"]').click();
  assert.equal(await page.evaluate(()=>currentPage),'career');
  assert.deepEqual(errors,[]);
  console.log('PASS: Rewards renders six qualification gates, corrected prices and working page links');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
