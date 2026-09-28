const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../reward-rules-v4.js');
const R=globalThis.KryosRewardV4,date='2026-09-29';
function sample(){
  const habits=['breakfast','lunch','protein','supplements','face-wash','moisturizer','gita','nama-japa'];
  return {tasks:{life:{actions:[],records:[],innerCommand:{containmentDays:[{date,status:'kept'}]}},rhythm:{events:[...habits.map(habitId=>({date,habitId,value:1})),{date,habitId:'water',value:3}]},launch:{mockSessions:[{date,level:'small',completed:true}]},money:{contacts:[]}},career:{roadmaps:[{id:'r',modules:[{topics:[{checklist:[{id:'a',done:true},{id:'b',done:true}]}]}]}],activityLog:[{date,roadmapId:'r',checkId:'a'},{date,roadmapId:'r',checkId:'b'}]}};
}
test('full agreement qualifies; a lone habit earns partial credit only',()=>{
  const s=sample(),e=R.evaluate(date,s.tasks,s.career);assert.equal(e.qualified,true);assert.equal(e.total,50);assert.equal(e.credits,10);
  const partial=R.evaluate(date,{rhythm:{events:[{date,habitId:'protein',value:1}]}},{});assert.equal(partial.credits,1);assert.equal(partial.qualified,false);
});
test('Career undo, duplicate toggles and parent completion cannot inflate earnings',()=>{
  const s=sample();s.career.activityLog.push({...s.career.activityLog[0]},{date,roadmapId:'r',checkId:'topic:t',eventType:'topic-complete'});
  assert.equal(R.evaluate(date,s.tasks,s.career).scores.career,12);
  s.career.roadmaps[0].modules[0].topics[0].checklist[0].done=false;
  const e=R.evaluate(date,s.tasks,s.career);assert.equal(e.scores.career,6);assert.equal(e.qualified,false);
});
test('no-answer Money attempt earns effort; outcome plus next step qualifies work',()=>{
  const s=sample();s.career={};s.tasks.money.contacts=[{id:'c',date,method:'Call',outcome:'no-answer',note:'No answer',nextFollowUp:'2026-10-01'}];
  const e=R.evaluate(date,s.tasks,s.career);assert.equal(e.scores.responsibility,8);assert.equal(e.qualified,true);
  s.tasks.money.contacts.push({...s.tasks.money.contacts[0],id:'again'});
  assert.equal(R.evaluate(date,s.tasks,s.career).scores.responsibility,8);
});
test('payments award once per day and reverse when corrected',()=>{
  const s=sample();s.tasks.money.ledgerEvents=[{id:'p',date,type:'card-payment',funder:'own',amountCents:100},{id:'q',date,type:'card-payment',funder:'own',amountCents:200}];
  assert.equal(R.evaluate(date,s.tasks,s.career).scores.responsibility,4);
  s.tasks.money.ledgerEvents.forEach(e=>e.voidedAt='corrected');assert.equal(R.evaluate(date,s.tasks,s.career).scores.responsibility,0);
});
test('a serious mock needs no timer and replaces smaller same-day awards',()=>{
  const s=sample();s.tasks.launch.mockSessions.push({date,level:'large',completed:true});
  assert.equal(R.evaluate(date,s.tasks,s.career).scores.articulation,8);
});
test('drift deduction is bounded; a documented return restores qualification without erasing drift',()=>{
  const s=sample(),day=s.tasks.life.innerCommand.containmentDays[0];day.status='breach';day.boundaries=['social','astrology','information','validation'];
  const before=R.evaluate(date,s.tasks,s.career);assert.equal(before.deduction,6);assert.equal(before.qualified,false);
  day.recoveryNote='Completed the planned exercise';const after=R.evaluate(date,s.tasks,s.career);assert.equal(after.qualified,true);assert.equal(after.deduction,6);
});
test('backdated and Money-only records are discovered; weekly maintenance cannot repeat',()=>{
  const s=sample();s.tasks.money.contacts=[{date:'2026-10-01'}];assert.ok(R.dates(s.tasks,s.career,'2026-10-02').includes('2026-10-01'));
  s.tasks.rhythm.events.push({date,habitId:'groceries',value:1},{date:'2026-09-30',habitId:'groceries',value:1});
  assert.equal(R.bonuses([],s.tasks,'2026-10-02').filter(a=>a.id.includes('groceries')).length,1);
});
test('catalogue prices and gates match the agreement',()=>{
  assert.equal(R.catalog.find(r=>r.id==='initiated-call').cost,100);assert.equal(R.catalog.find(r=>r.id==='movie').cost,90);
  assert.equal(R.catalog.find(r=>r.id==='movie').qualifiedDaysInWindow,5);
});
test('all historical reward dates share the same rules and completed journal facts remain eligible',()=>{
  const old='2026-09-17';
  const tasks={life:{dailyAssessments:[{date:old,ruleVersion:2,total:9}],records:[
    {date:old,id:'career',domain:'Career',kind:'activity',completed:true,title:'Completed a lesson exercise'},
    {date:old,id:'breakfast',domain:'Food',kind:'activity',completed:true,title:'Ate breakfast'},
    {date:old,id:'lunch',domain:'Food',kind:'activity',completed:true,title:'Ate lunch'},
    {date:old,id:'gita',domain:'Spiritual practice',kind:'activity',completed:true,title:'Read Bhagavad Gita'},
  ]}};
  assert.ok(R.dates(tasks,{},'2026-09-18').includes(old));
  const review=R.evaluate(old,tasks,{});
  assert.equal(review.ruleVersion,4);
  assert.equal(review.scores.career,6);
  assert.equal(review.scores.foundation,6);
  assert.equal(review.qualified,false);
  assert.equal(review.credits,2);
});
