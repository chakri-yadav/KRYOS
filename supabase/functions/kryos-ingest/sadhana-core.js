/* Shared by the browser and assistant projector. No network or UI dependencies. */
(function (root) {
  const cycle = { id: 'devi-2026-10-10', ruleVersion: 1, title: '48-Day Devi Sadhana', dayZero: '2026-10-09', dayZeroTime: '07:00', startDate: '2026-10-10', endDate: '2026-11-26', days: 48, timezone: 'America/Chicago' };
  const items = [
    ['astrology','No astrology','boundary'], ['instagram','No Instagram','boundary'],
    ['snapchat','No Snapchat','boundary'], ['astrology-videos','No astrology videos','boundary'],
    ['validation','No chasing external validation','boundary'], ['desperation','No acting from desperation','boundary'],
    ['self-control','Practise self-restraint and self-control','boundary'], ['clean-food','No junk food; eat clean food','boundary'],
    ['romanticizing','No deliberate romanticizing instead of action','boundary'], ['nama-japa','Naam Japa as much as possible','practice'],
    ['battle','Every day is a battle: serve and learn','guidance'], ['promise','Keep promises to yourself','guidance'],
    ['alignment','Align intentions, words, and actions','guidance'], ['learn','Learn Hanuman Chalisa and Aditya Hridayam','guidance'],
    ['sundara','Listen to Sundara Kanda whenever you have free time','guidance'], ['rewards','Receive instant, guilt-free rewards after action','guidance'],
    ['break','Take a break when Maa gives you one','guidance'], ['return','Get back and resume as soon as you drift','guidance'],
    ['rama','Walk in the path of Lord Rama','guidance'], ['hanuman','Remember: Hanuman helps you','guidance'],
    ['surroundings','Keep your surroundings organized','guidance']
  ].map(([id,label,type]) => ({id,label,type}));
  function validDate(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value; }
  function today(now = new Date().toISOString()) { const p = Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:cycle.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now)).map(x=>[x.type,x.value])); return `${p.year}-${p.month}-${p.day}`; }
  function number(date) { return Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(cycle.startDate+'T12:00:00Z'))/86400000)+1; }
  function dates() { return Array.from({length:48},(_,i)=>new Date(Date.parse(cycle.startDate+'T12:00:00Z')+i*86400000).toISOString().slice(0,10)); }
  function ensure(life) {
    life.actions ||= []; life.innerCommand ||= {}; life.innerCommand.containmentDays ||= [];
    if (!life.sadhana) {
      life.sadhana = { version:1, cycle:{...cycle}, days:{}, history:[], receipts:{} };
      life.sadhana.previousCycles = life.innerCommand.covenant ? [{covenant:structuredClone(life.innerCommand.covenant), records:structuredClone(life.innerCommand.containmentDays)}] : [];
    }
    life.innerCommand.covenant = {...cycle};
    return life.sadhana;
  }
  function day(life,date) {
    if(!validDate(date)||date<cycle.dayZero||date>cycle.endDate) throw new Error('Choose a date in this Sadhana cycle.');
    const s=ensure(life); return s.days[date] ||= {date,revision:0,items:{},tasks:[],breaches:[],planSet:false,reviewedAt:null};
  }
  function taskComplete(task,life,date) {
    const action=life.actions.find(a=>a.id===task.actionId);
    if(task.progress?.occurredDate===date) return task.progress.value>=task.target && action?.status==='done';
    if(task.kind==='check' && action?.status==='done') return (action.completedDate || (action.completedAt ? today(action.completedAt) : ''))===date;
    return false;
  }
  function evaluate(life,date) {
    const d=day(life,date);
    if(date===cycle.dayZero) return {status:'preparation',reasons:[],complete:0,total:0};
    const missing=items.filter(i=>i.type!=='guidance'&&!d.items[i.id]);
    const breaches=d.breaches.filter(b=>!b.correctedAt);
    const crossed=items.filter(i=>i.type!=='guidance'&&d.items[i.id]==='missed');
    const incomplete=d.tasks.filter(t=>!taskComplete(t,life,date));
    const reasons=[...crossed.map(i=>i.label),...breaches.map(b=>`Boundary crossed: ${b.boundaries.map(id=>items.find(i=>i.id===id)?.label||id).join(', ')}`),...incomplete.map(t=>t.title)];
    const knownMiss=crossed.length||breaches.length||incomplete.some(t=>t.missed===true);
    const unknown=!d.planSet||missing.length||incomplete.some(t=>!t.missed);
    const status=!d.reviewedAt?'open':knownMiss?'not-won':unknown?'open':incomplete.length?'not-won':'won';
    return {status,reasons,unknown:missing.map(i=>i.label),planSet:d.planSet,complete:d.tasks.length-incomplete.length,total:d.tasks.length};
  }
  function apply(life,operation,date,now,key) {
    const s=ensure(life); const fingerprint=JSON.stringify({operation,date});
    if(s.receipts[key]) { if(s.receipts[key].fingerprint!==fingerprint) throw new Error('Idempotency key was reused for different information.'); return s.receipts[key]; }
    const d=day(life,date); const before=structuredClone(d);
    if(operation.expectedRevision!=null && operation.expectedRevision!==d.revision) throw new Error('This day changed. Refresh and retry.');
    const type=operation.type.replace(/^sadhana\./,'');
    if(!['task.assign','cycle.start'].includes(type) && date>today(now)) throw new Error('Future days can be planned, not completed.');
    if(type==='cycle.start') {
      if(date!==cycle.dayZero) throw new Error('The restart begins on Day 0.');
    } else if(type==='task.assign') {
      if(typeof operation.title!=='string'||!operation.title.trim()||operation.title.length>180) throw new Error('Give the task a title (up to 180 characters).');
      const target=operation.kind==='quantity'?operation.target:1;
      if(!Number.isInteger(target)||target<1||target>100000) throw new Error('Target must be a positive whole number.');
      const actionId=operation.actionId||key+':action';
      let action=life.actions.find(a=>a.id===actionId);
      if(operation.actionId&&!action) throw new Error('The linked Actions task was not found.');
      if(d.tasks.some(t=>t.actionId===actionId)) throw new Error('This action is already assigned to this day.');
      if(!action) { action={id:actionId,externalId:actionId,title:operation.title.trim(),domain:'Personal tasks',priority:'important',deadline:date,status:'open',createdAt:now,updatedAt:now,completedAt:null}; life.actions.push(action); }
      d.tasks.push({id:key+':task',actionId,title:operation.title.trim(),kind:operation.kind==='quantity'?'quantity':'check',target,createdAt:now}); d.planSet=true;
    } else if(type==='plan.empty') {
      if(d.tasks.length) throw new Error('This day already has commitments.'); d.planSet=true;
    } else if(type==='item.set') {
      if(!items.some(i=>i.id===operation.itemId&&i.type!=='guidance')||!['kept','missed','unknown'].includes(operation.value)) throw new Error('Invalid outline update.');
      if(operation.value==='unknown') delete d.items[operation.itemId]; else d.items[operation.itemId]=operation.value;
    } else if(type==='task.progress') {
      const t=d.tasks.find(t=>t.id===operation.taskId); if(!t) throw new Error('Task not found.');
      if(!Number.isInteger(operation.value)||operation.value<0||operation.value>100000) throw new Error('Enter a non-negative whole number.');
      if(t.kind==='check'&&operation.value>1) throw new Error('A check task is either complete or incomplete.');
      t.progress={value:operation.value,occurredDate:date,recordedAt:now}; t.missed=!!d.reviewedAt&&operation.value<t.target;
      const a=life.actions.find(a=>a.id===t.actionId); if(!a) throw new Error('Linked action not found.');
      a.status=operation.value>=t.target?'done':'open'; a.completedAt=a.status==='done'?date+'T12:00:00.000Z':null; a.completedDate=a.status==='done'?date:null; a.updatedAt=now;
    } else if(type==='task.correct') {
      const t=d.tasks.find(t=>t.id===operation.taskId); if(!t) throw new Error('Task not found.');
      if(!String(operation.reason||'').trim()) throw new Error('Explain this correction.');
      if(!Number.isInteger(operation.target)||operation.target<1||operation.target>100000||t.kind==='check'&&operation.target!==1) throw new Error('Invalid corrected target.');
      t.target=operation.target;
      const a=life.actions.find(a=>a.id===t.actionId); if(a){a.status=(t.progress?.value||0)>=t.target?'done':'open';a.completedDate=a.status==='done'?date:null;a.completedAt=a.status==='done'?date+'T12:00:00.000Z':null;a.updatedAt=now;}
    } else if(type==='breach.record') {
      if(!Array.isArray(operation.boundaries)||!operation.boundaries.length||operation.boundaries.some(id=>!items.some(i=>i.id===id&&i.type==='boundary'))) throw new Error('Select one or more boundaries.');
      d.breaches.push({id:key+':breach',boundaries:[...new Set(operation.boundaries)],note:String(operation.note||'').slice(0,500),recordedAt:now,recovered:operation.recovered===true});
      operation.boundaries.forEach(id=>d.items[id]='missed');
    } else if(type==='breach.recover') {
      const b=d.breaches.find(b=>b.id===operation.breachId&&!b.correctedAt); if(!b) throw new Error('Incident not found.');
      b.recovered=true; b.recoveredAt=now;
    } else if(type==='breach.correct') {
      const b=d.breaches.find(b=>b.id===operation.breachId); if(!b||!String(operation.reason||'').trim()) throw new Error('Choose an incident and explain the correction.');
      b.correctedAt=now; b.correctionReason=operation.reason;
      b.boundaries.forEach(id=>{if(!d.breaches.some(other=>!other.correctedAt&&other.boundaries.includes(id))) delete d.items[id];});
    } else if(type==='day.review') {
      if(date===cycle.dayZero) throw new Error('Day 0 is preparation, not a battle.');
      if(date>=today(now)) throw new Error('Review the battle after the day ends. Your progress is already saved.');
      if(!d.planSet||items.some(i=>i.type!=='guidance'&&!d.items[i.id])) throw new Error('Confirm the plan and each daily item before reviewing.');
      d.tasks.forEach(t=>t.missed=!taskComplete(t,life,date)); d.reviewedAt=now;
    } else throw new Error('Unknown Sadhana operation.');
    d.revision++; d.updatedAt=now;
    s.history.push({id:key,date,type,at:now,reason:String(operation.reason||''),before,after:structuredClone(d)});
    const result=evaluate(life,date);
    const receipt={accepted:true,date,revision:d.revision,result:result.status,fingerprint}; s.receipts[key]=receipt;
    return receipt;
  }
  function actionChanged(life,action,date,now) {
    const s=ensure(life); action.completedDate=action.status==='done'?date:null;
    for(const d of Object.values(s.days)) for(const t of d.tasks.filter(t=>t.actionId===action.id)) {
      const before=structuredClone(d);
      if(action.status!=='done') {t.progress={value:0,occurredDate:d.date,recordedAt:now};t.missed=!!d.reviewedAt;}
      else if(date===d.date) {t.progress={value:t.target,occurredDate:date,recordedAt:now};t.missed=false;}
      d.revision++; d.updatedAt=now;
      s.history.push({id:now+':'+t.id,date:d.date,type:'action.status',at:now,before,after:structuredClone(d)});
    }
  }
  root.KryosSadhana={cycle,items,today,number,dates,ensure,day,evaluate,apply,actionChanged,taskComplete};
})(globalThis);
