const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../life.js'),'utf8'),context={};
vm.runInNewContext(source.slice(source.indexOf('function lifeCorrectEntry('),source.indexOf('function lifeTimelineEntries(')),context);
const fixture=()=>({entries:[{id:'fixture',text:'Original evidence',date:'2026-10-14',createdAt:'2026-10-15T18:00Z',packageId:'stable-package'}],records:[{id:'record',entryId:'fixture',completed:true}],draft:'Unfinished draft'});
test('correction preserves date, identity, linked records and draft with auditable prior text',()=>{
 const store=fixture(),records=JSON.stringify(store.records);
 assert.equal(context.lifeCorrectEntry(store,'fixture','Corrected evidence','Original evidence','','2026-10-17T18:00Z'),true);
 const e=store.entries[0];assert.equal(e.date,'2026-10-14');assert.equal(e.packageId,'stable-package');assert.equal(e.createdAt,'2026-10-15T18:00Z');
 assert.equal(e.corrections[0].text,'Original evidence');assert.equal(e.revision,1);assert.equal(JSON.stringify(store.records),records);assert.equal(store.draft,'Unfinished draft');
});
test('stale text or timestamp prevents overwrite',()=>{
 const store=fixture();store.entries[0].updatedAt='newer';
 assert.throws(()=>context.lifeCorrectEntry(store,'fixture','Changed','Original evidence','older'),/changed since/);
 assert.throws(()=>context.lifeCorrectEntry(store,'fixture','Changed','Stale','newer'),/changed since/);assert.equal(store.entries[0].text,'Original evidence');
});
test('unchanged text is idempotent; missing or invalid edits are rejected',()=>{
 const store=fixture();assert.equal(context.lifeCorrectEntry(store,'fixture','Original evidence','Original evidence',''),false);
 assert.equal(store.entries[0].corrections,undefined);assert.throws(()=>context.lifeCorrectEntry(store,'missing','X','',''),/no longer/);
 for(const text of ['', ' ', 'x'.repeat(100001)])assert.throws(()=>context.lifeCorrectEntry(store,'fixture',text,'Original evidence',''),/journal text/);
});
