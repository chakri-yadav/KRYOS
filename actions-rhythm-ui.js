/* Actions and Rhythm presentation adapters; existing records, rules and saves remain authoritative. */
const activityPreviousActionCard=renderActionCard;
renderActionCard=function(action){
  let html=activityPreviousActionCard(action);
  const copy=action.nextAction?`<p><span>Next step</span>${escapeHtml(action.nextAction)}</p>`:'';
  const next=action.nextAction?`<div class="activity-next-step"><span>SMALLEST NEXT ACTION</span><p>${escapeHtml(action.nextAction)}</p></div>`:`<button type="button" class="activity-add-next" data-action-command="edit" data-id="${escapeHtml(action.id)}">＋ Add a smallest next action</button>`;
  if(copy)html=html.replace(copy,next);else html=html.replace('</h3>','</h3>'+next);
  if(['open','waiting'].includes(action.status))html=html.replace('<div class="action-controls">',`<div class="action-controls"><button type="button" class="activity-start" data-activity-start="${escapeHtml(action.id)}">Make active →</button>`);
  return html;
};
function activityCountValue(habit,value,delta){return Math.max(0,Math.round((value+delta*(habit.step||1))*100)/100);}
function activityCycleValue(habit,value){return value>=rhythmTarget(habit)?0:Math.min(rhythmTarget(habit),activityCountValue(habit,value,1));}
renderRhythmHabit=function(habit,date){
  const value=rhythmValue(habit.id,date),target=rhythmTarget(habit),done=value>=target,esc=escapeHtml;
  if(['water','\u0063\u0068\u0061\u006c\u0069\u0073\u0061','\u0061\u0064\u0069\u0074\u0079\u0061'].includes(habit.id)){
    const water=habit.id==='water',step=habit.step||1,segments=Math.ceil(target/step),next=activityCycleValue(habit,value);
    return `<button type="button" class="rhythm-item activity-count-tile activity-cycle-tile ${done?'is-done':''}" data-activity-cycle="${habit.id}" data-date="${date}" aria-label="${esc(habit.title)}: ${value} of ${target} ${water?'litres':'repetitions'}. ${next===0?'Reset to zero':'Record '+next+' '+(water?'litres':'repetitions')}"><span class="activity-habit-title"><span class="rhythm-item-icon">${rhythmIcon(habit.icon)}</span><span><strong>${esc(habit.title)}</strong><small>${water?'Water intake':'Daily repetitions'}</small></span><span class="activity-record-state">${done?'✓ Complete':'Tap to record'}</span></span><span class="activity-cycle-total"><strong>${value}</strong><span>/ ${target} ${water?'L':'rounds'}</span></span><span class="activity-habit-segments" aria-hidden="true">${Array.from({length:segments},(_,i)=>`<i class="${(i+1)*step<=value?'filled':''}"></i>`).join('')}</span><span class="activity-target-note">${next===0?'Tap again to reset · Undo available':water?'Each tap adds '+step+' L':'Tap once for the next repetition'}</span></button>`;
  }
  if(habit.target||habit.id==='water'){
    const water=habit.id==='water',segments=water?Math.max(1,Math.round(target/(habit.step||.5))):target;
    return `<article class="rhythm-item activity-count-tile ${done?'is-done':''}"><div class="activity-habit-title"><span class="rhythm-item-icon">${rhythmIcon(habit.icon)}</span><div><strong>${esc(habit.title)}</strong><small>${water?'Your recorded water':`${value} of ${target} repetitions`}</small></div><span class="activity-record-state">${done?'✓ Recorded':'To record'}</span></div><div class="activity-count-controls"><button type="button" data-activity-count="${habit.id}" data-date="${date}" data-delta="-1" ${value===0?'disabled':''} aria-label="Decrease ${esc(habit.title)}">−</button><label><span class="sr-only">Recorded ${esc(habit.title)} total on ${date}</span><input type="number" min="0" step="${habit.step||1}" value="${value}" data-activity-total="${habit.id}" data-date="${date}"></label><button type="button" data-activity-count="${habit.id}" data-date="${date}" data-delta="1" aria-label="Increase ${esc(habit.title)}">＋</button><span>${water?'L':'times'}</span></div><div class="activity-habit-segments" role="img" aria-label="${esc(habit.title)}: ${value} of ${target} ${water?'litres':'repetitions'}">${Array.from({length:Math.min(segments,30)},(_,i)=>`<i class="${i<value/(habit.step||1)?'filled':''}"></i>`).join('')}</div><small class="activity-target-note">Target ${target}${water?' L':''} · correcting the total never resets it automatically</small></article>`;
  }
  return `<button type="button" class="rhythm-item activity-check-tile ${done?'is-done':''}" data-rhythm-toggle="${habit.id}" data-date="${date}" aria-pressed="${done}" aria-label="${esc(habit.title)}, ${done?'recorded; click to correct':'not recorded; click to record'}"><span class="rhythm-item-icon">${rhythmIcon(done?'check':habit.icon)}</span><span><strong>${esc(habit.title)}</strong><small>${habit.cadence==='opportunity'?'Practice when done':'Daily routine'}</small></span><b>${done?'✓ Recorded':'＋ Record'}</b></button>`;
};
renderRhythmGroup=function(title,subtitle,habits,date,optional=false){
  const completed=habits.filter(h=>rhythmValue(h.id,date)>=rhythmTarget(h)).length;
  return `<section class="rhythm-routine-group ${optional?'is-optional':''}"><div class="rhythm-group-head"><div><span>${escapeHtml(title)}</span><p>${escapeHtml(subtitle)}</p></div><strong>${completed}/${habits.length} recorded</strong></div><div class="rhythm-item-grid">${habits.map(h=>renderRhythmHabit(h,date)).join('')}</div><p class="rhythm-group-note">Your routine stays visible. Select a recorded tile to correct it.</p></section>`;
};
let activityFeedback='',activityLastCycle=null;
const activityPreviousRhythm=renderRhythmView;
renderRhythmView=function(){
  const scroll=document.querySelector('#app')?.scrollTop||0,y=window.scrollY;
  const active=document.activeElement,attribute=active?.dataset?.activityCycle?'activity-cycle':active?.dataset?.activityTotal?'activity-total':active?.dataset?.activityCount?'activity-count':active?.dataset?.rhythmToggle?'rhythm-toggle':null;
  const value=attribute?active.getAttribute('data-'+attribute):null;
  activityPreviousRhythm();
  const header=document.querySelector('#rhythm-view .rhythm-overview');
  if(header){
    header.querySelector(':scope > div:first-of-type')?.remove();
    const label=document.createElement('label');label.className='activity-date';label.textContent='Record for date';
    const input=document.createElement('input');input.type='date';input.value=rhythmSelectedDate||toDateKey();input.dataset.activityDate='';label.append(input);header.prepend(label);
  }
  const sync=document.querySelector('#rhythm-view .rhythm-sync');if(sync){sync.textContent=actionSyncLabel();sync.setAttribute('role','status');}
  document.querySelectorAll('#rhythm-view [data-rhythm-weekly]').forEach(button=>{button.dataset.activityWeekly=button.dataset.rhythmWeekly;button.dataset.date=rhythmSelectedDate||toDateKey();delete button.dataset.rhythmWeekly;});
  const heading=document.querySelector('#rhythm-view .rhythm-main .rhythm-section-head h2');if(heading)heading.textContent='Your daily routines, clearly in view.';
  if(activityFeedback){const p=document.createElement('p');p.className='activity-feedback';p.setAttribute('role','status');p.textContent=activityFeedback;if(activityLastCycle){const undo=document.createElement('button');undo.type='button';undo.dataset.activityUndo='';undo.textContent='Undo last tap';p.append(undo);}document.querySelector('#rhythm-view .rhythm-groups')?.before(p);}
  requestAnimationFrame(()=>{const main=document.querySelector('#app');if(main)main.scrollTop=scroll;window.scrollTo({top:y,behavior:'instant'});if(attribute)document.querySelector(`[data-${attribute}="${CSS.escape(value)}"]${active?.dataset.delta?`[data-delta="${active.dataset.delta}"]`:''}`)?.focus({preventScroll:true});});
};
const activityPreviousSync=updateActionSyncIndicator;
updateActionSyncIndicator=function(){activityPreviousSync();const el=document.querySelector('#rhythm-view .rhythm-sync');if(el)el.textContent=actionSyncLabel();};
document.addEventListener('click',event=>{
  if(event.target.closest('[data-activity-undo]')){
    const last=activityLastCycle;activityLastCycle=null;
    if(last&&rhythmValue(last.id,last.date)===last.after){rhythmSetValue(last.id,last.before,last.date);activityFeedback='Last tap undone for '+last.date+'. '+actionSyncLabel();}
    else activityFeedback='The record changed since that tap. Review the current total before correcting it.';
    renderRhythmView();return;
  }
  const cycle=event.target.closest('[data-activity-cycle]');
  if(cycle){const habit=rhythmHabit(cycle.dataset.activityCycle);if(!habit||!['water','\u0063\u0068\u0061\u006c\u0069\u0073\u0061','\u0061\u0064\u0069\u0074\u0079\u0061'].includes(habit.id))return;const date=cycle.dataset.date,before=rhythmValue(habit.id,date),after=activityCycleValue(habit,before);rhythmSetValue(habit.id,after,date);activityLastCycle={id:habit.id,date,before,after};activityFeedback=habit.title+': '+after+(habit.id==='water'?' L':' / '+rhythmTarget(habit))+' recorded for '+date+'. '+actionSyncLabel();renderRhythmView();return;}
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
