const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../life.js'),'utf8');
const fn=source.slice(source.indexOf('function lifeTimelineEntries('),source.indexOf('\nlet assistantImportOpened'));
const context={};vm.runInNewContext(fn,context);
const entries=[{id:'a',date:'2026-10-14',text:'Alpha',createdAt:'2026-10-15T01:00Z'},{id:'b',date:'2026-10-15',text:'Beta',createdAt:'2026-10-15T02:00Z'},{id:'c',date:'2026-10-14',text:'Later ALPHA',createdAt:'2026-10-15T03:00Z'}];
test('timeline defaults to selected date and sorts without mutating records',()=>{
 const before=JSON.stringify(entries),result=context.lifeTimelineEntries(entries,'2026-10-14');
 assert.equal(result.map(e=>e.id).join(','),'c,a');assert.equal(JSON.stringify(entries),before);
});
test('all-days search is explicit, case-insensitive and whitespace tolerant',()=>{
 assert.equal(context.lifeTimelineEntries(entries,'2026-10-14','all',' BETA ').map(e=>e.id).join(','),'b');
 assert.equal(context.lifeTimelineEntries(entries,'2026-10-14','day','beta').length,0);
 assert.equal(context.lifeTimelineEntries(entries,'2026-10-16').length,0);
});
