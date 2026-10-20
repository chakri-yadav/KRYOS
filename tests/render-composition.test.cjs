const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {composeRender}=require('../ui-runtime.js');
test('composition captures before model read, renders once and restores last',()=>{
 const order=[],view={draft:'unchanged'},model={value:3};
 composeRender({capture(){order.push('capture');return view;},read(){order.push('read');return model;},base(m){assert.equal(m,model);order.push('base');},sections(m,v){assert.equal(m,model);assert.equal(v,view);order.push('sections');},restore(v){assert.equal(v,view);order.push('restore');}});
 assert.deepEqual(order,['capture','read','base','sections','restore']);
});
test('failed composition restores view and propagates the failure without retrying mutations',()=>{
 let restored=0,bases=0;assert.throws(()=>composeRender({capture:()=>42,base(){bases++;throw Error('fixture');},restore(v){assert.equal(v,42);restored++;}}),/fixture/);assert.equal(restored,1);assert.equal(bases,1);
});
test('Settings has an explicit base entry instead of replacing its global renderer',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),ui=fs.readFileSync(path.join(__dirname,'../settings-flow-ui.js'),'utf8');
 assert.match(app,/settingsFlowRender\(renderSettingsBase\)/);assert.match(app,/function renderSettingsBase\(\)/);
 assert.doesNotMatch(ui,/renderSettingsView\s*=|settingsFlowOriginalRenderer|addEventListener|setInterval/);
 assert.match(ui,/scope!==/);assert.match(ui,/preventScroll:true/);
});
