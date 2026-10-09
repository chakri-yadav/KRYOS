/* Inner Command uses the same life.actions records as the Actions page. */
let sadhanaDate = '';
function sadhanaLife() { const life=lifeStore(); KryosSadhana.ensure(life); return life; }
function sadhanaSelected() { const today=KryosSadhana.today(); return sadhanaDate || (today<KryosSadhana.cycle.dayZero?KryosSadhana.cycle.dayZero:today>KryosSadhana.cycle.endDate?KryosSadhana.cycle.endDate:today); }
function sadhanaMutate(operation,date=sadhanaSelected()) {
  const next=structuredClone(sadhanaLife());
  const receipt=KryosSadhana.apply(next,operation,date,new Date().toISOString(),createId());
  taskState.life=next; saveTasks(); lifeNotice='Saved on this device. '+(typeof actionSyncLabel==='function'?actionSyncLabel():'');
  renderLifeJournal(); return receipt;
}
function innerCommandDayNumber(date=KryosSadhana.today()) { return KryosSadhana.number(date); }
function innerCommandEndDate() { return KryosSadhana.cycle.endDate; }
function renderInnerCommandPurpose() {
  return `<section class="command-purpose"><div class="command-purpose-copy"><p class="section-kicker">MY PROMISE TO DEVI MOTHER</p><h1>Return with sincerity. Keep the promise.</h1><p>I begin again with sincere effort and structure. By keeping promises, I rebuild trust in myself, entrust my worries to Devi Mother, take responsibility, and become capable of receiving and sustaining her blessings.</p><blockquote>My progress is internal: consistent practice, responsibility, and detachment. External outcomes do not decide my worth or today's battle.</blockquote></div></section>`;
}
function renderContainmentDialog() { return ''; }
function renderContainmentCovenant() {
  const life=sadhanaLife(),date=sadhanaSelected(),d=KryosSadhana.day(life,date),r=KryosSadhana.evaluate(life,date),n=KryosSadhana.number(date);
  const future=date>KryosSadhana.today(),labels={open:future?'Open · planned day':'Open · '+(date<KryosSadhana.today()?'awaiting review':'in progress'),won:'Battle won','not-won':'Battle not won',preparation:'Day 0 · preparation'};
  const outline=KryosSadhana.items.filter(i=>i.type!=='guidance');
  const available=life.actions.filter(a=>a.status!=='archived'&&!d.tasks.some(t=>t.actionId===a.id));
  return `<section class="sadhana-workspace"><header><div><p class="section-kicker">48-DAY DEVI SADHANA</p><h2>${n===0?'Day 0 · Begin at 7 a.m.':`Day ${n} of 48`}</h2><p>October 10 – November 26 · America/Chicago</p></div><label>Open a day<input id="sadhana-date" type="date" min="2026-10-09" max="2026-11-26" value="${date}"></label></header>
    <div class="sadhana-result ${r.status}" role="status"><strong>${labels[r.status]}</strong><span>${r.complete}/${r.total} must-do tasks complete</span><small id="sadhana-sync">${escapeHtml(typeof actionSyncLabel==='function'?actionSyncLabel():'Saved on this device')}</small></div>
    ${n===0?'<p>Read the outline and prepare your commitments. October 10 is Day 1; Day 0 has no win/loss score.</p>':''}
    <section><h3>My daily outline</h3><p>Tick a boundary when you kept it. Tick Naam Japa when you practised. Feelings alone are not breaches.</p><div class="sadhana-outline">${outline.map(i=>`<article class="${d.items[i.id]||'unknown'}"><label><input type="checkbox" data-sadhana-item="${i.id}" ${d.items[i.id]==='kept'?'checked':''} ${future?'disabled':''}><span>${escapeHtml(i.label)}</span></label><button type="button" data-sadhana-missed="${i.id}" ${future?'disabled':''}>${d.items[i.id]==='missed'?'Recorded as missed':'Not kept / not done'}</button></article>`).join('')}</div>
    <details class="sadhana-guidance" open><summary>Read the rest of my promise</summary>${KryosSadhana.items.filter(i=>i.type==='guidance').map(i=>`<p>${escapeHtml(i.label)}</p>`).join('')}</details></section>
    <section><h3>My must-do tasks for ${escapeHtml(date)}</h3><p>Only the commitments you assign here determine this part of the battle.</p><div class="sadhana-tasks">${d.tasks.map(t=>{
      const a=life.actions.find(a=>a.id===t.actionId),value=t.progress?.value||0,done=KryosSadhana.taskComplete(t,life,date);
      return `<article><label><input type="checkbox" data-sadhana-task="${t.id}" ${done?'checked':''} ${future?'disabled':''}><strong>${escapeHtml(t.title)}</strong></label>${t.kind==='quantity'?`<label>Completed total<input type="number" min="0" max="100000" value="${value}" data-sadhana-count="${t.id}" ${future?'disabled':''}></label><progress max="${t.target}" value="${Math.min(value,t.target)}"></progress><span>${value}/${t.target}</span>`:''}<small>Shared with Actions · ${escapeHtml(a?.status||'missing')}</small><button type="button" data-sadhana-correct="${t.id}">Correct target</button></article>`;
    }).join('')||'<p>No tasks assigned for this date.</p>'}</div>
    <details><summary>＋ Add a must-do task</summary><form id="sadhana-task-form"><label>Use an existing Actions task<select name="actionId"><option value="">Create a new shared task</option>${available.map(a=>`<option value="${escapeHtml(a.id)}">${escapeHtml(a.title)}</option>`).join('')}</select></label><label>My commitment<input name="title" maxlength="180" placeholder="What must be finished on this date?"></label><label>Completion type<select name="kind"><option value="check">One completion check</option><option value="quantity">A quantity target</option></select></label><label>Quantity target<input name="target" type="number" min="1" max="100000" value="1"></label><button class="primary-button">Assign to this day</button></form></details>
    ${!d.planSet?`<button class="secondary-button" data-sadhana-empty ${future?'disabled':''}>No additional must-do tasks for this day</button>`:''}</section>
    <section><h3>Record a boundary breach</h3><details><summary>Select every boundary crossed</summary><form id="sadhana-breach-form"><div class="sadhana-breach-options">${outline.filter(i=>i.type==='boundary').map(i=>`<label><input type="checkbox" name="boundary" value="${i.id}" ${future?'disabled':''}>${escapeHtml(i.label)}</label>`).join('')}</div><label>What happened? <textarea name="note" maxlength="500"></textarea></label><label><input type="checkbox" name="recovered">I returned to the intended action</label><button class="secondary-button" ${future?'disabled':''}>Record incident</button></form></details>${d.breaches.filter(b=>!b.correctedAt).map(b=>`<article class="sadhana-incident"><strong>${b.boundaries.map(id=>escapeHtml(KryosSadhana.items.find(i=>i.id===id)?.label||id)).join(' · ')}</strong><p>${escapeHtml(b.note)}</p><small>${b.recovered?'Return recorded':'Return not yet recorded'}</small>${!b.recovered?`<button data-sadhana-recover="${b.id}">I returned to action</button>`:''}<button data-sadhana-breach-correct="${b.id}">Correct mistaken incident</button></article>`).join('')}</section>
    <footer><button class="primary-button" data-sadhana-review ${future||n===0||date>=KryosSadhana.today()?'disabled':''}>Review this day's battle</button><p>${date>=KryosSadhana.today()?'Progress saves as you go. Review the battle after the day ends.':'Late journaling counts for the day the work happened.'}</p>${d.reviewedAt?`<p>Reviewed ${escapeHtml(d.reviewedAt)} · ${r.status==='open'?'Confirm the remaining unknown items.':r.reasons.map(escapeHtml).join(' · ')}</p>`:''}</footer>
    <details><summary>My 48-day journey</summary><div class="sadhana-calendar">${KryosSadhana.dates().map((key,index)=>{const record=life.sadhana.days[key],status=record?KryosSadhana.evaluate(life,key).status:'open';return `<button class="${status}" data-sadhana-day="${key}" aria-label="Day ${index+1}, ${key}, ${status}">${index+1}</button>`;}).join('')}</div></details>
    <details><summary>Previous Sadhana history</summary>${(life.sadhana.previousCycles||[]).map(c=>`<p>${escapeHtml(c.covenant.startDate)} – ${escapeHtml(c.covenant.endDate)} · ${c.records.length} preserved records</p>`).join('')}<p>${life.sadhana.history.length} changes recorded for this cycle.</p></details>
  </section>`;
}
document.addEventListener('change',event=>{
  const el=event.target;
  try {
    if(el.id==='sadhana-date'){sadhanaDate=el.value;renderLifeJournal();}
    if(el.dataset.sadhanaItem) sadhanaMutate({type:'item.set',itemId:el.dataset.sadhanaItem,value:el.checked?'kept':'unknown'});
    if(el.dataset.sadhanaTask){const t=KryosSadhana.day(sadhanaLife(),sadhanaSelected()).tasks.find(t=>t.id===el.dataset.sadhanaTask);sadhanaMutate({type:'task.progress',taskId:t.id,value:el.checked?t.target:0});}
    if(el.dataset.sadhanaCount) sadhanaMutate({type:'task.progress',taskId:el.dataset.sadhanaCount,value:Number(el.value)});
  }catch(error){lifeNotice=error.message;renderLifeJournal();}
});
document.addEventListener('submit',event=>{
  if(!['sadhana-task-form','sadhana-breach-form'].includes(event.target.id))return;
  event.preventDefault(); const f=new FormData(event.target);
  try {
    if(event.target.id==='sadhana-task-form') {
      const action=sadhanaLife().actions.find(a=>a.id===f.get('actionId'));
      sadhanaMutate({type:'task.assign',title:String(f.get('title')||'').trim()||action?.title||'',actionId:action?.id,kind:f.get('kind'),target:Number(f.get('target'))});
    }else sadhanaMutate({type:'breach.record',boundaries:f.getAll('boundary'),note:f.get('note'),recovered:f.has('recovered')});
  }catch(error){lifeNotice=error.message;renderLifeJournal();}
});
document.addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  try {
    if(el.dataset.sadhanaDay){sadhanaDate=el.dataset.sadhanaDay;renderLifeJournal();}
    if(el.dataset.sadhanaMissed)sadhanaMutate({type:'item.set',itemId:el.dataset.sadhanaMissed,value:'missed'});
    if(el.hasAttribute('data-sadhana-empty'))sadhanaMutate({type:'plan.empty'});
    if(el.hasAttribute('data-sadhana-review'))sadhanaMutate({type:'day.review'});
    if(el.dataset.sadhanaRecover)sadhanaMutate({type:'breach.recover',breachId:el.dataset.sadhanaRecover});
    if(el.dataset.sadhanaCorrect){const t=KryosSadhana.day(sadhanaLife(),sadhanaSelected()).tasks.find(t=>t.id===el.dataset.sadhanaCorrect);const target=prompt('Correct quantity target',String(t.target));if(target===null)return;const reason=prompt('Why is this a correction?');if(reason===null)return;sadhanaMutate({type:'task.correct',taskId:t.id,target:Number(target),reason});}
    if(el.dataset.sadhanaBreachCorrect){const reason=prompt('Explain the mistaken record. A genuine breach remains part of the day.');if(reason!==null)sadhanaMutate({type:'breach.correct',breachId:el.dataset.sadhanaBreachCorrect,reason});}
  }catch(error){lifeNotice=error.message;renderLifeJournal();}
});
const sadhanaOriginalActionStatus=updateActionStatus;
updateActionStatus=function(action,status){const now=new Date().toISOString(),date=KryosSadhana.today(now);const previous=action.status;const result=sadhanaOriginalActionStatus(action,status);if(result&&status!==previous&&(status==='done'||previous==='done')){KryosSadhana.actionChanged(sadhanaLife(),action,date,now);saveTasks();}return result;};
const sadhanaOriginalSyncIndicator=updateActionSyncIndicator;
updateActionSyncIndicator=function(){sadhanaOriginalSyncIndicator();const el=document.querySelector('#sadhana-sync');if(el)el.textContent=actionSyncLabel();};
const sadhanaOriginalActionCard=renderActionCard;
renderActionCard=function(action){const links=Object.values(sadhanaLife().sadhana.days).flatMap(d=>d.tasks.filter(t=>t.actionId===action.id).map(t=>({date:d.date,task:t})));const html=sadhanaOriginalActionCard(action);if(!links.length)return html;return html+`<div class="sadhana-action-links">${links.map(({date,task})=>`<button class="secondary-button" data-sadhana-open="${date}">Must-do · ${escapeHtml(date)}${task.kind==='quantity'?` · ${task.progress?.value||0}/${task.target}`:''}</button>`).join('')}</div>`;};
document.addEventListener('click',event=>{const el=event.target.closest('[data-sadhana-open]');if(el){sadhanaDate=el.dataset.sadhanaOpen;setPage('journal');}});
