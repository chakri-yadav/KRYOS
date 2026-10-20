/* Actions and Rhythm presentation adapters; existing records, rules and saves remain authoritative. */
if(typeof KryosUI!=='undefined')KryosUI.claim('actions-rhythm.controls','actions-rhythm-ui.js',["actions-rhythm-ui.css","rhythm.css"]);
const activityFocusedActions=new Map();
let activityRenderedFocus=null;
function activityFocusDate(){return typeof kryosSelectedDate==='function'?kryosSelectedDate():toDateKey();}
KryosUI.renders.register('action.card','actions.next-step',{order:20,after(_view,html,action){
  if(action.status==='done'&&action.deadline)html=html.replace(/<time class="deadline-[^"]*" datetime="[^"]*">[^<]*<\/time>/,`<time class="deadline-recorded" datetime="${escapeHtml(action.deadline)}">Due ${escapeHtml(action.deadline)}</time>`);
  const copy=action.nextAction?`<p><span>Next step</span>${escapeHtml(action.nextAction)}</p>`:'';
  const next=action.nextAction?`<div class="activity-next-step"><span>SMALLEST NEXT ACTION</span><p>${escapeHtml(action.nextAction)}</p></div>`:`<button type="button" class="activity-add-next" data-action-command="edit" data-id="${escapeHtml(action.id)}">＋ Add a smallest next action</button>`;
  if(copy)html=html.replace(copy,next);else html=html.replace('</h3>','</h3>'+next);
  if(['open','waiting'].includes(action.status))html=html.replace('<div class="action-controls">',`<div class="action-controls"><button type="button" class="activity-start" data-activity-start="${escapeHtml(action.id)}">Make active →</button>`);
  if(['open','active'].includes(action.status)){
    const focused=action.id===activityRenderedFocus?.id;
    html=html.replace('<div class="action-controls">',`<div class="action-controls"><button type="button" class="activity-focus-choice" data-activity-focus="${escapeHtml(action.id)}" aria-pressed="${focused}">${focused?'◎ Your focus':'Focus on this'}</button>`);
    if(focused)html=html.replace('class="action-card ', 'class="action-card is-focused ');
  }
  return html;
}});
KryosUI.renders.register('actions','actions.focus',{order:10,capture(){
  const all=[...actionVault()].sort(actionSort),visible=all.filter(a=>actionFilter==='all'?a.status!=='archived':a.status===actionFilter);
  activityRenderedFocus=KryosDailyPresentation.focus(visible,activityFocusedActions.get(activityFocusDate()));
  const active=document.activeElement,focusedId=active?.dataset?.activityFocus;

return {focusedId};
},after({focusedId}){
  const hero=document.querySelector('#actions-view .action-next');
  if(hero){
    hero.hidden=!activityRenderedFocus;
    if(activityRenderedFocus){
      hero.querySelector('.section-kicker').textContent='YOUR FOCUS';
      hero.querySelector('h2').textContent=activityRenderedFocus.title;
      hero.querySelector('h2+p').textContent=activityRenderedFocus.nextAction||'Choose the smallest step you can do now.';
      hero.querySelectorAll('[data-action-command]').forEach(button=>{button.dataset.id=activityRenderedFocus.id;if(button.dataset.actionCommand!=='done'){button.dataset.actionCommand=activityRenderedFocus.status==='active'?'edit':'start';button.textContent=activityRenderedFocus.status==='active'?'View next step':'Start this action';}});
    }
  }
  const list=document.querySelector('#actions-view .action-list');
  if(list&&activityRenderedFocus){
    const note=document.createElement('p');note.className='activity-focus-note';note.textContent='One focus in this view · highlighting does not change status or earn points.';list.before(note);
  }
  if(focusedId){const target=document.querySelector(`[data-activity-focus="${CSS.escape(focusedId)}"]`);target?.focus({preventScroll:true});}
}});
function activityCountValue(habit,value,delta){return Math.max(0,Math.round((value+delta*(habit.step||1))*100)/100);}
function activityCycleValue(habit,value){return value>=rhythmTarget(habit)?0:Math.min(rhythmTarget(habit),activityCountValue(habit,value,1));}
KryosUI.renders.setBase('rhythm.habit','rhythm.controls',function(habit,date){
  const value=rhythmValue(habit.id,date),target=rhythmTarget(habit),done=value>=target,esc=escapeHtml;
  if(['water','\u0063\u0068\u0061\u006c\u0069\u0073\u0061','\u0061\u0064\u0069\u0074\u0079\u0061'].includes(habit.id)){
    const water=habit.id==='water',step=habit.step||1,segments=Math.ceil(target/step),next=activityCycleValue(habit,value);
    return `<button type="button" class="rhythm-item activity-cycle-row ${water?'rhythm-water':''} ${done?'is-done':''}" data-activity-cycle="${habit.id}" data-date="${date}" aria-label="${esc(habit.title)}: ${value} of ${target} ${water?'litres':'repetitions'}. ${next===0?'Reset to zero':'Record '+next+' '+(water?'litres':'repetitions')}"><span class="rhythm-item-icon">${rhythmIcon(habit.icon)}</span><span class="activity-cycle-label"><strong>${esc(habit.title)}</strong><small>${done?'✓ Complete · tap to reset':water?'Target '+target+' L · tap adds '+step+' L':'Tap anywhere to count'}</small></span>${water?`<span class="rhythm-water-track" aria-hidden="true">${Array.from({length:segments},(_,i)=>`<i class="${(i+1)*step<=value?'is-filled':''}"></i>`).join('')}</span>`:''}<b class="activity-cycle-badge">${water?value.toFixed(1)+' L':value+'/'+target}</b></button>`;
  }
  if(habit.target||habit.id==='water'){
    const water=habit.id==='water',segments=water?Math.max(1,Math.round(target/(habit.step||.5))):target;
    return `<article class="rhythm-item activity-count-tile ${done?'is-done':''}"><div class="activity-habit-title"><span class="rhythm-item-icon">${rhythmIcon(habit.icon)}</span><div><strong>${esc(habit.title)}</strong><small>${water?'Your recorded water':`${value} of ${target} repetitions`}</small></div><span class="activity-record-state">${done?'✓ Recorded':'To record'}</span></div><div class="activity-count-controls"><button type="button" data-activity-count="${habit.id}" data-date="${date}" data-delta="-1" ${value===0?'disabled':''} aria-label="Decrease ${esc(habit.title)}">−</button><label><span class="sr-only">Recorded ${esc(habit.title)} total on ${date}</span><input type="number" min="0" step="${habit.step||1}" value="${value}" data-activity-total="${habit.id}" data-date="${date}"></label><button type="button" data-activity-count="${habit.id}" data-date="${date}" data-delta="1" aria-label="Increase ${esc(habit.title)}">＋</button><span>${water?'L':'times'}</span></div><div class="activity-habit-segments" role="img" aria-label="${esc(habit.title)}: ${value} of ${target} ${water?'litres':'repetitions'}">${Array.from({length:Math.min(segments,30)},(_,i)=>`<i class="${i<value/(habit.step||1)?'filled':''}"></i>`).join('')}</div><small class="activity-target-note">Target ${target}${water?' L':''} · correcting the total never resets it automatically</small></article>`;
  }
  return `<button type="button" class="rhythm-item activity-check-tile ${done?'is-done':''}" data-rhythm-toggle="${habit.id}" data-date="${date}" aria-pressed="${done}" aria-label="${esc(habit.title)}, ${done?'recorded; click to correct':'not recorded; click to record'}"><span class="rhythm-item-icon">${rhythmIcon(done?'check':habit.icon)}</span><span><strong>${esc(habit.title)}</strong><small>${habit.cadence==='opportunity'?'Practice when done':'Daily routine'}</small></span><b>${done?'✓ Recorded':'＋ Record'}</b></button>`;
});
KryosUI.renders.setBase('rhythm.group','rhythm.controls',function(title,subtitle,habits,date,optional=false){
  const completed=habits.filter(h=>rhythmValue(h.id,date)>=rhythmTarget(h)).length;
  return `<section class="rhythm-routine-group ${optional?'is-optional':''}"><div class="rhythm-group-head"><div><span>${escapeHtml(title)}</span><p>${escapeHtml(subtitle)}</p></div><strong>${completed}/${habits.length} recorded</strong></div><div class="rhythm-item-grid">${habits.map(h=>renderRhythmHabit(h,date)).join('')}</div><p class="rhythm-group-note">Your routine stays visible. Select a recorded tile to correct it.</p></section>`;
});
let activityFeedback='',activityLastCycle=null;
KryosUI.renders.register('rhythm','rhythm.controls',{order:10,capture(){
  const scroll=document.querySelector('#app')?.scrollTop||0,y=window.scrollY;
  const active=document.activeElement,attribute=active?.dataset?.activityCycle?'activity-cycle':active?.dataset?.activityTotal?'activity-total':active?.dataset?.activityCount?'activity-count':active?.dataset?.rhythmToggle?'rhythm-toggle':null;
  const value=attribute?active.getAttribute('data-'+attribute):null;

return {scroll,y,active,attribute,value};
},after({scroll,y,active,attribute,value}){
  const header=document.querySelector('#rhythm-view .rhythm-overview');
  if(header){
    header.querySelector(':scope > div:first-of-type')?.remove();
    const label=document.createElement('label');label.className='activity-date';label.textContent='Record for date';
    const input=document.createElement('input');input.type='date';input.value=rhythmSelectedDate||toDateKey();input.dataset.activityDate='';label.append(input);header.prepend(label);
  }
  const sync=document.querySelector('#rhythm-view .rhythm-sync');if(sync){sync.textContent=actionSyncLabel();sync.setAttribute('role','status');}
  document.querySelectorAll('#rhythm-view [data-rhythm-weekly]').forEach(button=>{button.dataset.activityWeekly=button.dataset.rhythmWeekly;button.dataset.date=rhythmSelectedDate||toDateKey();delete button.dataset.rhythmWeekly;});
  const heading=document.querySelector('#rhythm-view .rhythm-main .rhythm-section-head h2');if(heading)heading.textContent='Your daily routines.';
  const coverage=document.querySelector('#rhythm-view .rhythm-main .rhythm-section-head>span');
  if(coverage){coverage.textContent='Routine coverage · not reward eligibility';coverage.title='This page records routines. Rewards applies its own qualification rules.';}
  const p=document.createElement('p');p.className='activity-feedback';p.setAttribute('role','status');p.setAttribute('aria-atomic','true');p.textContent=activityFeedback||'Tap a row to record. At the target, the next tap resets it; Undo restores the last tap.';if(activityLastCycle){const undo=document.createElement('button');undo.type='button';undo.dataset.activityUndo='';undo.textContent='Undo last tap';p.append(undo);}document.querySelector('#rhythm-view .rhythm-groups')?.before(p);
  KryosUI.renders.schedule('rhythm',()=>{const main=document.querySelector('#app');if(main)main.scrollTop=scroll;window.scrollTo({top:y,behavior:'instant'});if(attribute)document.querySelector(`[data-${attribute}="${CSS.escape(value)}"]${active?.dataset.delta?`[data-delta="${active.dataset.delta}"]`:''}`)?.focus({preventScroll:true});});
}});
KryosUI.renders.register('action.sync','rhythm.sync',{order:20,after(){const el=document.querySelector('#rhythm-view .rhythm-sync');if(el)el.textContent=actionSyncLabel();}});
document.addEventListener('click',event=>{
  const focus=event.target.closest('[data-activity-focus]');
  if(focus){const action=actionVault().find(a=>a.id===focus.dataset.activityFocus);if(action&&['open','active'].includes(action.status)){activityFocusedActions.set(activityFocusDate(),action.id);renderActionVault();}return;}
  if(event.target.closest('[data-activity-undo]')){
    const last=activityLastCycle;activityLastCycle=null;
    if(last&&rhythmValue(last.id,last.date)===last.after){rhythmSetValue(last.id,last.before,last.date);activityFeedback='Last tap undone for '+last.date+'. '+actionSyncLabel();}
    else activityFeedback='The record changed since that tap. Review the current total before correcting it.';
    renderRhythmView();if(last)document.querySelector?.('[data-activity-cycle="'+CSS.escape(last.id)+'"]')?.focus({preventScroll:true});return;
  }
  const cycle=event.target.closest('[data-activity-cycle]');
  if(cycle){const habit=rhythmHabit(cycle.dataset.activityCycle);if(!habit||!['water','\u0063\u0068\u0061\u006c\u0069\u0073\u0061','\u0061\u0064\u0069\u0074\u0079\u0061'].includes(habit.id))return;const date=cycle.dataset.date,before=rhythmValue(habit.id,date),after=activityCycleValue(habit,before);rhythmSetValue(habit.id,after,date);activityLastCycle={id:habit.id,date,before,after};activityFeedback=KryosDailyPresentation.counterFeedback(habit.title,before,after,rhythmTarget(habit),habit.id==='water'?'litres':'repetitions',date)+' '+actionSyncLabel();renderRhythmView();return;}
  const weekly=event.target.closest('[data-activity-weekly]');if(weekly){const habit=rhythmHabit(weekly.dataset.activityWeekly);if(!habit)return;rhythmSetValue(habit.id,rhythmValue(habit.id,weekly.dataset.date)+1,weekly.dataset.date);activityFeedback=habit.title+' recorded for '+weekly.dataset.date+'. '+actionSyncLabel();renderRhythmView();return;}
  const start=event.target.closest('[data-activity-start]');
  if(start){const action=actionVault().find(a=>a.id===start.dataset.activityStart);if(action){updateActionStatus(action,'active');renderActionVault();}return;}
  const control=event.target.closest('[data-activity-count]');if(!control)return;
  const habit=rhythmHabit(control.dataset.activityCount);if(!habit)return;
  const value=activityCountValue(habit,rhythmValue(habit.id,control.dataset.date),Number(control.dataset.delta));
  rhythmSetValue(habit.id,value,control.dataset.date);activityFeedback=`${habit.title}: ${value}${habit.id==='water'?' L':''} recorded for ${control.dataset.date}. ${actionSyncLabel()}`;renderRhythmView();
});
document.addEventListener('click',event=>{if(event.target.closest('[data-rhythm-toggle],[data-rhythm-date],[data-rhythm-settings]'))activityFeedback='';},true);
document.addEventListener('change',event=>{
  const input=event.target;
  if(input.hasAttribute('data-activity-date')){rhythmSelectedDate=input.value||toDateKey();activityFeedback='';activityLastCycle=null;renderRhythmView();return;}
  if(!input.dataset.activityTotal)return;
  const habit=rhythmHabit(input.dataset.activityTotal),value=Number(input.value);
  if(!habit||input.value===''||!Number.isFinite(value)||value<0){activityFeedback='Enter a non-negative recorded total.';renderRhythmView();return;}
  rhythmSetValue(habit.id,value,input.dataset.date);activityFeedback=`${habit.title}: ${value} recorded for ${input.dataset.date}. ${actionSyncLabel()}`;renderRhythmView();
});
if(typeof currentPage!=='undefined'){if(currentPage==='actions')renderActionVault();if(currentPage==='rhythm')renderRhythmView();}
