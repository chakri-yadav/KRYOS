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
 await page.evaluate(async()=>{securityState.passHash=await hashSecret('9619');isSecurityUnlocked=true;await consumeBundledAssistantImports();document.querySelector('#security-overlay').remove();document.querySelectorAll('.is-locked').forEach(e=>e.classList.remove('is-locked'));setPage('journal');});
 await page.locator('#life-draft').fill('A focused morning. Walked for 20 minutes.');
 await page.getByRole('button',{name:'Save journal',exact:true}).click();
 await page.reload();
 await page.evaluate(()=>{isSecurityUnlocked=true;document.querySelector('#security-overlay').remove();document.querySelectorAll('.is-locked').forEach(e=>e.classList.remove('is-locked'));setPage('journal');});
 assert.equal(await page.locator('.life-entry').count(),2);
 assert.equal(await page.evaluate(()=>lifeStore().entries.filter(entry=>entry.packageId==='assistant-2026-09-17-day-1').length),1);
 await page.getByText('Add a structured record',{exact:true}).click();
 await page.locator('#life-record-form [name=title]').fill('Morning walk');
 await page.locator('#life-record-form [name=domain]').selectOption('Movement');
 await page.locator('#life-record-form [name=minutes]').fill('20');
 await page.getByRole('button',{name:'Save record',exact:true}).click();
 await page.evaluate(()=>setPage('progress'));
 assert.equal(await page.locator('.life-cell').count(),84);
 await page.getByRole('button',{name:"Set today's outcome",exact:true}).click();
 assert.equal(await page.evaluate(()=>currentPage),'today');
 await page.evaluate(()=>{
   const b=getBehavior();
   for(let i=40;i>=0;i--){
     const date=toDateKey(addDays(new Date(),-i));
     if(i%6!==0)b.dailyPlans[date]={outcome:'Finish a DSA practice set',nextAction:'Open the next problem',outcomeCompletedAt:new Date().toISOString()};
     b.sessions.push({id:`test-${i}`,date,completed:true,mode:'BUILD',minutes:(i%4+1)*25});
   }
   b.pointEvents.push({id:'test-points',date:toDateKey(),points:35});
   b.rewards=[{id:'walk',title:'Long leisure walk',cost:20,active:true},{id:'meal',title:'Favorite meal',cost:60,active:true}];
   saveTasks();setPage('progress');
 });
 await page.locator('[data-progress-reward]').selectOption('meal');
 assert.equal(await page.evaluate(()=>lifeStore().selectedRewardId),'meal');
 await page.getByRole('button',{name:'View rewards',exact:false}).click();
 assert.equal(await page.evaluate(()=>currentPage),'rewards');
 await page.evaluate(()=>setPage('progress'));
 assert.equal(await page.locator('[data-progress-reward]').inputValue(),'meal');
 await page.evaluate(()=>{const p=getDailyPlan();p.outcome='Finish a DSA practice set';p.nextAction='Open the next problem';saveTasks();renderLifeProgress();});
 await page.getByRole('button',{name:'Start 5 minutes',exact:true}).click();
 assert.equal(await page.evaluate(()=>currentPage),'focus');
 await page.evaluate(()=>{clearInterval(focusTicker);activeFocus=null;getDailyPlan().outcomeCompletedAt=new Date().toISOString();saveTasks();setPage('progress');});
 assert.equal(await page.locator('.progress-finish.done').count(),1);
 await page.locator('#progress-range').selectOption('364');
 assert.equal(await page.locator('.life-cell').count(),364);
 await page.locator('#progress-range').selectOption('84');
 await page.locator('#progress-metric').selectOption('focus');
 assert.ok(await page.locator('.life-cell.level-3').count()>0);
 await page.locator('.life-cell:not([disabled])').first().click();
 await page.getByText('Focus history',{exact:true}).click();
 await page.screenshot({path:'tests/progress-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'tests/progress-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile horizontal overflow');
 await page.locator('#progress-range').selectOption('364');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'year view mobile overflow');
 await page.setViewportSize({width:320,height:740});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'small mobile overflow');
 assert.deepEqual(errors,[]);
 console.log('PASS: journal persistence, navigation, reward selection, heatmap filters, desktop and mobile layouts, no runtime errors');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
