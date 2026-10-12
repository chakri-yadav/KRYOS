import test from 'node:test';
import assert from 'node:assert/strict';
import '../reward-rules-v5.js';
import '../supabase/functions/kryos-ingest/sadhana-core.js';
import {projectRequest} from '../supabase/functions/kryos-ingest/projector.mjs';
const R=globalThis.KryosRewardV5,C=globalThis.KryosSadhana,date='2026-10-11';
const meals=d=>['breakfast','lunch','water','face-wash','moisturizer','gita','pranayama'].map(habitId=>({date:d,habitId,value:habitId==='water'?3:1})).concat([{date:d,habitId:'supplements',value:1}]);
const apps=(n,d=date)=>Array.from({length:n},(_,i)=>({id:'a'+i,date:d,type:'application',company:'Fixture '+i,role:'Engineer'}));
const data=(n=1)=>({life:{actions:[]},rhythm:{events:meals(date)},launch:{marketEvents:apps(n)}});
test('operating day changes at 7 Chicago, not midnight, including DST',()=>{
 assert.equal(C.today('2026-10-12T06:00:00Z'),'2026-10-11');
 assert.equal(C.today('2026-10-12T11:59:59Z'),'2026-10-11');
 assert.equal(C.today('2026-10-12T12:00:00Z'),'2026-10-12');
 assert.equal(C.today('2026-11-01T12:59:59Z'),'2026-10-31');
 assert.equal(C.today('2026-11-01T13:00:00Z'),'2026-11-01');
});
test('application curve rewards first completion and caps volume at 40',()=>{
 assert.equal(R.evaluate(date,data(1)).scores.purpose,15);
 assert.equal(R.evaluate(date,data(2)).scores.purpose,23);
 assert.equal(R.evaluate(date,data(55)).scores.purpose,40);
 assert.equal(R.evaluate(date,data(1000)).scores.purpose,40);
});
test('duplicate submissions and overlapping aggregate snapshots never double count',()=>{
 const t=data(3);t.launch.marketEvents.push(...apps(3));
 t.life.marketingSummaries=[{date,workspaceId:'marketing-onedrive',revision:2,submittedCount:3}];
 assert.equal(R.evaluate(date,t).scores.purpose,29);
 t.life.marketingSummaries[0].submittedCount=5;
 assert.equal(R.evaluate(date,t).scores.purpose,36);
});
test('stats replacement of a lower count reduces earnings',()=>{
 const t=data(0);t.life.marketingSummaries=[{date,submittedCount:55}];
 assert.equal(R.evaluate(date,t).scores.purpose,40);
 t.life.marketingSummaries[0].submittedCount=1;
 assert.equal(R.evaluate(date,t).scores.purpose,15);
});
test('qualified day does not need perfect foundations or Sadhana win',()=>{
 const t=data(1);assert.equal(R.evaluate(date,t).qualified,true);assert.equal(R.evaluate(date,t).scores.bonus,3);
 t.life.sadhana={days:{[date]:{breaches:[{boundaries:['instagram']}]}}};
 assert.equal(R.evaluate(date,t).deduction,0);
 assert.equal(R.evaluate(date,t).qualified,true);
});
test('start alone earns acknowledgement but never qualifies',()=>{
 const t=data(0);t.life.rewardEvents=[{id:'start',date,kind:'application-start',title:'Prepared application fields',completed:true}];
 const a=R.evaluate(date,t);assert.equal(a.scores.purpose,5);assert.equal(a.credits,4);assert.equal(a.qualified,false);
});
test('journals, imported jobs, vague records and passive mock minutes create no credit',()=>{
 const t={life:{entries:[{date,text:'I worked hard'}],records:[{date,kind:'activity',domain:'Career',completed:true,title:'Studied'}]},marketing:{batches:[{roles:apps(10)}]},launch:{mockSessions:[{id:'x',date,minutes:120}]}};
 assert.equal(R.evaluate(date,t).total,0);
});
test('typed serious mock is accepted without a timer and cannot also earn articulation',()=>{
 const t=data(0);t.life.rewardEvents=[{id:'x',date,kind:'mock',title:'Mock complete and lesson recorded',completed:true},{id:'x',date,kind:'articulation-medium',title:'Same mock',completed:true}];
 const a=R.evaluate(date,t);assert.ok(a.total<=40);assert.ok(a.scores.purpose===0||a.scores.articulation===0);
});
test('purpose category is capped at 50 with applications and career',()=>{
 const t=data(55);t.life.rewardEvents=[{id:'c',date,kind:'concept',title:'Explained concept',completed:true},{id:'p',date,kind:'practice',title:'Worked example',completed:true},{id:'m',date,kind:'mock',title:'Completed mock',completed:true}];
 assert.equal(R.evaluate(date,t).scores.purpose,50);
});
test('reopened Career check removes its score; repeated toggles count once',()=>{
 const t=data(0),c={roadmaps:[{id:'r',modules:[{topics:[{checklist:[{id:'x',done:true}]}]}]}],activityLog:[{id:'a',date,roadmapId:'r',checkId:'x'},{id:'b',date,roadmapId:'r',checkId:'x'}]};
 assert.equal(R.evaluate(date,t,c).scores.purpose,20);c.roadmaps[0].modules[0].topics[0].checklist[0].done=false;
 assert.equal(R.evaluate(date,t,c).scores.purpose,0);
});
test('money follow-up with no response earns more than record receipt alone',()=>{
 const t={money:{contacts:[{id:'x',date,method:'call',outcome:'No reply',note:'Retry tomorrow'}],payments:[{id:'y',date,amountCents:100000}]}};
 assert.equal(R.evaluate(date,t).scores.responsibility,10);
 assert.equal(R.evaluate(date,{money:{payments:t.money.payments}}).total,0);
});
test('weekly milestones do not pay repeatedly while a window stays met',()=>{
 const t={rhythm:{events:[{date,habitId:'exercise',value:1},{date:R.shift(date,1),habitId:'exercise',value:1},{date:R.shift(date,2),habitId:'exercise',value:1},{date,habitId:'hair-care',value:1},{date:R.shift(date,1),habitId:'hair-care',value:1}]}};
 assert.equal(R.maintenance(t,R.shift(date,3)).filter(e=>e.title.includes('exercise')).length,1);
 assert.equal(R.maintenance(t,R.shift(date,3)).filter(e=>e.title.includes('hair')).length,1);
});
test('repetition requires 3 and excess water/supplements never inflates score',()=>{
 const t={rhythm:{events:[{date,habitId:'aditya',value:1},{date,habitId:'chalisa',value:2}]}};
 assert.equal(R.evaluate(date,t).scores.foundation,0);
 t.rhythm.events.forEach(e=>e.value=3);assert.equal(R.evaluate(date,t).scores.foundation,5);
 t.rhythm.events.push({date,habitId:'water',value:20},{date,habitId:'supplements',value:8});
 assert.equal(R.evaluate(date,t).scores.foundation,9);
});
test('consistency is small; lapse does not reduce old earnings',()=>{
 const t=data(1);t.launch.marketEvents.push(...apps(1,R.shift(date,1)),...apps(1,R.shift(date,2)));
 t.launch.marketEvents.forEach((e,i)=>e.company='Fixture '+i);t.rhythm.events.push(...meals(R.shift(date,1)),...meals(R.shift(date,2)));
 assert.equal(R.evaluate(R.shift(date,2),t).scores.bonus,5);
 assert.equal(R.evaluate(R.shift(date,3),t).scores.bonus,0);
});
test('wallet reservations and factual deficits are bounded',()=>{
 const w=R.wallet([{date,credits:10}],[{cost:3,status:'confirmed'}],{amount:100});
 assert.equal(w.balance,7);assert.equal(w.reserved,7);assert.equal(w.available,0);
 assert.equal(R.wallet([{date,credits:1}],[{cost:3,status:'confirmed'}]).adjustmentDue,2);
});
test('call eligibility counts distinct previous-seven dates; cooldown exact boundary',()=>{
 const r=R.catalog[3],rows=Array.from({length:5},(_,i)=>({date:R.shift(date,-i),ruleVersion:5,qualified:true}));
 assert.equal(R.eligibility(r,rows,[],date).allowed,true);
 assert.equal(R.eligibility(r,rows,[{rewardId:r.id,status:'confirmed',date:R.shift(date,-6)}],date).allowed,false);
 assert.equal(R.eligibility(r,rows,[{rewardId:r.id,status:'confirmed',date:R.shift(date,-7)}],date).allowed,true);
});
const request=summary=>({schema_version:1,idempotency_key:'fixture',local_date:date,timezone:'America/Chicago',raw_text:'Stats snapshot supplied.',operations:[{type:'marketing.stats.import',summary,evidence_quote:'Stats snapshot supplied.'}]});
test('assistant stats import replaces same date without importing job details',()=>{
 const summary={date,workspaceId:'marketing-onedrive',revision:2,submittedCount:3},a=projectRequest(request(summary),{}, {},'2026-10-12T18:00:00Z');
 const b=projectRequest(request({...summary,revision:3,submittedCount:2}),a.tasks,{},'2026-10-12T18:00:00Z');
 assert.equal(b.tasks.life.marketingSummaries.length,1);assert.equal(b.tasks.life.marketingSummaries[0].submittedCount,2);assert.equal(b.marketingChanged,false);
 assert.throws(()=>projectRequest(request({...summary,resume:'not permitted'}),{},{}));
 assert.throws(()=>projectRequest(request({...summary,revision:1}),b.tasks,{}));
});
test('retrospective assessment is deterministic and never mutates inputs',()=>{
 const t=data(3),before=JSON.stringify(t);assert.deepEqual(R.evaluate(date,t),R.evaluate(date,t));assert.equal(JSON.stringify(t),before);assert.equal(R.dayOf({completedAt:'2026-10-12T06:00:00Z'}),date);
});
