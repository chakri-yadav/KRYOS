const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {session,operation}=require('../daily-corrections.js');
require('../supabase/functions/kryos-ingest/commitment-core.js');const C=globalThis.KryosCommitment;
const date='2026-10-24',now='2026-10-25T18:00:00Z';
function fixture(){const life={actions:[]};C.ensure(life);C.apply(life,{type:'task.assign',title:'Example target',kind:'quantity',target:3},date,now,'assign');C.apply(life,{type:'task.progress',taskId:C.day(life,date).tasks[0].id,value:3},date,now,'progress');return life;}
test('captured correction preserves the original date and recomputes linked completion',()=>{
 const life=fixture(),day=C.day(life,date),s=session({date,revision:day.revision,type:'task.correct',id:day.tasks[0].id,kind:'quantity',target:3});
 assert.ok(Object.isFrozen(s));const op=operation(s,{target:'5',reason:'Actual target was five'});
 C.apply(life,op,s.date,now,'correction');
 assert.equal(C.day(life,date).tasks[0].target,5);assert.equal(life.actions[0].status,'open');assert.equal(C.day(life,'2026-10-23').tasks.length,0);
});
test('stale correction cannot overwrite newer work and validation leaves facts unchanged',()=>{
 const life=fixture(),day=C.day(life,date),s=session({date,revision:day.revision,type:'task.correct',id:day.tasks[0].id,kind:'quantity'});
 for(const fields of [{target:0,reason:'Invalid'},{target:1.5,reason:'Invalid'},{target:5,reason:' '}])assert.throws(()=>operation(s,fields));
 C.apply(life,{type:'task.progress',taskId:s.id,value:4},date,now,'new-work');const before=JSON.stringify(life);
 assert.throws(()=>C.apply(life,operation(s,{target:5,reason:'Stale correction'}),date,now,'stale'),/changed/);assert.equal(JSON.stringify(life),before);
});
test('incident correction keeps the original and leaves its requirement unanswered',()=>{
 const life=fixture(),item=C.items.find(i=>i.type==='boundary');
 C.apply(life,{type:'breach.record',boundaries:[item.id],note:'Mistaken incident'},date,now,'incident');
 const day=C.day(life,date),s=session({date,revision:day.revision,type:'breach.correct',id:day.breaches[0].id});
 C.apply(life,operation(s,{reason:'This entry was a recording mistake'}),date,now,'correct-incident');
 assert.equal(C.day(life,date).breaches.length,1);assert.ok(C.day(life,date).breaches[0].correctedAt);assert.equal(C.day(life,date).items[item.id],undefined);
});
test('operating clock stays at 07:00 Chicago through DST transitions',()=>{
 assert.equal(C.today('2026-11-01T12:59:59Z'),'2026-10-31');assert.equal(C.today('2026-11-01T13:00:00Z'),'2026-11-01');
 assert.equal(C.today('2027-03-14T11:59:59Z'),'2027-03-13');assert.equal(C.today('2027-03-14T12:00:00Z'),'2027-03-14');
});
test('correction controller loads before its owner and obsolete prompts are removed',()=>{
 const html=fs.readFileSync('index.html','utf8');
 assert.ok(html.indexOf('daily-corrections.js')<html.indexOf('commitment-premium.js'));
 assert.doesNotMatch(fs.readFileSync('commitment.js','utf8'),/prompt\(/);
});
