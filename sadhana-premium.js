/* Daily command presentation; uses the existing shared battle engine. */
const commandPreviousNextStep = typeof renderInnerCommandNextStep === 'function' ? renderInnerCommandNextStep : null;
if (commandPreviousNextStep) renderInnerCommandNextStep = () => '';
let commandOpenPanels = new Set(['command-guidance']);
const commandFormDrafts = new Map();
let commandSubmittedForm = '';
function commandDateLabel(date) {return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long',month:'long',day:'numeric'});}
function renderInnerCommandPurpose() {
  const date=sadhanaSelected(),n=KryosSadhana.number(date);
  return `<header class="command-premium-title"><div><p class="section-kicker">INNER COMMAND / DEVI SADHANA</p><h1>Keep today's promise.</h1><p>${n===0?'Preparation':`Day ${n} of 48`} · ${escapeHtml(commandDateLabel(date))}</p></div><label class="command-date-picker"><span>Open a day</span><input id="sadhana-date" type="date" min="2026-10-09" max="2026-11-26" value="${date}"></label></header><section class="command-premium-purpose"><p class="section-kicker">MY PROMISE TO DEVI MOTHER</p><p>I begin again with sincere effort and structure. By keeping promises, I rebuild trust in myself, entrust my worries to Devi Mother, take responsibility, and become capable of receiving and sustaining her blessings.</p><small>My progress is internal: consistent practice, responsibility, and detachment. External outcomes do not decide today's battle.</small></section>`;
}
function commandJourneyModel(life,today) {
  const snapshot=JSON.parse(JSON.stringify(life));
  return KryosSadhana.dates().map((date,index)=>{
    const result=KryosSadhana.evaluate(snapshot,date);
    const state=date>today?'upcoming':result.status==='won'?'won':result.status==='not-won'?'not-won':date===today?'in-progress':'awaiting-review';
    const recovered=(life.sadhana.days[date]?.breaches||[]).some(b=>!b.correctedAt&&b.recovered);
    return {date,number:index+1,state,recovered};
  });
}
function renderCommandJourney(life,selected,today) {
  const days=commandJourneyModel(life,today),count=state=>days.filter(d=>d.state===state).length;
  const elapsed=days.filter(d=>d.date<today).length,won=count('won');
  const labels={'won':'Won','not-won':'Not won','awaiting-review':'Awaiting review','in-progress':'In progress','upcoming':'Upcoming'};
  const symbols={'won':'✓','not-won':'×','awaiting-review':'?','in-progress':'●','upcoming':'—'};
  return `<section class="command-paper command-journey-map" aria-label="48-day Sadhana progress"><header><div><p class="section-kicker">MY 48-DAY JOURNEY</p><h2>One promise at a time.</h2></div><span>October 10 – November 26</span></header><div class="command-journey-summary"><strong>${won}<small> / 48 days won</small></strong><span>${count('not-won')} not won · ${count('awaiting-review')} awaiting review</span><span>${elapsed} days elapsed · ${48-elapsed} remaining${count('in-progress')?' including today':''}</span></div><div class="command-journey-track" role="progressbar" aria-label="Days won, not time elapsed" aria-valuemin="0" aria-valuemax="48" aria-valuenow="${won}"><span style="width:${won/48*100}%"></span></div><div class="sadhana-calendar">${days.map(d=>`<button type="button" class="${d.state} ${selected===d.date?'is-selected':''}" data-sadhana-day="${d.date}" aria-pressed="${selected===d.date}" aria-label="Day ${d.number}, ${commandDateLabel(d.date)}, ${labels[d.state]}${d.recovered?', return to action recorded':''}"><span>${d.number}</span><small aria-hidden="true">${symbols[d.state]}${d.recovered?' ↗':''}</small></button>`).join('')}</div><div class="command-legend"><span>✓ Won</span><span>× Not won</span><span>? Awaiting review</span><span>● In progress</span><span>— Upcoming</span><span>↗ Return recorded</span></div></section>`;
}
function commandTaskCard(task,life,date,future,nextId) {
  const done=KryosSadhana.taskComplete(task,life,date),value=task.progress?.value||0;
  return `<article class="command-task ${done?'is-complete':''}">${task.id===nextId?'<span class="command-task-kicker">NEXT COMMITMENT</span>':''}<label class="command-check"><input type="checkbox" data-sadhana-task="${escapeHtml(task.id)}" ${done?'checked':''} ${future?'disabled':''}><span>${escapeHtml(task.title)}</span></label>${task.kind==='quantity'?`<div class="command-quantity"><label><span>Completed total</span><span class="command-stepper"><button type="button" data-command-step="-1" data-task-id="${escapeHtml(task.id)}" ${future||value===0?'disabled':''} aria-label="Decrease ${escapeHtml(task.title)} total">−</button><input type="number" min="0" max="100000" value="${value}" data-sadhana-count="${escapeHtml(task.id)}" ${future?'disabled':''} aria-label="Completed total for ${escapeHtml(task.title)}"><button type="button" data-command-step="1" data-task-id="${escapeHtml(task.id)}" ${future||value>=100000?'disabled':''} aria-label="Increase ${escapeHtml(task.title)} total">＋</button></span></label><span class="command-quantity-target">of ${task.target}</span></div><progress max="${task.target}" value="${Math.min(value,task.target)}" aria-label="${escapeHtml(task.title)} progress"></progress><div class="command-task-meta"><span>${Math.max(0,task.target-value)} remaining</span><span>Shared with Actions</span></div>`:'<p class="command-task-meta">One completion check · shared with Actions</p>'}<details id="command-task-${escapeHtml(task.id)}" class="command-task-options"><summary>Task options</summary><button type="button" data-sadhana-correct="${escapeHtml(task.id)}">Correct target</button><button type="button" data-page="actions">Open Actions</button></details></article>`;
}
function renderContainmentCovenant() {
  const life=sadhanaLife(),date=sadhanaSelected(),today=KryosSadhana.today(),d=KryosSadhana.day(life,date),result=KryosSadhana.evaluate(life,date),n=KryosSadhana.number(date),future=date>today;
  const items=KryosSadhana.items.filter(i=>i.type!=='guidance'),confirmed=items.filter(i=>!!d.items[i.id]).length,next=d.tasks.find(t=>!KryosSadhana.taskComplete(t,life,date));
  const actions=life.actions.filter(a=>a.status!=='archived'&&!d.tasks.some(t=>t.actionId===a.id)),incidents=d.breaches.filter(b=>!b.correctedAt);
  const states={preparation:'Preparation',open:future?'Planned day':date<today?'Awaiting review':'Battle open',won:'Battle won','not-won':'Battle not won'};
  return `<section class="command-premium-workspace" data-command-date="${date}"><div class="command-feedback" role="status">${escapeHtml(lifeNotice||'')}</div>
    ${n===0?'<div class="command-preparation"><div><strong>Read the promise. Prepare the first day.</strong><p>Saturday, October 10 begins the 48 counted days.</p></div><button type="button" class="primary-button" data-command-plan-first>Plan Day 1</button></div>':''}
    ${renderCommandJourney(life,date,today)}
    <div class="command-premium-grid"><section class="command-paper command-must-do"><header><h2>Today's must-do</h2><span>${result.complete} of ${result.total} complete</span></header>
    ${d.tasks.length?`<div class="command-task-list">${d.tasks.map(t=>commandTaskCard(t,life,date,future,next?.id)).join('')}</div>`:`<div class="command-empty"><span aria-hidden="true">＋</span><h3>${n===0?'Prepare your commitments':'What will you finish on this day?'}</h3><p>Your own commitments belong here. Add a task or link one from Actions.</p></div>`}
    <details id="command-add-task" class="command-add"><summary>＋ Add a commitment</summary><form id="sadhana-task-form"><label>Use an existing Actions task<select name="actionId"><option value="">Create a new shared task</option>${actions.map(a=>`<option value="${escapeHtml(a.id)}">${escapeHtml(a.title)}</option>`).join('')}</select></label><label>My commitment<input name="title" maxlength="180" placeholder="What must be finished on this date?"></label><div class="command-form-pair"><label>Completion type<select name="kind" data-command-kind><option value="check">One completion check</option><option value="quantity">A quantity target</option></select></label><label class="command-target-field" hidden>Quantity target<input name="target" type="number" min="1" max="100000" value="1"></label></div><button class="primary-button">Assign to this day</button></form></details>
    ${!d.planSet&&n!==0?'<button type="button" class="command-text-button" data-sadhana-empty>No additional must-do tasks for this day</button>':''}
    ${!next&&date===today&&commandPreviousNextStep?`<div class="command-other-work">${commandPreviousNextStep()}</div>`:''}</section>
    <section class="command-paper command-outline-panel"><header><h2>My daily outline</h2><span>${confirmed}/${items.length} confirmed</span></header><p class="command-outline-help">Tick what you kept or practised. An empty check stays unknown.</p><div class="command-premium-outline">${items.map(item=>`<article class="${d.items[item.id]||'unknown'}"><label class="command-check"><input type="checkbox" data-sadhana-item="${item.id}" ${d.items[item.id]==='kept'?'checked':''} ${future?'disabled':''}><span>${escapeHtml(item.label)}</span></label>${d.items[item.id]==='missed'?'<span class="command-missed-label">Missed</span>':''}</article>`).join('')}</div>
    <details id="command-guidance" class="command-guidance" open><summary>The rest of my promise</summary><ul>${KryosSadhana.items.filter(i=>i.type==='guidance').map(item=>`<li>${escapeHtml(item.label)}</li>`).join('')}</ul></details>
    <details id="command-missed-items" class="command-secondary-details"><summary>Record an item not kept or not done</summary><div class="command-missed-options">${items.map(item=>`<button type="button" data-sadhana-missed="${item.id}" ${future?'disabled':''}>${escapeHtml(item.label)}</button>`).join('')}</div></details>
    <details id="command-breach" class="command-secondary-details"><summary>Record a boundary breach</summary><form id="sadhana-breach-form"><p>Select every boundary crossed in this incident.</p><div class="sadhana-breach-options">${items.filter(i=>i.type==='boundary').map(item=>`<label class="command-check"><input type="checkbox" name="boundary" value="${item.id}" ${future?'disabled':''}><span>${escapeHtml(item.label)}</span></label>`).join('')}</div><label>What happened? <textarea name="note" maxlength="500" placeholder="Brief facts, if useful"></textarea></label><label class="command-check"><input type="checkbox" name="recovered"><span>I returned to the intended action</span></label><button class="secondary-button" ${future?'disabled':''}>Record incident</button></form></details>
    ${incidents.map(b=>`<article class="command-incident"><strong>${b.boundaries.map(id=>escapeHtml(KryosSadhana.items.find(i=>i.id===id)?.label||id)).join(' · ')}</strong>${b.note?`<p>${escapeHtml(b.note)}</p>`:''}<small>${b.recovered?'Return recorded':'Return not yet recorded'}</small><div>${!b.recovered?`<button type="button" data-sadhana-recover="${escapeHtml(b.id)}">I returned to action</button>`:''}<button type="button" data-sadhana-breach-correct="${escapeHtml(b.id)}">Correct mistaken incident</button></div></article>`).join('')}</section></div>
    <section class="command-battle ${result.status}" aria-label="Daily battle"><div><p class="section-kicker">TODAY'S BATTLE</p><h2 role="status">${states[result.status]}</h2><p>${n===0?'Preparation has no win/loss score.':`${result.complete}/${result.total} must-do tasks complete · ${confirmed}/${items.length} daily items confirmed${incidents.length?` · ${incidents.length} incident${incidents.length===1?'':'s'} recorded`:''}`}</p>${d.reviewedAt&&result.reasons.length?`<p class="command-battle-reasons">${result.reasons.map(escapeHtml).join(' · ')}</p>`:''}<small id="sadhana-sync" role="status">${escapeHtml(typeof actionSyncLabel==='function'?actionSyncLabel():'Saved on this device')}</small></div><div class="command-review-action"><button type="button" class="primary-button" data-sadhana-review ${future||n===0||date>=today?'disabled':''}>${d.reviewedAt?'Review updated evidence':'Review this day'}</button><small>${n===0?'Your first battle is October 10.':date>=today?'Review after the day ends.':'Report when free; record when it happened.'}</small></div></section>

    <details id="command-history" class="command-history"><summary>Previous Sadhana history and corrections</summary>${(life.sadhana.previousCycles||[]).map(c=>`<p>${escapeHtml(c.covenant.startDate)} – ${escapeHtml(c.covenant.endDate)} · ${c.records.length} preserved records</p>`).join('')}<p>${life.sadhana.history.length} changes recorded for this cycle.</p></details></section>`;
}
const commandPreviousJournalRenderer=renderLifeJournal;
const commandBaseCovenantRenderer=renderContainmentCovenant;
renderContainmentCovenant=function(){return commandBaseCovenantRenderer()+`<dialog id="command-correction-dialog" class="command-correction-dialog"><form id="command-correction-form"><input type="hidden" name="operation"><input type="hidden" name="recordId"><header><h2>Correct the record</h2><button type="button" data-command-close aria-label="Close correction">×</button></header><p id="command-correction-context"></p><label id="command-correction-target">Correct quantity target<input type="number" name="target" min="1" max="100000" required></label><label>Reason for this correction<textarea name="reason" maxlength="500" required></textarea></label><p id="command-correction-error" role="alert"></p><button class="primary-button">Save correction</button></form></dialog>`;};
renderLifeJournal=function(){
  const previous=document.querySelector('.command-premium-workspace');
  if(previous)commandOpenPanels=new Set([...previous.querySelectorAll('details[open][id]')].map(el=>el.id));
  const previousDate=previous?.dataset.commandDate;
  const drafts=commandFormDrafts.get(previousDate)||{};
  previous?.querySelectorAll('form[id]').forEach(form=>{if(form.id===commandSubmittedForm&&lifeNotice.startsWith('Saved on this device.'))delete drafts[form.id];else drafts[form.id]=[...new FormData(form).entries()];});
  if(previousDate)commandFormDrafts.set(previousDate,drafts);
  commandSubmittedForm='';
  const active=document.activeElement;let selector=null;
  if(active?.id==='sadhana-date')selector='#sadhana-date';
  else if(active?.dataset)for(const attr of ['sadhanaItem','sadhanaTask','sadhanaCount','commandStep'])if(active.dataset[attr]){const dashed=attr.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());selector=`[data-${dashed}="${CSS.escape(active.dataset[attr])}"]${active.dataset.taskId?`[data-task-id="${CSS.escape(active.dataset.taskId)}"]`:''}`;break;}
  const y=window.scrollY,main=document.querySelector('#app'),scrollTop=main?.scrollTop||0;
  commandPreviousJournalRenderer();
  document.querySelector('.command-premium-workspace')?.querySelectorAll('details[id]').forEach(el=>el.open=commandOpenPanels.has(el.id));
  const restored=commandFormDrafts.get(sadhanaSelected())||{};
  for(const [id,entries] of Object.entries(restored)){const form=document.getElementById(id);if(!form)continue;for(const element of form.elements){if(!element.name)continue;const values=entries.filter(([name])=>name===element.name).map(([,value])=>value);if(element.type==='checkbox')element.checked=values.includes(element.value);else if(values.length)element.value=values[0];}const target=form.querySelector('.command-target-field');if(target)target.hidden=form.elements.kind.value!=='quantity';}
  if(previous)requestAnimationFrame(()=>{window.scrollTo({top:y,behavior:'instant'});if(main)main.scrollTop=scrollTop;if(selector)document.querySelector(selector)?.focus({preventScroll:true});});
};
document.addEventListener('change',event=>{if(event.target.matches('[data-command-kind]'))event.target.closest('form').querySelector('.command-target-field').hidden=event.target.value!=='quantity';});
document.addEventListener('submit',event=>{if(event.target.closest('.command-premium-workspace'))commandSubmittedForm=event.target.id;},true);
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-sadhana-correct],[data-sadhana-breach-correct]');if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  const dialog=document.querySelector('#command-correction-dialog'),form=dialog.querySelector('form');form.reset();
  const isTask=!!button.dataset.sadhanaCorrect,recordId=button.dataset.sadhanaCorrect||button.dataset.sadhanaBreachCorrect;
  form.elements.operation.value=isTask?'task.correct':'breach.correct';form.elements.recordId.value=recordId;
  const task=isTask?KryosSadhana.day(sadhanaLife(),sadhanaSelected()).tasks.find(t=>t.id===recordId):null;
  document.querySelector('#command-correction-target').hidden=!isTask;
  form.elements.target.required=isTask;form.elements.target.disabled=!isTask;
  if(task)form.elements.target.value=task.target;
  document.querySelector('#command-correction-context').textContent=task?task.title:'Correct a mistaken incident. The original record remains in history.';
  document.querySelector('#command-correction-error').textContent='';dialog.showModal();form.elements.reason.focus();
},true);
document.addEventListener('click',event=>{if(event.target.closest('[data-command-close]'))event.target.closest('dialog').close();});
document.addEventListener('submit',event=>{if(event.target.id!=='command-correction-form')return;event.preventDefault();const f=new FormData(event.target),type=f.get('operation');try{sadhanaMutate({type,taskId:type==='task.correct'?f.get('recordId'):undefined,breachId:type==='breach.correct'?f.get('recordId'):undefined,target:Number(f.get('target')),reason:f.get('reason')});}catch(error){document.querySelector('#command-correction-error').textContent=error.message;}});
document.addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  if(el.hasAttribute('data-command-plan-first')){sadhanaDate=KryosSadhana.cycle.startDate;renderLifeJournal();const panel=document.querySelector('#command-add-task');if(panel){panel.open=true;panel.querySelector('input[name="title"]')?.focus();}}
  if(el.dataset.commandStep){const task=KryosSadhana.day(sadhanaLife(),sadhanaSelected()).tasks.find(t=>t.id===el.dataset.taskId);if(!task)return;try{sadhanaMutate({type:'task.progress',taskId:task.id,value:Math.max(0,Math.min(100000,(task.progress?.value||0)+Number(el.dataset.commandStep)))});}catch(error){lifeNotice=error.message;renderLifeJournal();}}
});
