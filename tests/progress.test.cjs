const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup() {
  const behavior={dailyPlans:{},sessions:[],rewards:[],pointEvents:[],redemptions:[]};
  const c=vm.createContext({taskState:{},document:{addEventListener(){}},getBehavior:()=>behavior,toDateKey:(d)=>d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '2026-09-17'});
  vm.runInContext(fs.readFileSync('life.js','utf8'),c);
  vm.runInContext(fs.readFileSync('progress.js','utf8'),c);
  return {c,behavior};
}
test('streak spans beyond the visible 84 days and scheduled rest does not break it',()=>{
  const {c,behavior}=setup();
  for(let d='2026-01-01';d<='2026-09-17';d=c.progressDate(d,1))behavior.dailyPlans[d]={outcome:'Work',outcomeCompletedAt:d};
  const result=c.progressHistory();assert.ok(result.current>84);assert.equal(result.current,result.best);assert.equal(result.total,260);
});
test('today remains open; a missed prior scheduled day breaks the current streak but preserves best',()=>{
  const {c,behavior}=setup();
  ['2026-09-10','2026-09-11','2026-09-14','2026-09-15'].forEach(d=>behavior.dailyPlans[d]={outcome:'Work',outcomeCompletedAt:d});
  behavior.dailyPlans['2026-09-16']={outcome:'Work',outcomeCompletedAt:'done'};
  assert.equal(c.progressHistory().current,5);
  delete behavior.dailyPlans['2026-09-16'].outcomeCompletedAt;
  assert.equal(c.progressHistory().current,0);assert.equal(c.progressHistory().best,4);
});
test('journal completions do not silently count as daily outcome wins',()=>{
  const {c}=setup();c.lifeStore().records.push({date:'2026-09-17',completed:true,domain:'Movement'});
  assert.equal(c.progressStatus('2026-09-17'),'unlogged');assert.equal(c.progressHistory().total,0);
});
test('schedule edits apply from their effective date without rewriting the past',()=>{
  const {c}=setup();c.lifeStore().schedules.push({from:'2026-09-18',days:[]});
  assert.equal(c.progressPlanned('2026-09-17'),true);assert.equal(c.progressPlanned('2026-09-18'),false);
});
test('saved reward selection is respected and falls back when reward is inactive',()=>{
  const {c,behavior}=setup();behavior.rewards=[{id:'a',cost:20,active:true},{id:'b',cost:50,active:true}];c.lifeStore().selectedRewardId='b';
  assert.equal(c.progressReward().selected.id,'b');behavior.rewards[1].active=false;assert.equal(c.progressReward().selected.id,'a');
});
