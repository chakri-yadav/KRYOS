const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
require('../supabase/functions/kryos-ingest/commitment-core.js');require('../reward-rules-v5.js');const C=globalThis.KryosCommitment,R=globalThis.KryosRewardV5;
test('Progress and Inner Command share the exact cycle, battle outcomes and corrections',()=>{
 const life={actions:[]};C.ensure(life);const date=C.cycle.startDate,day=C.day(life,date);
 day.planSet=true;day.reviewedAt='fixture';for(const item of C.items.filter(i=>i.type!=='guidance'))day.items[item.id]='kept';
 const before=JSON.stringify(life),model=C.journey(life,'2026-10-12');assert.equal(model.days.length,48);assert.equal(model.days[0].date,'2026-10-11');assert.equal(model.days[47].date,'2026-11-27');assert.equal(model.days[0].state,'won');assert.equal(JSON.stringify(life),before);
 day.items.instagram='missed';assert.equal(C.journey(life,'2026-10-12').days[0].state,'not-won');
 const context={KryosCommitment:C,lifeStore:()=>life,document:{addEventListener(){}},progressRecords:()=>[]};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../progress-evidence.js'),'utf8'),context);const html=context.progressJourney('2026-10-12');
 assert.match(html,/October 11 – November 27/);assert.doesNotMatch(html,/September 26|November 12|containmentDays/);assert.match(html,/data-progress-command-day="2026-10-11"/);assert.match(html,/journey-not-won/);
});
test('wallet restart excludes earlier points, old spending and late backfills',()=>{
 const reset={earnFromDate:'2026-10-12',createdAt:'2026-10-12T07:00:00.000Z'},rows=[{date:'2026-09-26',credits:100},{date:'2026-10-11',credits:20},{date:'legacy-weekly',credits:20}],spent=[{status:'confirmed',cost:90,createdAt:'2026-10-11T14:00:00.000Z'}];
 assert.equal(R.wallet(rows,spent,{},reset).balance,0);rows[1].credits=100;assert.equal(R.wallet(rows,spent,{},reset).balance,0);
 rows.push({date:'2026-10-12',credits:8});assert.equal(R.wallet(rows,spent,{},reset).balance,8);
 spent.push({status:'confirmed',cost:5,createdAt:'2026-10-12T14:00:00.000Z'});assert.equal(R.wallet(rows,spent,{},reset).balance,3);
});
test('Today signal text and count have opaque, high-contrast surfaces',()=>{
 const css=fs.readFileSync(require('node:path').join(__dirname,'../progress-flow-ui.css'),'utf8');assert.match(css,/life-section\.evidence-today\{[^}]*background:#153d31;color:#fff/);assert.match(css,/evidence-today-orbit strong\{color:#153d31/);assert.match(css,/box-shadow:none/);assert.match(css,/evidence-today-orbit\{display:grid;place-items:center;width:108px;height:108px/);
});
