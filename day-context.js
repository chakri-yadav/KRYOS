/* Shared viewing date. The operating clock always remains independent. */
(function(root){
  function createDayContext({today,load=()=>null,save=()=>{}}){
    const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
    let stored;try{stored=load();}catch{}
    let pinned=stored?.mode!=='today'&&valid(stored?.selectedDate)?stored.selectedDate:null;
    const listeners=new Set();
    const get=()=>{const currentDate=today(),selectedDate=pinned||currentDate;return {selectedDate,currentDate,timezone:'America/Chicago',mode:pinned?'date':'today',isHistory:selectedDate<currentDate,isFuture:selectedDate>currentDate};};
    function set(date,{followToday=false}={}){if(!followToday&&!valid(date))throw new Error('Choose a valid date.');pinned=followToday?null:date;const state=get();try{save(state);}catch{}listeners.forEach(fn=>fn(state));return state;}
    return {get,set,today:()=>set(null,{followToday:true}),subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
  }
  root.createKryosDayContext=createDayContext;
  if(typeof module!=='undefined')module.exports={createDayContext};
  if(typeof document==='undefined')return;
  const context=createDayContext({today:()=>toDateKey(),load:()=>JSON.parse(localStorage.getItem('kryos-day-context-v1')||'null'),save:value=>localStorage.setItem('kryos-day-context-v1',JSON.stringify(value))});
  root.KryosDayContext=context;
  root.kryosSelectedDate=()=>context.get().selectedDate;
  function connect(){const date=context.get().selectedDate;selectedTaskDate=date;selectedJournalDate=date;lifeSelectedDate=date;rhythmSelectedDate=date;rewardSelectedDate=date;commitmentDate=date;}
  commitmentSelected=()=>context.get().selectedDate;
  const previousCovenant=renderContainmentCovenant;
  renderContainmentCovenant=function(){const date=context.get().selectedDate;return date<KryosCommitment.cycle.dayZero||date>KryosCommitment.cycle.endDate?'<section class="command-paper"><h2>No battle in this cycle for the selected day</h2><p>Choose a day within the 48-day cycle to review its battle. Other dated records remain available.</p></section>':previousCovenant();};
  function paint(){
    let bar=document.getElementById('shared-day-context');
    if(!bar){bar=document.createElement('section');bar.id='shared-day-context';bar.className='shared-day-context';bar.setAttribute('aria-label','Selected day across personal pages');document.querySelector('.topbar')?.after(bar);}
    bar.hidden=currentPage==='marketing';if(bar.hidden)return;
    const state=context.get(),date=state.selectedDate,label=new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long',month:'long',day:'numeric',year:'numeric'});
    bar.innerHTML=`<div><strong>${state.isHistory?'Reviewing':state.isFuture?'Planning':'Today'} · ${label}</strong><small>Personal pages share this date</small></div><div class="shared-day-controls"><button type="button" data-shared-day-step="-1" aria-label="Previous day">‹</button><label><span class="sr-only">Choose a day</span><input type="date" data-shared-day-input value="${date}" aria-label="Choose a day"></label><button type="button" data-shared-day-step="1" aria-label="Next day">›</button><button type="button" data-shared-day-today>Today</button></div>`;
  }
  const previousRender=render;
  render=function(){connect();previousRender();paint();};
  context.subscribe(()=>{connect();render();window.dispatchEvent(new CustomEvent('kryos:day-changed',{detail:context.get()}));});
  document.addEventListener('change',event=>{
    if(currentPage==='marketing')return;
    const el=event.target;
    if(el.matches('[data-shared-day-input],#commitment-date,#reward-v5-date,#reward-date,[data-activity-date],[data-task-selected-date],[data-journal-selected-date]')){
      event.stopImmediatePropagation();if(el.value)context.set(el.value);
    }
  },true);
  document.addEventListener('click',event=>{
    if(currentPage==='marketing')return;
    const el=event.target.closest('[data-shared-day-step],[data-shared-day-today],[data-commitment-day],[data-commitment-open],[data-rhythm-date],[data-life="day"],[data-journal-open-date]');if(!el)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(el.hasAttribute('data-shared-day-today'))context.today();
    else if(el.dataset.sharedDayStep){const d=new Date(context.get().selectedDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+Number(el.dataset.sharedDayStep));context.set(d.toISOString().slice(0,10));}
    else {context.set(el.dataset.commitmentDay||el.dataset.commitmentOpen||el.dataset.rhythmDate||el.dataset.journalOpenDate||el.dataset.date);if(el.dataset.commitmentOpen||el.dataset.journalOpenDate)setPage('journal');}
  },true);
  let lastCurrent=context.get().currentDate;
  setInterval(()=>{const state=context.get();if(state.currentDate!==lastCurrent){lastCurrent=state.currentDate;if(state.mode==='today'&&currentPage!=='marketing')render();else paint();}},30000);
  connect();paint();
})(globalThis);
