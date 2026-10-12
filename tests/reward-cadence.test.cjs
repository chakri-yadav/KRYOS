const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
require('../reward-rules-v5.js');const R=globalThis.KryosRewardV5;
test('four rewards preserve prices and enforce exact 3/5/7/9 day boundaries',()=>{
 assert.deepEqual(R.catalog.map(r=>r.cost),[5,25,90,100]);assert.deepEqual(R.catalog.map(r=>r.cooldownDays),[3,5,7,9]);
 assert.match(R.catalog[0].note,/one-hour/);
 for(const reward of R.catalog){
  const used='2026-10-12',next=R.shift(used,reward.cooldownDays),rows=Array.from({length:7},(_,i)=>({date:R.shift(next,-i),qualified:true,ruleVersion:5}));
  const redemptions=[{rewardId:reward.id,date:used,status:'confirmed'}],gate=R.eligibility(reward,rows,redemptions,R.shift(next,-1));
  assert.equal(gate.allowed,false);assert.equal(gate.missingCooldown,1);assert.equal(gate.availableOn,next);
  assert.equal(R.eligibility(reward,rows,redemptions,next).allowed,true);
  assert.equal(R.eligibility(reward,rows,[{...redemptions[0],status:'rejected'}],next).allowed,true);
 }
});
test('personal call still requires five distinct qualified dates even after waiting',()=>{
 const reward=R.catalog[3],date='2026-10-21',row={date,qualified:true,ruleVersion:5};
 assert.equal(R.eligibility(reward,Array(5).fill(row),[],date).allowed,false);
 assert.equal(R.eligibility(reward,[],[],date).missingDays,5);
});
test('correcting water and repetitions removes only their dependent evidence',()=>{
 const date='2026-10-12',tasks={rhythm:{events:[{date,habitId:'water',value:3},{date,habitId:'\u0061\u0064\u0069\u0074\u0079\u0061',value:3},{date,habitId:'\u0063\u0068\u0061\u006c\u0069\u0073\u0061',value:3}]},life:{rewardEvents:[{id:'mock',date,kind:'mock',title:'Defined mock completed',completed:true}]}};
 const before=R.evaluate(date,tasks);assert.equal(before.scores.foundation,8);
 tasks.rhythm.events[0].value=0;tasks.rhythm.events[1].value=0;
 const after=R.evaluate(date,tasks);assert.equal(after.scores.foundation,0);assert.equal(after.scores.purpose,before.scores.purpose);
 tasks.rhythm.events[0].value=3;tasks.rhythm.events[1].value=3;assert.equal(R.evaluate(date,tasks).credits,before.credits);
});

