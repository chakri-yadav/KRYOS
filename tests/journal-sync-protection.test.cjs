const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8'),context={};
vm.runInNewContext(source.slice(source.indexOf('function hasProtectedJournalWork('),source.indexOf('function getSyncEvidenceScore(')),context);
const protect=context.hasProtectedJournalWork;
test('journal entries, linked facts and per-date drafts are protected even with no actions',()=>{
 for(const life of [{entries:[{text:'Synthetic corrected entry',corrections:[{text:'Original'}]}]},{records:[{completed:true}]},{draft:'Unsaved draft'},{drafts:{'2026-10-14':'Historical draft'}}])assert.equal(protect('tasks',{life}),true);
});
test('empty defaults and other blocks do not prevent initial recovery',()=>{
 for(const payload of [null,{}, {life:{}},{life:{entries:[],records:[],draft:' ',drafts:{a:''}}}])assert.equal(protect('tasks',payload),false);
 assert.equal(protect('career',{life:{entries:[{}]}}),false);
});
test('automatic recovery guard and unknown-baseline conflict use protected journal evidence',()=>{
 assert.match(source,/recoveryFromStaleLocal = !knownRemoteAt && remoteEvidence > localEvidence && !protectedJournalWork/);
 assert.match(source,/: localEvidence > 0 \|\| protectedJournalWork/);
});
test('freshness flow preserves local journal work and reports a conflict rather than replacing it',async()=>{
 for(const life of [{entries:[{id:'local-entry',text:'Local correction'}]},{drafts:{'2026-10-14':'Local draft'}}]){
  let applied=0;
  const c={cloudFreshnessRunning:false,syncState:{remoteBlockVersions:{},remoteBlockRevisions:{}},SYNC_BLOCKS:[{key:'tasks',payloadKey:'tasks'}],KRYOS_SYNC_SCHEMA_VERSION:99,
   isDemoMode:()=>false,refreshSyncAuthState:async()=>({user:{id:'fixture',email:'fixture@example.invalid'}}),ensureSupabaseProfile:async()=> 'fixture',
   getSupabaseClient:()=>({from:()=>({select:()=>({eq:async()=>({data:[{block_key:'tasks',schema_version:1,revision:8,payload_updated_at:'2026-10-17T18:00Z',payload:{life:{actions:[{id:'remote-a'},{id:'remote-b'}]}}}]})})})}),
   createSyncPayloadPreview:()=>({blocks:{tasks:{value:{life},updatedAt:'2026-10-17T17:00Z'}}}),
   isAfter:(a,b)=>!!a&&(!b||Date.parse(a)>Date.parse(b)),applyRemoteBlock:()=>{applied++;},setMobileRefreshState:()=>{},saveSyncState:()=>{},render:()=>{},updateGlobalCloudState:()=>{},retryPendingCloudWrites:()=>{},console,currentPage:'journal'};
  vm.runInNewContext(source.slice(source.indexOf('function hasProtectedJournalWork('),source.indexOf('async function startCloudFreshnessMonitor(')),c);
  const result=await c.refreshCloudData({automatic:true});assert.equal(result.conflicts,1);assert.equal(result.updated,0);assert.equal(applied,0);assert.equal(c.cloudFreshnessRunning,false);
 }
});
