const test=require('node:test'),assert=require('node:assert/strict'),counts=require('../marketing-submissions.js'),history=require('../marketing-submission-history.js');
const now='2026-10-19T18:00:00Z',today='2026-10-19';
const role=(id,date,status='Applied',url='')=>({id,source_url:url,company:'Example',title:'Engineer',application:{status,applied_date:date,attachments:[{id:'resume-one'}]}});
const make=()=>({batches:[{id:'b',roles:[role('a','2026-10-18')]}],unknown:{keep:true}});
const dates=s=>[...counts.projectLegacySubmissions(s).byDate];
test('migration preserves counts, original records, files and reruns idempotently',()=>{
 const state=make(),before=JSON.stringify(state.batches),old=dates(state);assert.equal(history.migrate(state,now),true);
 assert.deepEqual(dates(state),old);assert.equal(JSON.stringify(state.batches),before);assert.deepEqual(state.unknown,{keep:true});
 const serialized=JSON.stringify(state);assert.equal(history.migrate(state,now),false);assert.equal(JSON.stringify(state),serialized);
 assert.equal(state.submission_events[0].submittedDocumentIds.length,0);
});
test('stage changes preserve submission history, reasons and voids retain the original',()=>{
 const state=make();history.migrate(state,now);const original=structuredClone(state.submission_events[0]),id=original.id;
 state.batches[0].roles[0].application.status='Saved';assert.deepEqual(dates(state),[['2026-10-18',1]]);
 history.apply(state,'a',{type:'correct',submissionId:id,appliedDate:'2026-10-17',reason:'Correct date'},{operationId:'correct-one',today,now});
 assert.deepEqual(dates(state),[['2026-10-17',1]]);assert.deepEqual(state.submission_events[0],original);
 history.apply(state,'a',{type:'void',submissionId:id,reason:'Mistaken entry'},{operationId:'void-one',today,now});assert.deepEqual(dates(state),[]);assert.equal(state.submission_events.length,3);
});
test('explicit reapplication counts independently, including on the same day, and retries do not duplicate',()=>{
 const state=make();history.migrate(state,now);
 const operation={type:'reapply',appliedDate:'2026-10-18',reason:'I actually submitted again',submittedDocumentIds:['resume-one']};
 history.apply(state,'a',operation,{operationId:'reapply-one',today,now});assert.deepEqual(dates(state),[['2026-10-18',2]]);
 assert.equal(history.apply(state,'a',operation,{operationId:'reapply-one',today,now}),false);
 assert.deepEqual(history.effective(state)[1].submittedDocumentIds,['resume-one']);
});
test('ambiguous dates keep legacy counts until explicitly resolved',()=>{
 const state={batches:[{roles:[role('a','2026-10-17','Applied','https://example.invalid/one'),role('b','2026-10-18','Interview','https://example.invalid/one')]}]};
 const before=dates(state);assert.equal(history.preview(state).ambiguous.length,1);history.migrate(state,now);
 assert.equal(state.submission_events.length,0);assert.deepEqual(dates(state),before);
 const group=state.submission_history.legacy_groups[0];
 history.apply(state,'a',{type:'resolve',legacyIdentity:group.identity,dates:['2026-10-18'],reason:'Other date was a duplicate'},{operationId:'resolve-one',today,now});
 assert.deepEqual(dates(state),[['2026-10-18',1]]);assert.equal(state.batches[0].roles.length,2);
});
test('reconcile preserves server events and links duplicate imports without another submission',()=>{
 const previous=make();history.migrate(previous,now);
 const state=structuredClone(previous);state.submission_events=[];state.batches[0].roles.push({...role('new','2026-10-19'),canonical_url:'a'});
 history.reconcile(state,previous,{now,today});assert.deepEqual(dates(state),[['2026-10-18',1]]);
 const next=structuredClone(state);history.reconcile(next,state,{now,today});assert.equal(next.submission_events.length,state.submission_events.length);
 const altered=structuredClone(previous);altered.batches[0].roles[0].application.applied_date='2026-10-17';assert.throws(()=>history.reconcile(altered,previous,{now,today}),/correction/);
});
test('invalid corrections and foreign document references reject before mutation',()=>{
 const state=make();history.migrate(state,now);const before=JSON.stringify(state),id=state.submission_events[0].id;
 for(const operation of [{type:'correct',submissionId:id,appliedDate:'2026-02-30',reason:'Invalid'},{type:'reapply',appliedDate:'2026-10-20',reason:'Future'},{type:'correct',submissionId:id,appliedDate:today,reason:'Changed',submittedDocumentIds:['foreign']},{type:'void',submissionId:id,reason:''}]){
 assert.throws(()=>history.apply(state,'a',operation,{operationId:'bad',today,now}));assert.equal(JSON.stringify(state),before);
 }
});
test('new explicit applied roles gain one capture and remain after a later stage change',()=>{
 const previous={batches:[]};history.migrate(previous,now);const state=structuredClone(previous);state.batches=[{roles:[role('new',today)]}];
 history.reconcile(state,previous,{now,today});assert.deepEqual(dates(state),[[today,1]]);
 const later=structuredClone(state);later.batches[0].roles[0].application.status='Archived';history.reconcile(later,state,{now,today});assert.deepEqual(dates(later),[[today,1]]);
});
