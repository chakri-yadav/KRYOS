const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {compare}=require('../journal-conflict-review.js');
test('comparison distinguishes unique and corrected entries without mutating either copy',()=>{
 const local={life:{entries:[{id:'shared',date:'2026-10-14',text:'Corrected',corrections:[{text:'Original'}]},{id:'local',date:'2026-10-15',text:'Local'}],drafts:{'2026-10-15':'Draft'},records:[{id:'fact'}]}};
 const remote={life:{entries:[{id:'shared',date:'2026-10-14',text:'Original'},{id:'remote',date:'2026-10-16',text:'Remote'}]}},before=JSON.stringify([local,remote]),s=compare(local,remote);
 assert.deepEqual(s.changedEntries.map(e=>e.kind),['different','browser-only','cloud-only']);assert.equal(s.localDrafts,1);assert.equal(s.localEntries,2);assert.equal(s.changedEntries[0].localCorrections,1);assert.equal(s.recordsDiffer,true);assert.equal(JSON.stringify([local,remote]),before);
});
test('missing and matching data produce safe summaries',()=>{
 assert.equal(compare(null,null).changedEntries.length,0);assert.equal(compare({entries:{}},{entries:{}}).recordsDiffer,false);
 const copy={life:{entries:[{id:'same',text:'Same'}],draft:'Legacy draft'}};assert.equal(compare(copy,copy).changedEntries.length,0);assert.equal(compare(copy,copy).localDrafts,1);
});
test('inspection code uses read-only queries, excludes unrelated blocks and never pushes or pulls',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../journal-conflict-review.js'),'utf8');
 assert.match(source,/\['tasks','journal'\]/);assert.doesNotMatch(source,/\.upsert\(|\.rpc\(|pushToSupabase\(|pullFromSupabase\(|applyRemoteBlock\(/);
 assert.match(source,/snapshotOwner!==syncState.userId/);
});
