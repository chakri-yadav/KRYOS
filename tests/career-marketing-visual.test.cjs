const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('Career presentation uses semantic colors and keeps module reading lanes',()=>{
 const css=fs.readFileSync('career-flow-ui.css','utf8');
 for(const token of ['--kryos-text','--kryos-action','--kryos-learning','--kryos-focus'])assert.ok(css.includes('var('+token+')'));
 assert.match(css,/\.check-item \.check-text\{font-size:16px;line-height:1\.8/);
 assert.match(css,/prefers-reduced-motion/);
 const js=fs.readFileSync('career-flow-ui.js','utf8');
 assert.match(js,/careerFlowPreviousRenderer\(\)/);
 assert.doesNotMatch(js,/fetch\(|\.done\s*=(?!=)/);
});
test('Marketing presentation preserves its separate storage surface',()=>{
 const hosted=fs.existsSync('marketing-summary.js');
 const css=fs.readFileSync(hosted?'marketing-summary.css':'marketing-workspace-ui.css','utf8');
 assert.ok(css.includes('var(--kryos-focus)'));
 if(hosted){
  assert.match(css,/#marketing-view \.marketing-cloud-chart\{padding:32px/);
  const js=fs.readFileSync('marketing-summary.js','utf8');
  assert.doesNotMatch(js,/type="file"|raw_description|contact_email|resume_attachment/);
 }else{
  assert.match(css,/marketing-evidence-grid\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/status-applied\{background:var\(--kryos-information-surface\)/);
  assert.match(css,/\[data-state=error\]\{background:var\(--kryos-error-surface\)/);
  assert.match(css,/marketing-evidence-chart\{[^}]*height:auto/);
  assert.match(fs.readFileSync('marketing.js','utf8'),/data-marketing-local-status data-state=/);
 }
});
