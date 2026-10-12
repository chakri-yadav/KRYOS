const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const handlers=[],writes=[],habits=[{id:'water',title:'Water',target:3,step:.5},{id:'\u0061\u0064\u0069\u0074\u0079\u0061',title:'Counted Practice B',target:3},{id:'meal',title:'<Meal>',cadence:'daily'},{id:'exercise',title:'Exercise',target:2}];
 const values={water:3,a\u0064itya:3,meal:1,exercise:0};
 const context={document:{addEventListener:(type,handler)=>handlers.push({type,handler})},renderActionCard:a=>`<article><h3>${a.title}</h3>${a.nextAction?`<p><span>Next step</span>${a.nextAction}</p>`:''}<div class="action-controls"></div></article><div class="commitment-action-links">shared-id</div>`,renderRhythmView(){},updateActionSyncIndicator(){},rhythmValue:id=>values[id]||0,rhythmTarget:h=>h.target||1,rhythmIcon:()=>'',escapeHtml:s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;'),rhythmHabit:id=>habits.find(h=>h.id===id),rhythmSetValue:(id,value,date)=>writes.push({id,value,date}),actionSyncLabel:()=> 'Cloud confirmation pending',actionVault:()=>[],updateActionStatus(){},renderActionVault(){},toDateKey:()=> '2026-10-11',rhythmSelectedDate:'2026-10-10'};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../actions-rhythm-ui.js'),'utf8'),context);
 context.renderRhythmView=()=>{};
 return {context,handlers,writes,habits};
}
test('Actions preserves shared links and exposes next step and activation',()=>{
 const {context}=setup();const html=context.renderActionCard({id:'a',title:'Fixture',status:'open',nextAction:'One small step'});
 assert.match(html,/SMALLEST NEXT ACTION/);assert.match(html,/data-activity-start="a"/);assert.match(html,/commitment-action-links/);
 assert.doesNotMatch(context.renderActionCard({id:'a',title:'Fixture',status:'done'}),/data-activity-start/);
});
test('count totals do not wrap to zero at target, and decrement clamps at zero',()=>{
 const {context,habits}=setup();assert.equal(context.activityCountValue(habits[0],3,1),3.5);
 assert.equal(context.activityCountValue(habits[1],3,1),4);assert.equal(context.activityCountValue(habits[0],0,-1),0);
});
test('daily routines remain visible including recorded ones and text is escaped',()=>{
 const {context,habits}=setup();const html=context.renderRhythmGroup('Nourish','Daily routine',[habits[2]],'2026-10-10');
 assert.match(html,/aria-pressed="true"/);assert.match(html,/&lt;Meal&gt;/);assert.doesNotMatch(html,/<Meal>/);
 const tile=context.renderRhythmHabit(habits[1],'2026-10-10');assert.match(tile,/data-activity-cycle="\u0061\u0064\u0069\u0074\u0079\u0061"/);assert.doesNotMatch(tile,/data-activity-total|data-activity-count/);
});
test('weekly logging uses the selected historical date',()=>{
 const {handlers,writes}=setup();const button={dataset:{activityWeekly:'exercise',date:'2026-10-10'}};
 const event={target:{closest:s=>s==='[data-activity-weekly]'?button:null}};
 handlers.filter(h=>h.type==='click').forEach(h=>h.handler(event));assert.equal(writes.length,1);
 assert.equal(writes[0].date,'2026-10-10');assert.equal(writes[0].value,1);
});
test('count button changes the existing habit on its own date',()=>{
 const {handlers,writes}=setup();const button={dataset:{activityCount:'water',date:'2026-10-10',delta:'1'}};
 const event={target:{closest:s=>s==='[data-activity-count]'?button:null}};
 handlers.filter(h=>h.type==='click').forEach(h=>h.handler(event));
 assert.equal(writes.length,1);assert.equal(writes[0].id,'water');assert.equal(writes[0].value,3.5);assert.equal(writes[0].date,'2026-10-10');
});
test('water and devotional tap counts wrap at their targets',()=>{
 const {context,habits}=setup();
 assert.equal(context.activityCycleValue(habits[0],0),.5);assert.equal(context.activityCycleValue(habits[0],2.5),3);assert.equal(context.activityCycleValue(habits[0],3),0);
 assert.equal(context.activityCycleValue(habits[1],0),1);assert.equal(context.activityCycleValue(habits[1],1),2);assert.equal(context.activityCycleValue(habits[1],2),3);assert.equal(context.activityCycleValue(habits[1],3),0);
 assert.equal(context.activityCycleValue(habits[0],2.8),3);
});
test('original compact water bar and devotional rows replace oversized cards',()=>{
 const {context,habits}=setup(),water=context.renderRhythmHabit(habits[0],'2026-10-10'),prayer=context.renderRhythmHabit(habits[1],'2026-10-10');
 assert.match(water,/activity-cycle-row rhythm-water/);assert.match(water,/rhythm-water-track/);assert.match(water,/3\.0 L/);assert.equal((water.match(/<i class="is-filled"/g)||[]).length,6);
 assert.match(prayer,/activity-cycle-badge">3\/3/);assert.match(prayer,/Complete · tap to reset/);
 for(const html of [water,prayer]){assert.doesNotMatch(html,/activity-cycle-total|activity-count-controls|data-rhythm-step/);assert.equal((html.match(/<button/g)||[]).length,1);}
 const css=fs.readFileSync(require('node:path').join(__dirname,'../actions-rhythm-ui.css'),'utf8');assert.doesNotMatch(css,/min-height:174px/);assert.match(css,/activity-cycle-row:focus-visible/);
});
test('tap reset preserves historical date and stale undo cannot overwrite a changed total',()=>{
 const {handlers,writes}=setup(),button={dataset:{activityCycle:'water',date:'2026-10-10'}};
 handlers.filter(h=>h.type==='click').forEach(h=>h.handler({target:{closest:s=>s==='[data-activity-cycle]'?button:null}}));
 assert.deepEqual(writes,[{id:'water',value:0,date:'2026-10-10'}]);
 handlers.filter(h=>h.type==='click').forEach(h=>h.handler({target:{closest:s=>s==='[data-activity-undo]'?{}:null}}));
 assert.equal(writes.length,1);
});
test('undo restores the exact pre-tap value once and does not reward repeated toggling',()=>{
 const s=setup(),totals={water:3};s.context.rhythmValue=id=>totals[id]||0;s.context.rhythmSetValue=(id,value,date)=>{totals[id]=value;s.writes.push({id,value,date});};
 const fire=selector=>s.handlers.filter(h=>h.type==='click').forEach(h=>h.handler({target:{closest:q=>q===selector?{dataset:{activityCycle:'water',date:'2026-10-10'}}:null}}));
 fire('[data-activity-cycle]');assert.equal(totals.water,0);fire('[data-activity-undo]');assert.equal(totals.water,3);fire('[data-activity-undo]');assert.equal(s.writes.length,2);
});
