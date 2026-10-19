/* Append-only local submission facts. No storage or network access. */
(function(root){
 const counts=typeof module==='object'&&module.exports?require('./marketing-submissions.js'):root.KryosSubmissions;
 const roles=s=>(s.batches||[]).flatMap(b=>b.roles||[]);
 const key=r=>String(r.canonical_url||r.source_url||r.id||'').trim().toLowerCase();
 function effective(state){
  const facts=new Map();
  for(const e of state.submission_events||[]){
   if(e.type==='submitted')facts.set(e.id,{...e,submissionId:e.id,voided:false});
   else if(facts.has(e.submissionId)){
    const old=facts.get(e.submissionId);
    if(e.type==='corrected')facts.set(e.submissionId,{...old,appliedDate:e.appliedDate,submittedDocumentIds:e.submittedDocumentIds||old.submittedDocumentIds,lastChangeId:e.id});
    if(e.type==='linked')facts.set(e.submissionId,{...old,sourceIds:[...new Set([...(old.sourceIds||[]),...(e.sourceIds||[])])]});
    if(e.type==='voided')facts.set(e.submissionId,{...old,voided:true,lastChangeId:e.id});
   }
  }
  return [...facts.values()];
 }
 function preview(state){
  const legacy=counts.projectLegacyOnly(state),groups=new Map();
  for(const r of legacy.records){const list=groups.get(r.identity)||[];list.push(r);groups.set(r.identity,list);}
  const ambiguous=[...groups].filter(([,rows])=>rows.length>1).map(([identity,rows])=>({identity,dates:rows.map(r=>r.date),sourceIds:[...new Set(rows.flatMap(r=>r.sourceIds))],status:'unresolved'}));
  return {alreadyEnabled:state.submission_history?.version===1,legacy,ambiguous,candidates:legacy.records.filter(r=>!ambiguous.some(g=>g.identity===r.identity))};
 }
 function migrate(state,now){
  if(state.submission_history?.version===1)return false;
  const p=preview(state);
  state.submission_history={version:1,migratedAt:now,legacy_groups:p.ambiguous};
  state.submission_events=p.candidates.map(r=>({id:'legacy:'+r.date+':'+r.identity,type:'submitted',jobId:r.role.id,sourceIds:r.sourceIds,identity:r.identity,appliedDate:r.date,recordedAt:now,sourceOperationId:'legacy-migration',submittedDocumentIds:[],documentAttribution:'unconfirmed'}));
  return true;
 }
 function validateDate(date,today){if(!counts.validDate(date)||date>today)throw Error('Choose today or an earlier valid application date.');}
 function apply(state,jobId,operation,{operationId,now,today}){
  if(state.submission_history?.version!==1)throw Error('Enable submission history first.');
  if(!operationId||typeof operationId!=='string')throw Error('A stable operation ID is required.');
  if((state.submission_events||[]).some(e=>e.sourceOperationId===operationId&&e.id.startsWith('operation:')))return false;
  const role=roles(state).find(r=>String(r.id)===String(jobId));if(!role)throw Error('Application not found.');
  const reason=String(operation.reason||'').trim();if(!reason)throw Error('Explain this submission record or correction.');
  const eventId='operation:'+operationId;
  const base={id:eventId,jobId:role.id,recordedAt:now,sourceOperationId:operationId,reason};
  const docs=operation.submittedDocumentIds;
  if(docs!==undefined&&(!Array.isArray(docs)||docs.some(id=>!((role.application?.attachments||[]).some(d=>String(d.id)===String(id))||String(role.application?.resume_attachment?.id||'')===String(id)))))throw Error('A submitted document reference must belong to this application.');
  const add=(id,date,extra={})=>({ ...base,id,type:'submitted',identity:key(role),sourceIds:[role.id],appliedDate:date,submittedDocumentIds:docs||[],documentAttribution:docs?.length?'explicit':'unconfirmed',...extra });
  const existing=effective(state).filter(e=>String(e.jobId)===String(jobId)||(e.sourceIds||[]).includes(jobId));
  if(operation.type==='resolve'){
   const group=state.submission_history.legacy_groups.find(g=>g.identity===operation.legacyIdentity&&g.status==='unresolved'&&g.sourceIds.includes(jobId));
   if(!group)throw Error('This legacy group is no longer awaiting review.');
   const dates=[...new Set(operation.dates||[])].sort();if(!dates.length)throw Error('Choose at least one confirmed submission date.');
   dates.forEach(d=>{validateDate(d,today);if(!group.dates.includes(d))throw Error('Choose a recorded legacy date; use correction afterwards for another date.');});
   state.submission_events.push(...dates.map((d,i)=>add(eventId+':'+i,d,{legacyResolution:true,sourceIds:group.sourceIds})));
   group.status='resolved';group.resolvedBy=operationId;role.application={...role.application,applied_date:dates.at(-1)};
  }else if(operation.type==='record'||operation.type==='reapply'){
   validateDate(operation.appliedDate,today);
   if(operation.type==='record'&&existing.some(e=>!e.voided))throw Error('A submission already exists. Correct it or explicitly record a reapplication.');
   if(operation.type==='reapply'&&!existing.some(e=>!e.voided))throw Error('A reapplication requires an existing valid submission.');
   if(state.submission_history.legacy_groups.some(g=>g.status==='unresolved'&&g.sourceIds.includes(jobId)))throw Error('Review the ambiguous legacy dates first.');
   state.submission_events.push(add(eventId,operation.appliedDate,{reapplication:operation.type==='reapply'}));
   role.application={...role.application,applied_date:operation.appliedDate,status:'Applied'};
  }else if(operation.type==='correct'||operation.type==='void'){
   const fact=existing.find(e=>e.submissionId===operation.submissionId&&!e.voided);if(!fact)throw Error('The original submission is missing or already voided.');
   if(operation.type==='correct')validateDate(operation.appliedDate,today);
   state.submission_events.push({...base,type:operation.type==='correct'?'corrected':'voided',submissionId:fact.submissionId,...(operation.type==='correct'?{appliedDate:operation.appliedDate}:{}),...(docs?{submittedDocumentIds:docs}:{})});
   const active=effective(state).filter(e=>!e.voided&&(String(e.jobId)===String(jobId)||(e.sourceIds||[]).includes(jobId)));
   role.application={...role.application,applied_date:active.at(-1)?.appliedDate||''};
  }else throw Error('Unsupported submission operation.');
  return true;
 }
 function reconcile(state,previous,{now,today,authorized=false}){
  if(previous.submission_history?.version!==1)return;
  if(!authorized){
   state.submission_history=structuredClone(previous.submission_history);
   state.submission_events=structuredClone(previous.submission_events||[]);
  }
  const facts=effective(state),knownIds=new Set(facts.flatMap(e=>[e.jobId,...(e.sourceIds||[])]).map(String));
  const pendingIds=new Set((state.submission_history.legacy_groups||[]).filter(g=>g.status==='unresolved').flatMap(g=>g.sourceIds).map(String));
  if(!authorized){
   for(const r of roles(state)){
    const old=roles(previous).find(p=>String(p.id)===String(r.id));
    if(knownIds.has(String(r.id))&&old&&String(old.application?.applied_date||'')!==String(r.application?.applied_date||''))throw Error('Use a submission correction with a reason to change this applied date.');
   }
  }
  for(const record of counts.projectLegacyOnly(state).records){
   if(record.sourceIds.some(id=>knownIds.has(String(id))||pendingIds.has(String(id))))continue;
   const duplicate=facts.find(e=>e.identity===record.identity&&!e.voided);
   if(duplicate){
    // Link imported duplicates without fabricating another submission.
    state.submission_events.push({id:'link:'+record.sourceIds.join('|'),type:'linked',submissionId:duplicate.submissionId,sourceIds:record.sourceIds,recordedAt:now});
    continue;
   }
   validateDate(record.date,today);
   const event={id:'captured:'+record.identity,type:'submitted',jobId:record.role.id,sourceIds:record.sourceIds,identity:record.identity,appliedDate:record.date,recordedAt:now,sourceOperationId:'capture:'+record.identity,submittedDocumentIds:[],documentAttribution:'unconfirmed'};
   if(!state.submission_events.some(e=>e.id===event.id)){state.submission_events.push(event);facts.push({...event,submissionId:event.id,voided:false});}
  }
 }
 function project(state){
  const legacy=counts.projectLegacyOnly(state),pending=new Set((state.submission_history.legacy_groups||[]).filter(g=>g.status==='unresolved').map(g=>g.identity));
  const roleMap=new Map(roles(state).map(r=>[String(r.id),r]));
  const realIds=new Set((state.batches||[]).flatMap(b=>(b.roles||[]).filter(r=>!counts.isSynthetic(b,r)).map(r=>String(r.id))));
  const records=legacy.records.filter(r=>pending.has(r.identity));
  for(const fact of effective(state)){
   if(fact.voided||!counts.validDate(fact.appliedDate))continue;
   const ids=[...new Set([fact.jobId,...(fact.sourceIds||[])].map(String))];
   const present=ids.filter(id=>roleMap.has(id));
   if(present.length&&!present.some(id=>realIds.has(id)))continue;
   const role=ids.map(id=>roleMap.get(id)).find(r=>r&&realIds.has(String(r.id)))||{id:fact.jobId,company:'Record removed',title:'Submission retained',application:{status:'Archived'}};
   records.push({date:fact.appliedDate,identity:fact.identity,submissionId:fact.submissionId,role,sourceIds:ids,submittedDocumentIds:fact.submittedDocumentIds||[]});
  }
  records.sort((a,b)=>a.date.localeCompare(b.date)||String(a.submissionId||a.identity).localeCompare(String(b.submissionId||b.identity)));
  const byDate=new Map();for(const r of records)byDate.set(r.date,(byDate.get(r.date)||0)+1);
  return {...legacy,records,byDate};
 }
 const api={effective,preview,migrate,apply,reconcile,project};root.KryosSubmissionHistory=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
