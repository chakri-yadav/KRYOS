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
