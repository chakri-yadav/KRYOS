const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function load(){const c=vm.createContext({Date,Map,String});vm.runInContext(fs.readFileSync('career-workflows.js','utf8'),c);return c;}
test('workplace parser preserves phases, numbered topics, wrapped practice, language and final gate',()=>{
 const c=load();let source='SOFTWARE ENGINEERING WORKPLACE MASTERY\nPurpose: safe learning\n';
 for(let i=1;i<=26;i++)source+=(i===1?'PHASE A — PEOPLE\n':i===25?'PHASE F — SIMULATIONS\n':'')+'MODULE '+String(i).padStart(2,'0')+' — EXAMPLE\nTOPICS\n01. Understand roles\nPRACTICE\n- Explain the flow\n  without inventing experience.\nLANGUAGE\n"Who owns this?"\nDONE WHEN\nYou can explain the process.\n';
 source+='FINAL SDE-2 WORKPLACE READINESS GATE\nYou should be able to:\n01. Navigate safely.\nNo employer-specific history is assumed from practice.\n';
 const r=c.careerParseRoadmap(source,'SOFTWARE ENGINEERING WORKPLACE MASTERY','work');assert.equal(r.sourceText,source);assert.equal(r.workflowKind,'workplace');assert.equal(r.modules.length,27);
 assert.equal(r.modules[0].phase,'PHASE A — PEOPLE');assert.equal(r.modules[24].phase,'PHASE F — SIMULATIONS');
 assert.equal(r.modules[0].topics[0].checklist[0].text,'01. Understand roles');
 assert.equal(r.modules[0].topics[1].checklist[0].text,'- Explain the flow\n  without inventing experience.');
 assert.equal(r.modules[0].topics[2].workflowLane,'language');assert.equal(r.modules[0].topics[2].checklist.length,0);
 assert.equal(r.modules[26].topics[0].checklist.length,1);assert.equal(c.careerVisualIdentity(r).tone,'blue');
 const ui=uiLoad();ui.careerState={roadmaps:[r]};ui.selectedRoadmapId='work';ui.renderCareerView();
 assert.match(ui.careerView.innerHTML,/Workplace studio/);assert.match(ui.careerView.innerHTML,/studio-language/);
 assert.match(ui.careerView.innerHTML,/Simulation \/ artifact evidence/);assert.match(ui.careerView.innerHTML,/READINESS CHECK/);
});
test('incomplete workplace source fails rather than silently dropping modules',()=>{
 const c=load();assert.throws(()=>c.careerParseRoadmap('SOFTWARE ENGINEERING WORKPLACE MASTERY\nMODULE 01 — EXAMPLE\nTOPICS\n01. Example','Work','work'),/26 modules/);
});
test('studio uses distinct roadmap identities and excludes optional work from core coverage',()=>{
 const c=load();assert.equal(c.careerVisualIdentity({title:'System Design'}).tone,'indigo');
 assert.equal(c.careerVisualIdentity({title:'API DESIGN'}).tone,'teal');assert.equal(c.careerVisualIdentity({title:'INTERVIEW PREP'}).tone,'amber');
 const r={modules:[{topics:[{checklist:[{done:true},{done:false}]},{optional:true,checklist:[{done:true}]},{lane:'extra',checklist:[{done:true}]}]}]};
 assert.equal(c.careerCoreProgress(r).total,2);assert.equal(c.careerCoreProgress(r).percent,50);
});
function uiLoad(){
 const c=vm.createContext({Date,Map,String,document:{addEventListener(){},querySelector(){return null;}},
 getNextCareerItem(){return null;},getModuleStats(){return {done:0,total:1};},renderModuleBlock(){return '<article>legacy</article>';},
 renderCareerView(){},escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
 renderTopicBlock:(r,m,t)=>'<article>'+t.title+'</article>',careerView:{innerHTML:''},selectedRoadmapId:'r',careerSyncState:'local',
 getCareerWeekPulse:()=>[],renderCareerPulseDay:()=>'',careerSyncLabel:()=> 'Saved on laptop',getCareerStats:()=>({weekActions:0,progress:0}),getCareerConfidence:()=>0,
 renderCareerTruthBars:()=>'',renderCareerHeatmap:()=>'',getCareerDeadlineStats:()=>({}),renderCareerDeadlinePanel:()=>'',emptyState:()=>'<p>Empty</p>'});
 vm.runInContext(fs.readFileSync('career-workflows.js','utf8'),c);c.findRoadmap=id=>c.careerState.roadmaps.find(r=>r.id===id);
 c.renderRoadmapDetail=r=>r.modules.map(m=>c.renderModuleBlock(r,m,false)).join('');return c;
}
test('core next action skips optional work and UI preserves IDs, source and editing fallback',()=>{
 const c=uiLoad(),r=c.careerParseRoadmap('MODULE 01 — EXAMPLE\nEXTRA PRACTICE\n- Optional first\nTOPICS\n- Learn <concept>\nBUILD\n- Build it','API DESIGN','r');
 c.careerState={roadmaps:[r]};const before=JSON.stringify(r);c.renderCareerView();
 assert.equal(c.getNextCareerItem(r).item.text,'Learn <concept>');
 assert.match(c.careerView.innerHTML,/Learn &lt;concept>/);assert.match(c.careerView.innerHTML,/data-career-check="r-module-01-section-2-check-1"/);
 assert.match(c.careerView.innerHTML,/02 \/ BUILD/);assert.match(c.careerView.innerHTML,/studio-insights/);
 assert.equal(JSON.stringify(r),before);assert.equal(c.renderModuleBlock(r,r.modules[0],true),'<article>legacy</article>');
 r.modules[0].topics.filter(t=>!t.optional).forEach(t=>t.checklist.forEach(i=>i.done=true));
 assert.equal(c.getNextCareerItem(r),null);c.renderCareerView();assert.match(c.careerView.innerHTML,/Core steps complete/);
});
test('empty Career renders safely without presenting a fake completion',()=>{
 const c=uiLoad();c.careerState={roadmaps:[]};c.selectedRoadmapId=undefined;c.renderCareerView();
 assert.match(c.careerView.innerHTML,/Empty/);assert.doesNotMatch(c.careerView.innerHTML,/Mark complete/);
});
test('parser separates learning, build, optional practice and owner-module guidance without changing source',()=>{const c=load();const source='ROADMAP\nFOCUS: TEST\nMODULE 01 — FOUNDATIONS\nTOPICS\n- HTTP\nBUILD\n- Implement endpoint\nINTERVIEW PRACTICE\n- Explain it\nEXTRA PRACTICE\n- Optional exercise\nNOTE\nDo not duplicate theory.\nMODULE 02 — PROJECT\nBULLET 1 — EXAMPLE\nLEARNED IN:\nAPI Engineering Module 01\nINTERVIEW PRACTICE\n- What did you own?';const r=c.careerParseRoadmap(source,'API DESIGN','api');assert.equal(r.sourceText,source);assert.equal(r.title,'API DESIGN');assert.equal(r.modules.length,2);assert.equal(r.modules[0].topics[3].optional,true);assert.equal(r.modules[1].topics[0].ownerReference,'API Engineering Module 01');assert.equal(r.modules[1].topics[1].title,'BULLET 1 — EXAMPLE · INTERVIEW PRACTICE');});
test('replacement is idempotent, archives old work and transfers only unambiguous exact completion evidence',()=>{const c=load();const old={id:'api',title:'API DESIGN',modules:[{topics:[{checklist:[{id:'old',text:'HTTP',done:true,completedAt:'2026-10-01'}]}]}]};const state={roadmaps:[old,{id:'other',title:'Unrelated',modules:[]}],activityLog:[{checkId:'old'}]};const next=c.careerParseRoadmap('MODULE 01 — FOUNDATION\nTOPICS\n- HTTP\n- REST','API DESIGN','api');assert.equal(c.careerReplaceRoadmaps(state,[next],'v1'),true);assert.equal(state.archivedRoadmaps.length,1);assert.equal(next.modules[0].topics[0].checklist[0].done,true);assert.equal(next.modules[0].topics[0].checklist[1].done,false);assert.equal(state.activityLog[0].checkId,'old');assert.equal(c.careerReplaceRoadmaps(state,[next],'v1'),false);assert.equal(state.roadmaps.length,2);});
