const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('action-first view retains the original completion renderer and uses DOM order',()=>{const source=fs.readFileSync(path.join(__dirname,'../career-flow-ui.js'),'utf8');assert.match(source,/KryosUI\.renders\.register\('career','career\.context'/);assert.match(source,/studio\.insertBefore\(next,paths\)/);assert.doesNotMatch(source,/\.done\s*=(?!=)/);});
const context={document:{addEventListener(){}},renderCareerView(){},escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),careerCoreProgress:r=>{let checks=(r.modules||[]).flatMap(m=>(m.topics||[]).filter(t=>!t.optional&&t.lane!=='extra').flatMap(t=>t.checklist||[]));return {total:checks.length,done:checks.filter(c=>c.done).length};}};
vm.createContext(context);require('./ui-test-runtime.cjs').runInContext(fs.readFileSync(path.join(__dirname,'../career-flow-ui.js'),'utf8'),context);
test('coverage excludes optional material and reports complete modules',()=>{const r={modules:[{id:'m',topics:[{checklist:[{done:true}]},{optional:true,checklist:[{done:false}]}]}]};const before=JSON.stringify(r),m=context.careerFlowMetrics(r);assert.equal(m.overall.total,1);assert.equal(m.finished,1);assert.equal(JSON.stringify(r),before);});
test('empty coverage does not claim mastery or fake completion',()=>{const html=context.careerFlowProgressMarkup({title:'Empty',modules:[]});assert.match(html,/0<small> \/ 0 steps/);assert.match(html,/max="1" value="0"/);assert.match(html,/not a claim of mastery/);});
test('navigation escapes supplied titles and retains module IDs',()=>{const html=context.careerFlowModulePicker({modules:[{id:'one',title:'<Title>',topics:[]}]});assert.match(html,/value="one"/);assert.match(html,/&lt;Title>/);assert.doesNotMatch(html,/data-career-check/);});

test('resume selects a real incomplete core step within remembered module without mutating curriculum',()=>{
 const r={id:'r',modules:[{id:'m1',topics:[{id:'t1',checklist:[{id:'first',done:false}]}]},{id:'m2',topics:[{id:'extra',optional:true,checklist:[{id:'optional',done:false}]},{id:'learn',checklist:[{id:'learned',done:true}]},{id:'practice',checklist:[{id:'next',done:false}]}]}]},before=JSON.stringify(r);
 const next=context.careerFlowNext(r,{moduleId:'m2',topicId:'learn'});assert.equal(next.item.id,'next');assert.equal(next.topic.id,'practice');
 assert.equal(context.careerFlowNext(r,{moduleId:'deleted',topicId:'learn'}),null);assert.equal(context.careerFlowResume(r,{moduleId:'m2',topicId:'deleted'}).topic,null);
 assert.equal(context.careerFlowNext({modules:[r.modules[0]]},{moduleId:'m2'}),null);assert.equal(JSON.stringify(r),before);
});
test('context is browser-only and isolated by workspace, profile, roadmap; denied storage retains session context',()=>{
 context.accountMode='personal';context.syncState={userId:'fixture-a'};const key=context.careerFlowContextKey('one');
 context.careerFlowRemember('one',{moduleId:'m2',panels:{m2:true}});assert.equal(context.careerFlowRead('one').moduleId,'m2');assert.equal(context.careerFlowRead('two').moduleId,undefined);
 context.accountMode='demo';assert.notEqual(context.careerFlowContextKey('one'),key);assert.equal(context.careerFlowRead('one').moduleId,undefined);
 context.accountMode='personal';context.syncState.userId='fixture-b';assert.notEqual(context.careerFlowContextKey('one'),key);assert.equal(context.careerFlowRead('one').moduleId,undefined);
 context.syncState.userId='fixture-a';assert.equal(context.careerFlowRead('one').moduleId,'m2');context.careerLocalSave=()=>{};assert.notEqual(context.careerFlowContextKey('one'),key);
});
