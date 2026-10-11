/* Inner Command uses the same life.actions records as the Actions page. */
let commitmentDate = '';
function commitmentLife() { const life=lifeStore(); KryosCommitment.ensure(life); return life; }
function commitmentSelected() { const today=KryosCommitment.today(); return commitmentDate || (today<KryosCommitment.cycle.dayZero?KryosCommitment.cycle.dayZero:today>KryosCommitment.cycle.endDate?KryosCommitment.cycle.endDate:today); }
function commitmentMutate(operation,date=commitmentSelected()) {
  const next=structuredClone(commitmentLife());
  const receipt=KryosCommitment.apply(next,operation,date,new Date().toISOString(),createId());
  taskState.life=next; saveTasks(); lifeNotice='Saved on this device. '+(typeof actionSyncLabel==='function'?actionSyncLabel():'');
  renderLifeJournal(); return receipt;
}
function innerCommandDayNumber(date=KryosCommitment.today()) { return KryosCommitment.number(date); }
function innerCommandEndDate() { return KryosCommitment.cycle.endDate; }
function renderInnerCommandPurpose() {
  return `<section class="command-purpose"><div class="command-purpose-copy"><p class="section-kicker">MY PROMISE TO PERSONAL COMMITMENT</p><h1>Return with sincerity. Keep the promise.</h1><p>I begin again with sincere effort and structure. By keeping promises, I rebuild trust in myself, entrust my worries to Personal Commitment, take responsibility, and become capable of receiving and sustaining her blessings.</p><blockquote>My progress is internal: consistent practice, responsibility, and detachment. External outcomes do not decide my worth or today's battle.</blockquote></div></section>`;
}
function renderContainmentDialog() { return ''; }
function renderContainmentCovenant() {
  const life=commitmentLife(),date=commitmentSelected(),d=KryosCommitment.day(life,date),r=KryosCommitment.evaluate(life,date),n=KryosCommitment.number(date);
  const future=date>KryosCommitment.today(),labels={open:future?'Open · planned day':'Open · '+(date<KryosCommitment.today()?'awaiting review':'in progress'),won:'Battle won','not-won':'Battle not won',preparation:'Day 0 · preparation'};
  const outline=KryosCommitment.items.filter(i=>i.type!=='guidance');
  const available=life.actions.filter(a=>a.status!=='archived'&&!d.tasks.some(t=>t.actionId===a.id));
  return `<section class="commitment-workspace"><header><div><p class="section-kicker">48-DAY COMMITMENT CYCLE</p><h2>${n===0?'Day 0 · Begin at 7 a.m.':`Day ${n} of 48`}</h2><p>October 11 – November 27 · America/Chicago</p></div><label>Open a day<input id="commitment-date" type="date" min="${KryosCommitment.cycle.dayZero}" max="${KryosCommitment.cycle.endDate}" value="${date}"></label></header>
    <div class="commitment-result ${r.status}" role="status"><strong>${labels[r.status]}</strong><span>${r.complete}/${r.total} must-do tasks complete</span><small id="commitment-sync">${escapeHtml(typeof actionSyncLabel==='function'?actionSyncLabel():'Saved on this device')}</small></div>
    ${n===0?'<p>Read the outline and prepare your commitments. October 10 is Day 1; Day 0 has no win/loss score.</p>':''}
    <section><h3>My daily outline</h3><p>Tick a boundary when you kept it. Tick Meditative Practice when you practised. Feelings alone are not breaches.</p><div class="commitment-outline">${outline.map(i=>`<article class="${d.items[i.id]||'unknown'}"><label><input type="checkbox" data-commitment-item="${i.id}" ${d.items[i.id]==='kept'?'checked':''} ${future?'disabled':''}><span>${escapeHtml(i.label)}</span></label><button type="button" data-commitment-missed="${i.id}" ${future?'disabled':''}>${d.items[i.id]==='missed'?'Recorded as missed':'Not kept / not done'}</button></article>`).join('')}</div>
    <details class="commitment-guidance" open><summary>Read the rest of my promise</summary>${KryosCommitment.items.filter(i=>i.type==='guidance').map(i=>`<p>${escapeHtml(i.label)}</p>`).join('')}</details></section>
    <section><h3>My must-do tasks for ${escapeHtml(date)}</h3><p>Only the commitments you assign here determine this part of the battle.</p><div class="commitment-tasks">${d.tasks.map(t=>{
      const a=life.actions.find(a=>a.id===t.actionId),value=t.progress?.value||0,done=KryosCommitment.taskComplete(t,life,date);
      return `<article><label><input type="checkbox" data-commitment-task="${t.id}" ${done?'checked':''} ${future?'disabled':''}><strong>${escapeHtml(t.title)}</strong></label>${t.kind==='quantity'?`<label>Completed total<input type="number" min="0" max="100000" value="${value}" data-commitment-count="${t.id}" ${future?'disabled':''}></label><progress max="${t.target}" value="${Math.min(value,t.target)}"></progress><span>${value}/${t.target}</span>`:''}<small>Shared with Actions · ${escapeHtml(a?.status||'missing')}</small><button type="button" data-commitment-correct="${t.id}">Correct target</button></article>`;
    }).join('')||'<p>No tasks assigned for this date.</p>'}</div>
    <details><summary>＋ Add a must-do task</summary><form id="commitment-task-form"><label>Use an existing Actions task<select name="actionId"><option value="">Create a new shared task</option>${available.map(a=>`<option value="${escapeHtml(a.id)}">${escapeHtml(a.title)}</option>`).join('')}</select></label><label>My commitment<input name="title" maxlength="180" placeholder="What must be finished on this date?"></label><label>Completion type<select name="kind"><option value="check">One completion check</option><option value="quantity">A quantity target</option></select></label><label>Quantity target<input name="target" type="number" min="1" max="100000" value="1"></label><button class="primary-button">Assign to this day</button></form></details>
    ${!d.planSet?`<button class="secondary-button" data-commitment-empty ${future?'disabled':''}>No additional must-do tasks for this day</button>`:''}</section>
    <section><h3>Record a boundary breach</h3><details><summary>Select every boundary crossed</summary><form id="commitment-breach-form"><div class="commitment-breach-options">${outline.filter(i=>i.type==='boundary').map(i=>`<label><input type="checkbox" name="boundary" value="${i.id}" ${future?'disabled':''}>${escapeHtml(i.label)}</label>`).join('')}</div><label>What happened? <textarea name="note" maxlength="500"></textarea></label><label><input type="checkbox" name="recovered">I returned to the intended action</label><button class="secondary-button" ${future?'disabled':''}>Record incident</button></form></details>${d.breaches.filter(b=>!b.correctedAt).map(b=>`<article class="commitment-incident"><strong>${b.boundaries.map(id=>escapeHtml(KryosCommitment.items.find(i=>i.id===id)?.label||id)).join(' · ')}</strong><p>${escapeHtml(b.note)}</p><small>${b.recovered?'Return recorded':'Return not yet recorded'}</small>${!b.recovered?`<button data-commitment-recover="${b.id}">I returned to action</button>`:''}<button data-commitment-breach-correct="${b.id}">Correct mistaken incident</button></article>`).join('')}</section>
    <footer><button class="primary-button" data-commitment-review ${future||n===0||date>=KryosCommitment.today()?'disabled':''}>Review this day's battle</button><p>${date>=KryosCommitment.today()?'Progress saves as you go. Review the battle after the day ends.':'Late journaling counts for the day the work happened.'}</p>${d.reviewedAt?`<p>Reviewed ${escapeHtml(d.reviewedAt)} · ${r.status==='open'?'Confirm the remaining unknown items.':r.reasons.map(escapeHtml).join(' · ')}</p>`:''}</footer>
    <details><summary>My 48-day journey</summary><div class="commitment-calendar">${KryosCommitment.dates().map((key,index)=>{const record=life.s\u0061dhana.days[key],status=record?KryosCommitment.evaluate(life,key).status:'open';return `<button class="${status}" data-commitment-day="${key}" aria-label="Day ${index+1}, ${key}, ${status}">${index+1}</button>`;}).join('')}</div></details>
    <details><summary>Previous Commitment history</summary>${(life.s\u0061dhana.previousCycles||[]).map(c=>`<p>${escapeHtml(c.covenant.startDate)} – ${escapeHtml(c.covenant.endDate)} · ${c.records.length} preserved records</p>`).join('')}<p>${life.s\u0061dhana.history.length} changes recorded for this cycle.</p></details>
  </section>`;
}
document.addEventListener('change',event=>{
  const el=event.target;
  try {
    if(el.id==='commitment-date'){commitmentDate=el.value;renderLifeJournal();}
    if(el.dataset.commitmentItem) commitmentMutate({type:'item.set',itemId:el.dataset.commitmentItem,value:el.checked?'kept':'unknown'});
    if(el.dataset.commitmentTask){const t=KryosCommitment.day(commitmentLife(),commitmentSelected()).tasks.find(t=>t.id===el.dataset.commitmentTask);commitmentMutate({type:'task.progress',taskId:t.id,value:el.checked?t.target:0});}
    if(el.dataset.commitmentCount) commitmentMutate({type:'task.progress',taskId:el.dataset.commitmentCount,value:Number(el.value)});
  }catch(error){lifeNotice=error.message;renderLifeJournal();}
});
document.addEventListener('submit',event=>{
  if(!['commitment-task-form','commitment-breach-form'].includes(event.target.id))return;
  event.preventDefault(); const f=new FormData(event.target);
  try {
    if(event.target.id==='commitment-task-form') {
      const action=commitmentLife().actions.find(a=>a.id===f.get('actionId'));
      commitmentMutate({type:'task.assign',title:String(f.get('title')||'').trim()||action?.title||'',actionId:action?.id,kind:f.get('kind'),target:Number(f.get('target'))});
    }else commitmentMutate({type:'breach.record',boundaries:f.getAll('boundary'),note:f.get('note'),recovered:f.has('recovered')});
  }catch(error){lifeNotice=error.message;renderLifeJournal();}
});
document.addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  try {
    if(el.dataset.commitmentDay){commitmentDate=el.dataset.commitmentDay;renderLifeJournal();}
    if(el.dataset.commitmentMissed)commitmentMutate({type:'item.set',itemId:el.dataset.commitmentMissed,value:'missed'});
    if(el.hasAttribute('data-commitment-empty'))commitmentMutate({type:'plan.empty'});
    if(el.hasAttribute('data-commitment-review'))commitmentMutate({type:'day.review'});
    if(el.dataset.commitmentRecover)commitmentMutate({type:'breach.recover',breachId:el.dataset.commitmentRecover});
    if(el.dataset.commitmentCorrect){const t=KryosCommitment.day(commitmentLife(),commitmentSelected()).tasks.find(t=>t.id===el.dataset.commitmentCorrect);const target=prompt('Correct quantity target',String(t.target));if(target===null)return;const reason=prompt('Why is this a correction?');if(reason===null)return;commitmentMutate({type:'task.correct',taskId:t.id,target:Number(target),reason});}
    if(el.dataset.commitmentBreachCorrect){const reason=prompt('Explain the mistaken record. A genuine breach remains part of the day.');if(reason!==null)commitmentMutate({type:'breach.correct',breachId:el.dataset.commitmentBreachCorrect,reason});}
  }catch(error){lifeNotice=error.message;renderLifeJournal();}
});
const commitmentOriginalActionStatus=updateActionStatus;
updateActionStatus=function(action,status){const now=new Date().toISOString(),date=KryosCommitment.today(now);const previous=action.status;const result=commitmentOriginalActionStatus(action,status);if(result&&status!==previous&&(status==='done'||previous==='done')){KryosCommitment.actionChanged(commitmentLife(),action,date,now);saveTasks();}return result;};
const commitmentOriginalSyncIndicator=updateActionSyncIndicator;
updateActionSyncIndicator=function(){commitmentOriginalSyncIndicator();const el=document.querySelector('#commitment-sync');if(el)el.textContent=actionSyncLabel();};
const commitmentOriginalActionCard=renderActionCard;
renderActionCard=function(action){const links=Object.values(commitmentLife().s\u0061dhana.days).flatMap(d=>d.tasks.filter(t=>t.actionId===action.id).map(t=>({date:d.date,task:t})));const html=commitmentOriginalActionCard(action);if(!links.length)return html;return html+`<div class="commitment-action-links">${links.map(({date,task})=>`<button class="secondary-button" data-commitment-open="${date}">Must-do · ${escapeHtml(date)}${task.kind==='quantity'?` · ${task.progress?.value||0}/${task.target}`:''}</button>`).join('')}</div>`;};
document.addEventListener('click',event=>{const el=event.target.closest('[data-commitment-open]');if(el){commitmentDate=el.dataset.commitmentOpen;setPage('journal');}});
