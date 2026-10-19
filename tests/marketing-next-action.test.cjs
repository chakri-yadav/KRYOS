const test=require('node:test'),assert=require('node:assert/strict');
const {chooseMarketingNextAction:choose,applyNextAction:apply}=require('../marketing-next-action.js');
const today='2026-10-19',now='2026-10-19T18:00:00Z';
const role=(id,status,extra={})=>({id,company:'Synthetic',title:'Engineer',application:{status,...extra}});
test('empty, completed, closed, deferred and synthetic work never produce a next application',()=>{
 for(const roles of [[],['Applied','Archived','Not selected','Rejected','Accepted','Offer','Keep for later'].map((s,i)=>role(String(i),s)),[{...role('demo-a','Saved')},{...role('a','Saved'),is_test:true}]])assert.equal(choose({roles,today}),null);
});
test('scheduled due work precedes saved selection, ties break by ID, future work stays future',()=>{
 const planned=(id,due)=>role(id,'Interview',{next_action:{id,kind:'interview-preparation',due_date:due,status:'Open'}});
 const roles=[role('saved','Saved'),planned('b',today),planned('a',today),planned('future','2026-10-20')];
 const next=choose({roles,today,selectedJobId:'saved'});assert.equal(next.jobId,'a');assert.equal(next.kind,'interview-preparation');assert.match(next.reason,/2026-10-19/);
 assert.equal(choose({roles:[planned('future','2026-10-20')],today}),null);
 assert.equal(choose({roles:[planned('done',today)].map(r=>({...r,application:{...r.application,next_action:{...r.application.next_action,status:'Completed'}}})),today}),null);
});
test('selected saved role, today batch, then older saved role are deterministic',()=>{
 const older={...role('old','Saved'),added_date:'2026-10-18'},fresh={...role('fresh','To review'),added_date:today};
 assert.equal(choose({roles:[older,fresh],today,selectedJobId:'old'}).jobId,'old');
 assert.equal(choose({roles:[older,fresh],today}).jobId,'fresh');
 assert.match(choose({roles:[older],today}).reason,/2026-10-18/);
});
test('unscheduled interview and follow-up are review/planning with no invented deadline',()=>{
 assert.equal(choose({roles:[role('a','Interview')],today}).label,'Review interview details');
 const next=choose({roles:[role('b','Follow-up')],today});assert.equal(next.label,'Plan follow-up');assert.match(next.reason,/No due date/);
});
test('planning, completing and repeating completion preserve unknown data and add one stable activity',()=>{
 const state={batches:[{roles:[{...role('a','Applied'),custom:'preserved'}]}],unknown:{keep:true}};
 const op={type:'schedule',id:'stable-plan',kind:'follow-up',due_date:today};
 assert.equal(apply(state,'a',op,{today,now}),true);assert.equal(apply(state,'a',op,{today,now}),false);
 assert.equal(apply(state,'a',{type:'complete',id:op.id},{today,now}),true);assert.equal(apply(state,'a',{type:'complete',id:op.id},{today,now}),false);
 assert.equal(state.activity_log.length,1);assert.equal(state.activity_log[0].activity_type,'Follow-up completed');
 assert.equal(state.batches[0].roles[0].application.status,'Applied');assert.equal(state.batches[0].roles[0].application.applied_date,undefined);
 assert.equal(state.batches[0].roles[0].custom,'preserved');assert.equal(state.unknown.keep,true);
});
test('invalid dates, changed IDs and closed jobs reject safely, cancellation creates no completion',()=>{
 const state={batches:[{roles:[role('a','Applied'),role('closed','Archived')]}]},before=JSON.stringify(state);
 assert.throws(()=>apply(state,'a',{type:'schedule',id:'x',kind:'follow-up',due_date:'2026-02-30'},{today,now}),/valid due date/);
 assert.equal(JSON.stringify(state),before);
 assert.throws(()=>apply(state,'closed',{type:'schedule',id:'x',kind:'follow-up',due_date:today},{today,now}),/active application/);
 apply(state,'a',{type:'schedule',id:'x',kind:'follow-up',due_date:today},{today,now});
 assert.throws(()=>apply(state,'a',{type:'complete',id:'wrong'},{today,now}),/changed/);
 apply(state,'a',{type:'cancel',id:'x'},{today,now});assert.equal(state.activity_log,undefined);
});
