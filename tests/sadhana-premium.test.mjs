import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import '../supabase/functions/kryos-ingest/sadhana-core.js';
const C=globalThis.KryosSadhana;
function setup(date){
  const life={actions:[]};C.ensure(life);
  const handlers=[],writes=[];
  const context={KryosSadhana:{...C,today:()=> '2026-10-11'},sadhanaSelected:()=>date,sadhanaLife:()=>life,lifeNotice:'',escapeHtml:value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),actionSyncLabel:()=> 'Saved on device',renderLifeJournal(){},renderContainmentCovenant(){},document:{addEventListener:(type,handler)=>handlers.push({type,handler})},sadhanaMutate:operation=>writes.push(operation)};
  vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../sadhana-premium.js',import.meta.url),'utf8'),context);
  return {context,life,handlers,writes};
}
test('preparation hides the internal start hour; first day shows the correct Saturday',()=>{
  const zero=setup('2026-10-09'),first=setup('2026-10-10');
  assert.match(zero.context.renderInnerCommandPurpose(),/Preparation/);
  assert.doesNotMatch(zero.context.renderInnerCommandPurpose()+zero.context.renderContainmentCovenant(),/7 a\.m\.|07:00/);
  assert.match(first.context.renderInnerCommandPurpose(),/Day 1 of 48.*Saturday, October 10/);
});
test('live quantity task keeps its Actions identity and escapes user content',()=>{
  const {context,life}=setup('2026-10-10');
  C.apply(life,{type:'task.assign',title:'<unsafe> & task',kind:'quantity',target:55},'2026-10-10','2026-10-09T18:00:00Z','fixture');
  const task=life.sadhana.days['2026-10-10'].tasks[0];
  const html=context.renderContainmentCovenant();
  assert.match(html,/&lt;unsafe&gt; &amp; task/);assert.doesNotMatch(html,/<unsafe>/);
  assert.ok(html.includes(`data-sadhana-task="${task.id}"`));assert.ok(html.includes(`data-sadhana-count="${task.id}"`));
  assert.equal(life.actions.length,1);assert.equal((html.match(/data-sadhana-day=/g)||[]).length,48);
});
test('quantity step uses an absolute total and never creates another task',()=>{
  const {life,handlers,writes}=setup('2026-10-10');
  C.apply(life,{type:'task.assign',title:'Synthetic task',kind:'quantity',target:55},'2026-10-10','2026-10-09T18:00:00Z','fixture');
  const task=life.sadhana.days['2026-10-10'].tasks[0];task.progress={value:24};
  const button={dataset:{commandStep:'1',taskId:task.id},hasAttribute:()=>false};
  const event={target:{closest:selector=>selector==='button'?button:null}};
  handlers.filter(h=>h.type==='click').forEach(h=>h.handler(event));
  assert.equal(writes.length,1);assert.equal(writes[0].value,25);assert.equal(writes[0].taskId,task.id);assert.equal(life.actions.length,1);
});
test('focus changes presentation only and completed tasks remain available to reopen',()=>{
 const {context,life,handlers,writes}=setup('2026-10-10');
 C.apply(life,{type:'task.assign',title:'First fixture'},'2026-10-10','2026-10-09T18:00:00Z','focus-a');
 C.apply(life,{type:'task.assign',title:'Second fixture'},'2026-10-10','2026-10-09T18:00:00Z','focus-b');
 const [first,second]=life.sadhana.days['2026-10-10'].tasks;
 context.document.querySelector=()=>null;
 context.renderLifeJournal=()=>{};
 const button={dataset:{commandFocus:second.id},hasAttribute:()=>false};
 const event={target:{closest:selector=>selector==='[data-command-focus]'?button:null}};
 const before=JSON.stringify(life);
 handlers.filter(h=>h.type==='click').forEach(h=>h.handler(event));
 assert.equal(writes.length,0);assert.equal(JSON.stringify(life),before);
 let html=context.renderContainmentCovenant();
 assert.ok(html.indexOf('Second fixture')<html.indexOf('First fixture'));
 C.apply(life,{type:'task.progress',taskId:second.id,value:1},'2026-10-10','2026-10-10T18:00:00Z','focus-done');
 html=context.renderContainmentCovenant();
 assert.match(html,/command-completed-tasks/);
 assert.ok(html.includes(`data-sadhana-task="${second.id}" checked`));
 assert.ok(html.includes(`data-command-focus="${first.id}"`)===false);
});
test('journey separates unknown past days, current day and future without mutating records',()=>{
  const {context,life}=setup('2026-10-10');
  const before=JSON.stringify(life);
  const days=context.commandJourneyModel(life,'2026-10-11');
  assert.equal(days.length,48);
  assert.equal(days[0].state,'awaiting-review');
  assert.equal(days[1].state,'in-progress');
  assert.equal(days[2].state,'upcoming');
  assert.equal(days[47].date,'2026-11-26');
  assert.equal(JSON.stringify(life),before);
  const html=context.renderCommandJourney(life,'2026-10-10','2026-10-11');
  assert.match(html,/0<small> \/ 48 days won/);
  assert.match(html,/1 days elapsed · 47 remaining including today/);
});
test('recovery does not recolor a real breach as a win; corrections recalculate map',()=>{
  const {context,life}=setup('2026-10-10');
  C.apply(life,{type:'breach.record',boundaries:['instagram'],recovered:true},'2026-10-10','2026-10-10T19:00:00Z','map-breach');
  const d=life.sadhana.days['2026-10-10'];
  for(const item of C.items.filter(i=>i.type!=='guidance'))d.items[item.id]='kept';
  d.planSet=true;d.reviewedAt='2026-10-11T19:00:00Z';
  assert.equal(context.commandJourneyModel(life,'2026-10-11')[0].state,'not-won');
  assert.equal(context.commandJourneyModel(life,'2026-10-11')[0].recovered,true);
  d.breaches[0].correctedAt='2026-10-11T20:00:00Z';
  assert.equal(context.commandJourneyModel(life,'2026-10-11')[0].state,'won');
});
