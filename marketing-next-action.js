/* Deterministic work selection and explicit next-action mutations. */
(function(root){
 const ready=new Set(['Saved','To review']),active=new Set(['Applied','Interview','Follow-up']);
 const closed=new Set(['Archived','Not selected','Rejected','Accepted','Offer','Keep for later']);
 const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
 const id=r=>String(r.id||'');
 const compare=(a,b)=>id(a).localeCompare(id(b));
 function chooseMarketingNextAction({roles=[],today,selectedJobId=''}){
  if(!valid(today))throw Error('A valid operating day is required.');
  const real=roles.filter(r=>r&&id(r)&&!r.demo&&!r.is_test&&!id(r).startsWith('demo-')&&!/FICTIONAL SAMPLE|SYNTHETIC TEST/i.test(r.raw_description||'')).sort(compare);
  const scheduled=real.filter(r=>active.has(r.application?.status)&&r.application?.next_action?.status==='Open'&&['follow-up','interview-preparation'].includes(r.application.next_action.kind)&&valid(r.application.next_action.due_date));
  const due=scheduled.filter(r=>r.application.next_action.due_date<=today).sort((a,b)=>a.application.next_action.due_date.localeCompare(b.application.next_action.due_date)||compare(a,b))[0];
  const result=(r,kind,label,reason)=>({kind,jobId:id(r),label,reason});
  if(due){const action=due.application.next_action;return result(due,action.kind,action.kind==='interview-preparation'?'Prepare for interview':'Do planned follow-up','You scheduled this for '+action.due_date+'.');}
  const pending=real.filter(r=>ready.has(r.application?.status));
  const selected=pending.find(r=>id(r)===String(selectedJobId));
  if(selected)return result(selected,'application','Review saved role','Your selected role is ready to review.');
  const todayRole=pending.find(r=>(r.added_date||r.date_added||'')===today);
  if(todayRole)return result(todayRole,'application','Review saved role','Saved in today’s batch.');
  if(pending.length){const r=pending[0],date=r.added_date||r.date_added;return result(r,'application','Review saved role',valid(date)?'Saved on '+date+'.':'An earlier saved role is ready to review.');}
  const unscheduled=real.find(r=>['Interview','Follow-up'].includes(r.application?.status)&&!r.application?.next_action);
  if(unscheduled)return result(unscheduled,unscheduled.application.status==='Interview'?'interview-review':'follow-up-plan',unscheduled.application.status==='Interview'?'Review interview details':'Plan follow-up','No due date has been set.');
  return null;
 }
 function applyNextAction(state,jobId,operation,{today,now}){
  if(!valid(today)||!Number.isFinite(Date.parse(now)))throw Error('A valid operating date and timestamp are required.');
  const role=(state.batches||[]).flatMap(b=>b.roles||[]).find(r=>id(r)===String(jobId));
  if(!role)throw Error('Application not found.');
  const app=role.application||{},current=app.next_action;
  if(operation.type==='schedule'){
   if(!active.has(app.status)||closed.has(app.status))throw Error('Plan a follow-up or preparation for an active application.');
   if(!operation.id||!/^[a-zA-Z0-9_-]{1,100}$/.test(operation.id))throw Error('A stable next-action ID is required.');
   if(!['follow-up','interview-preparation'].includes(operation.kind)||!valid(operation.due_date))throw Error('Choose an action and a valid due date.');
   if(current?.id===operation.id){if(current.kind!==operation.kind||current.due_date!==operation.due_date)throw Error('This action ID already has a different plan.');return false;}
   if(current?.status==='Open')throw Error('Complete or cancel the existing plan first.');
   role.application={...app,next_action:{id:operation.id,kind:operation.kind,due_date:operation.due_date,status:'Open',created_at:now}};
  }else if(operation.type==='complete'||operation.type==='cancel'){
   if(!current||current.id!==operation.id)throw Error('The next action changed. Review the latest plan.');
   if(current.status==='Completed'&&operation.type==='complete'||current.status==='Cancelled'&&operation.type==='cancel')return false;
   if(current.status!=='Open')throw Error('This plan is already closed.');
   role.application={...app,next_action:{...current,status:operation.type==='complete'?'Completed':'Cancelled',completed_at:operation.type==='complete'?now:undefined,cancelled_at:operation.type==='cancel'?now:undefined}};
   if(operation.type==='complete'){
    state.activity_log||=[];const eventId='next-action-'+current.id+'-completed';
    if(!state.activity_log.some(e=>e.id===eventId))state.activity_log.push({id:eventId,job_id:role.id,happened_at:now,activity_type:current.kind==='follow-up'?'Follow-up completed':'Interview preparation completed',channel:'Manual or assistant',notes:current.kind==='follow-up'?'Planned follow-up completed':'Planned interview preparation completed',next_action_id:current.id});
   }
  }else throw Error('Unsupported next-action operation.');
  return true;
 }
 const api={chooseMarketingNextAction,applyNextAction,valid};root.KryosMarketingNextAction=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
