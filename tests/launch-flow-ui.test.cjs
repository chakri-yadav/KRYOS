const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const c={renderLaunchView(){},escapeHtml:s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(c);require('./ui-test-runtime.cjs').runInContext(fs.readFileSync(path.join(__dirname,'../launch-flow-ui.js'),'utf8'),c);
test('no market record offers original market logging control',()=>{const html=c.launchFlowFocusMarkup('2026-10-11',0,0);assert.match(html,/data-launch-open="market"/);assert.match(html,/0 market actions/);assert.match(html,/data-marketing-open/);});
test('recorded market effort offers rehearsal without adding records',()=>{const html=c.launchFlowFocusMarkup('2026-10-11',2,1);assert.match(html,/data-launch-open="mock"/);assert.match(html,/2 market actions · 1 rehearsals/);assert.doesNotMatch(html,/complete|reward points/);});
test('date text is escaped and original renderer remains the owner',()=>{assert.match(c.launchFlowFocusMarkup('<date>',0,0),/&lt;date&gt;/);const src=fs.readFileSync(path.join(__dirname,'../launch-flow-ui.js'),'utf8');assert.doesNotMatch(src,/fetch\(|saveTasks\(|\.push\(/);});

test('focus selection is explicit and speaking reuses rehearsal rather than inventing a new record type',()=>{
 assert.equal(c.launchFlowChoice(0,'mock'),'mock');assert.equal(c.launchFlowChoice(4,'market'),'market');assert.equal(c.launchFlowChoice(0,'invalid'),'market');
 const html=c.launchFlowFocusMarkup('2026-10-19',0,0,'speaking');assert.match(html,/data-launch-flow-speaking/);assert.match(html,/data-launch-open="mock"/);assert.match(html,/data-launch-flow-choice="speaking" aria-pressed="true"/);assert.match(html,/existing self-rehearsal record/);
 assert.match(html,/data-launch-flow-evidence/);assert.equal((html.match(/class="primary-button"/g)||[]).length,1);
});
