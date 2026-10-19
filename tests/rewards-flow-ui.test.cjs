const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../rewards-flow-ui.css'),'utf8'),index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
test('Rewards visual asset is loaded after the established stylesheet',()=>{assert.ok(index.indexOf('rewards-flow-ui.css')>index.indexOf('reward-system.css'));});
test('Rewards controls have visible focus and readable evidence',()=>{assert.match(css,/:focus-visible/);assert.match(css,/min-height:44px/);assert.match(css,/reward-evidence details>p\{font-size:14px/);});
test('Catalogue uses focused two-column cards with single-column fallback',()=>{assert.match(css,/reward-grid\{display:grid;grid-template-columns:repeat\(2/);assert.match(css,/@media\(max-width:620px\)/);assert.doesNotMatch(css,/(?:^|[;{])\s*(?:content:|display:\s*none|pointer-events:\s*none)/m);});
