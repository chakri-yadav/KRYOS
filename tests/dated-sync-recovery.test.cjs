const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('dated cloud write carries expected revision and preserves occurrence and recording dates',async()=>{
 const source=fs.readFileSync('app.js','utf8'),start=source.indexOf('async function writeVersionedBlock('),end=source.indexOf('async function issueAssistantToken(',start);
 const c={syncState:{remoteBlockRevisions:{tasks:12}}};vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 const payload={life:{actions:[{id:'fixture',completedDate:'2026-10-14',recordedAt:'2026-10-17T18:00:00Z'}]}},block={block_key:'tasks',payload,schema_version:1,payload_updated_at:'2026-10-17T18:00:00Z'};let sent;
 const revision=await c.writeVersionedBlock({rpc:async(_,args)=>{sent=args;return {data:13,error:null};}},'fixture-profile',block);
 assert.equal(revision,13);assert.equal(sent.p_expected_revision,12);assert.equal(sent.p_payload.life.actions[0].completedDate,'2026-10-14');assert.equal(sent.p_payload.life.actions[0].recordedAt,'2026-10-17T18:00:00Z');
 await assert.rejects(()=>c.writeVersionedBlock({rpc:async()=>({error:new Error('KRYOS_CONFLICT')})},'fixture-profile',block),/KRYOS_CONFLICT/);
 assert.equal(c.syncState.remoteBlockRevisions.tasks,12);
});
test('failed task sync keeps local evidence and exposes retryable transport failure',async()=>{
 const source=fs.readFileSync('actions.js','utf8'),start=source.indexOf('async function flushTaskCloudSync('),end=source.indexOf('function actionEditor(',start);
 const payload={life:{actions:[{id:'fixture',completedDate:'2026-10-14'}]}};const c={actionSyncDirty:true,actionSyncRunning:false,actionSyncState:'saving',refreshSyncAuthState:async()=>({user:{}}),getSupabaseClient:()=>({}),ensureSupabaseProfile:async()=> 'profile',getSyncBlockPayloads:()=>[{block_key:'tasks',payload}],writeVersionedBlock:async()=>{throw new Error('Network offline');},updateActionSyncIndicator(){},console:{warn(){}},scheduleTaskCloudSync(){throw new Error('Unexpected automatic loop');}};
 vm.createContext(c);vm.runInContext(source.slice(start,end),c);await c.flushTaskCloudSync();assert.equal(c.actionSyncState,'error');assert.equal(c.actionSyncDirty,true);assert.equal(c.actionSyncRunning,false);assert.equal(payload.life.actions[0].completedDate,'2026-10-14');
});
