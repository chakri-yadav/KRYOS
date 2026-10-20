const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
require('../supabase/functions/kryos-ingest/commitment-core.js');
const C=globalThis.KryosCommitment;
function setup(date='2026-10-18'){
 const life={actions:[]};C.ensure(life);const handlers=[],dates=[];
 const context={KryosDailyPresentation:require('../daily-presentation.js'),KryosCommitment:{...C,today:()=> '2026-10-19'},commitmentSelected:()=>date,commitmentLife:()=>life,lifeNotice:'',escapeHtml:s=>String(s).replaceAll('<','&lt;'),actionSyncLabel:()=> 'Saved in fixture',renderLifeJournal(){},document:{addEventListener:(type,handler)=>handlers.push({type,handler}),querySelector:()=>null},KryosDayContext:{set:d=>dates.push(d)}};
 vm.createContext(context);require('./ui-test-runtime.cjs').runInContext(read('commitment-premium.js'),context);return {context,life,handlers,dates};
}
test('daily composition places commitments and outline before result and journey',()=>{
 const {context}=setup(),html=context.renderContainmentCovenant();
 const positions=['command-must-do','command-outline-panel','<section class="command-battle ','command-journey-map'].map(x=>html.indexOf(x));
 assert.ok(positions.every(x=>x>=0));assert.deepEqual([...positions].sort((a,b)=>a-b),positions);
 assert.match(html,/That day's must-do/);assert.match(html,/Not recorded/);
 assert.equal((html.match(/data-commitment-day=/g)||[]).length,48);
});
test('promise remains fully visible and the shared date picker is the only day input',()=>{
 const {context}=setup();const html=context.renderInnerCommandPurpose();
 assert.match(html,/By keeping promises, I rebuild trust in myself/);
 assert.match(html,/External outcomes do not decide today's battle/);
 assert.match(html,/data-command-date-focus/);assert.doesNotMatch(html,/type="date"/);
});
test('preparation copy follows cycle configuration rather than a stale date literal',()=>{
 const {context}=setup('2026-10-17'),html=context.renderContainmentCovenant();
 assert.match(html,/Sunday, October 18 begins the 48 counted days/);
 assert.doesNotMatch(html,/October 11/);assert.doesNotMatch(html,/07:00|7 a\.m\./);
});
test('planning first day updates shared context without writing a completion',()=>{
 const {handlers,dates}=setup('2026-10-17');
 const button={dataset:{},hasAttribute:name=>name==='data-command-plan-first'};
 const event={target:{closest:selector=>selector==='button'?button:null}};
 handlers.filter(h=>h.type==='click').forEach(h=>h.handler(event));
 assert.deepEqual(dates,['2026-10-18']);
});
test('page styles use semantic outcomes and retain explicit full-row keyboard focus',()=>{
 const css=read('commitment-premium.css'),activity=read('actions-rhythm-ui.css'),review=read('day-review.css');
 assert.doesNotMatch(css,/gradient\(/);assert.doesNotMatch(activity,/gradient\(/);
 for(const role of ['positive','information','attention','negative'])assert.ok(css.includes('var(--kryos-'+role));
 assert.match(activity,/activity-cycle-row:focus-visible/);
 assert.match(review,/day-review-verdict\[data-review-outcome=not-won\]/);
 assert.match(read('day-review.js'),/select aria-label="Completion for/);
 assert.match(read('day-review.js'),/data-command-state/);
});

