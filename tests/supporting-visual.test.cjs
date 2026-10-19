const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const pages=['progress','rewards','money','launch','settings'];
test('Money next action overrides legacy dark-panel text and button colors',()=>{
 const css=fs.readFileSync('money-flow-ui.css','utf8');
 assert.match(css,/\.money-next-action h2\{color:var\(--kryos-text\)/);
 assert.match(css,/\.money-next-action p\{color:var\(--kryos-text-secondary\)/);
 assert.match(css,/\.money-next-buttons \.primary-button\{background:var\(--kryos-action\);color:var\(--kryos-on-action\)/);
});
test('supporting page owners inherit the same surface and focus roles',()=>{
 for(const name of pages){const css=fs.readFileSync(name+'-flow-ui.css','utf8');for(const token of ['--kryos-surface','--kryos-divider','--kryos-radius-surface','--kryos-focus'])assert.ok(css.includes('var('+token+')'),name+' '+token);}
});
test('neutral eligibility and informational effort do not masquerade as outcomes',()=>{
 const rewards=fs.readFileSync('rewards-flow-ui.css','utf8'),progress=fs.readFileSync('progress-flow-ui.css','utf8');
 assert.match(rewards,/\.partial\{background:var\(--kryos-canvas\)/);
 assert.match(rewards,/button:disabled\{background:var\(--kryos-canvas\)/);
 assert.match(progress,/evidence-today-orbit[^}]*kryos-information-surface/);
});
test('Settings route is reachable without changing local storage ownership',()=>{
 const app=fs.readFileSync('app.js','utf8');
 assert.match(app,/const APP_PAGES = \[[^\]]*"settings"/);
 const settings=fs.readFileSync('settings-flow-ui.js','utf8');
 assert.match(settings,/local service/);assert.match(settings,/not a confirmed save/);
 assert.doesNotMatch(settings,/fetch\(|saveTasks\(|moneySave\(/);
});
