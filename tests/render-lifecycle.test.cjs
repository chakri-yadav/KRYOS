const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createRenderRegistry}=require('../ui-runtime.js');
test('render stages use explicit order, transform values and restore in reverse',()=>{
 const r=createRenderRegistry(),seen=[];
 for(const [id,order]of [['later',20],['earlier',10]])r.register('page',id,{order,capture(){seen.push('capture '+id);return id;},before(v){seen.push('before '+v);},after(v,html){seen.push('after '+v);return html+v;},restore(v){seen.push('restore '+v);}});
 assert.equal(r.run('page',()=>{seen.push('base');return 'base';}),'baseearlierlater');
 assert.deepEqual(seen,['capture earlier','before earlier','capture later','before later','base','after earlier','after later','restore later','restore earlier']);
});
test('bases and sections have one owner; section disposal does not remove others',()=>{
 const r=createRenderRegistry(),dispose=r.register('page','one',{after:(_,s)=>s+'1'});r.register('page','two',{after:(_,s)=>s+'2'});r.setBase('page','base',()=> 'B');
 assert.throws(()=>r.register('page','one',{}),/already registered/);assert.throws(()=>r.setBase('page','other',()=>''),/already registered/);
 assert.equal(r.run('page',()=> 'unused'),'B12');dispose();assert.equal(r.run('page',()=> 'unused'),'B2');
});
test('render failure restores context and releases reentry guard for retry',()=>{
 const r=createRenderRegistry();let restores=0,base=0;r.register('page','context',{restore(){restores++;}});
 assert.throws(()=>r.run('page',()=>{base++;throw Error('fixture');}),/fixture/);assert.equal(restores,1);
 assert.equal(r.run('page',()=>{base++;assert.equal(r.run('page',()=> 'recursive'),undefined);return 'retry';}),'retry');assert.equal(restores,2);assert.equal(base,2);
});
test('scheduled focus work is cancelled by a newer render, date, account or page',()=>{
 const frames=[],c=vm.createContext({requestAnimationFrame:f=>frames.push(f),accountMode:'personal',syncState:{userId:'one'},currentPage:'career',kryosSelectedDate:()=>c.date,date:'2026-10-19'});
 vm.runInContext(fs.readFileSync('ui-runtime.js','utf8'),c);const r=c.KryosUI.renders;let calls=0;
 r.run('career',()=>{});r.schedule('career',()=>calls++);r.run('career',()=>{});frames.shift()();assert.equal(calls,0);
 for(const change of [()=>c.date='2026-10-18',()=>c.syncState.userId='two',()=>c.currentPage='actions']){r.schedule('career',()=>calls++);change();frames.shift()();assert.equal(calls,0);}
 c.currentPage='career';r.schedule('career',()=>calls++);frames.shift()();assert.equal(calls,1);
});
test('one failed restore cannot skip other owners or hide the original render failure',()=>{
 const r=createRenderRegistry(),restored=[];
 r.register('page','one',{order:1,restore(){restored.push('one');}});
 r.register('page','two',{order:2,restore(){restored.push('two');throw Error('restore failed');}});
 assert.throws(()=>r.run('page',()=>{throw Error('base failed');}),/base failed/);
 assert.deepEqual(restored,['two','one']);
});
test('page adapters register explicit sections rather than capturing global renderers',()=>{
 for(const f of ['actions-rhythm-ui.js','career-flow-ui.js','career-workflows.js','launch-flow-ui.js','money-flow-ui.js','progress-flow-ui.js','day-summary.js','review-queue.js','day-review.js','marketing-integration-ui.js','journal-conflict-review.js']){
  const s=fs.readFileSync(f,'utf8');assert.doesNotMatch(s,/render\w+\s*=\s*function/,f);assert.match(s,/KryosUI\.renders\.(register|setBase)/,f);
 }
 const s=fs.readFileSync('marketing-integration-ui.js','utf8');assert.match(s,/typeof marketingLocalEventsVersion==='undefined'/);assert.match(s,/kryos:marketing-state/);
});
