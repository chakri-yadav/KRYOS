/* Guided daily review uses the same dated mutation engine as direct entry. */
(function(){
  function model(life,date,now=new Date().toISOString()){
    const copy=structuredClone(life),day=KryosCommitment.day(copy,date);
    const missing=KryosCommitment.items.filter(i=>i.type!=='guidance'&&!day.items[i.id]);
    const review=life.s\u0061dhana?.history?.filter(h=>h.date===date&&h.type==='day.review').at(-1);
    const previous=review?life.s\u0061dhana.receipts?.[review.id]?.result:null;
    const pending=!!review&&review.after.revision!==day.revision;
    let result=null,error='';
    if(day.planSet&&!missing.length&&date<KryosCommitment.today(now)&&date!==KryosCommitment.cycle.dayZero){
      try{result=KryosCommitment.apply(structuredClone(copy),{type:'day.review',expectedRevision:day.revision},date,now,'preview:'+date+':'+day.revision);}catch(e){error=e.message;}
    }
    return {day,missing,previous,pending,result,error};
  }
  window.KryosDayReview={model};
  const base=renderContainmentCovenant;
  renderContainmentCovenant=function(){
    let html=base(),date=commitmentSelected();
    if(date<KryosCommitment.cycle.dayZero||date>KryosCommitment.cycle.endDate)return html;
    const m=model(commitmentLife(),date),today=KryosCommitment.today(),preparation=date===KryosCommitment.cycle.dayZero;
    const label=preparation?'Preparation':date>=today?'In progress':m.pending?'Changes need confirmation':m.previous==='won'?'Battle won':m.previous==='not-won'?'Battle not won':'Needs review';
    const start=html.indexOf('<section class="command-battle '),end=html.indexOf('</section>',start);
    if(start>=0&&end>=0)html=html.slice(0,start)+`<section class="command-battle ${m.pending?'open':m.previous||'open'}"><div><p class="section-kicker">${escapeHtml(commandDateLabel(date))}</p><h2 role="status">${label}</h2><p>${m.pending?'Your edits are saved. Confirm the revised result after checking the facts.':m.previous?'This day has a confirmed result. You can review and correct its records.':'Review your commitments and daily requirements. KRYOS will explain the result.'}</p>${m.pending&&m.previous?`<small>Previous confirmed result: ${m.previous==='won'?'Battle won':'Battle not won'}</small>`:''}<small>${escapeHtml(actionSyncLabel())}</small></div><div><button class="primary-button" type="button" data-guided-review ${preparation||date>=today?'disabled':''}>${m.previous?'Review this day again':'Review this day'}</button><small>${preparation?'Preparation has no battle result.':date>=today?'Available after this day ends.':'Late entry belongs to the day it happened.'}</small></div></section>`+html.slice(end+10);
    return html;
  };
  const baseJourney=commandJourneyModel;
  commandJourneyModel=function(life,today){return baseJourney(life,today).map(d=>d.date<today&&model(life,d.date).pending?{...d,state:'awaiting-review'}:d);};
  let dialog,date,step=0,previewRevision,returnFocus;
  const reviewPositionKey=date=>'kryos-review-position-v1:'+date;
  function savedStep(date){try{const value=Number(localStorage.getItem(reviewPositionKey(date)));return Number.isInteger(value)&&value>=0&&value<=2?value:0;}catch{return 0;}}
  function close(){dialog?.close();returnFocus?.focus();}
  window.addEventListener?.('kryos:day-changed',()=>{if(dialog?.open&&kryosSelectedDate()!==date)close();});
  function draw(){
    try{localStorage.setItem(reviewPositionKey(date),String(step));}catch{}
    const life=commitmentLife(),m=model(life,date),d=m.day;
    let content='';
    if(step===0)content=`<h3>What did you complete?</h3><p>Record what happened on ${escapeHtml(commandDateLabel(date))}.</p>${d.tasks.map(t=>`<label class="day-review-row"><span>${escapeHtml(t.title)} <small>Target: ${t.target}</small></span><input aria-label="Completed amount for ${escapeHtml(t.title)}" type="number" min="0" max="${t.kind==='check'?1:100000}" value="${t.progress?.value??(KryosCommitment.taskComplete(t,life,date)?t.target:0)}" data-review-task="${escapeHtml(t.id)}"></label>`).join('')||'<p>No must-do commitments recorded for this day.</p>'}${!d.planSet?'<button type="button" data-review-empty>I had no additional must-do commitments</button><p>If commitments are missing, close this review and add what you had committed to that day.</p>':''}`;
    if(step===1)content=`<h3>Confirm your daily requirements</h3><p>Leave anything you cannot recall as “Not recorded.”</p>${KryosCommitment.items.filter(i=>i.type!=='guidance').map(i=>`<label class="day-review-row"><span>${escapeHtml(i.label)}</span><select data-review-item="${i.id}"><option value="unknown" ${!d.items[i.id]?'selected':''}>Not recorded</option><option value="kept" ${d.items[i.id]==='kept'?'selected':''}>Kept / completed</option><option value="missed" ${d.items[i.id]==='missed'?'selected':''}>Not kept / not completed</option></select></label>`).join('')}`;
    if(step===2){
      previewRevision=d.revision;
      const r=m.result,result=r?KryosCommitment.evaluate((()=>{const copy=structuredClone(life);KryosCommitment.apply(copy,{type:'day.review'},date,new Date().toISOString(),'preview-reasons:'+d.revision);return copy;})(),date):null;
      content=`<h3>${r?'Ready to confirm: '+(r.result==='won'?'Battle won':'Battle not won'):'More information needed'}</h3>${!d.planSet?'<p>Confirm the must-do plan in step 1.</p>':''}${m.missing.length?`<p>${m.missing.length} daily requirements remain unanswered.</p><ul>${m.missing.map(i=>`<li>${escapeHtml(i.label)}</li>`).join('')}</ul>`:''}${result?`<p>${result.complete}/${result.total} commitments completed · ${KryosCommitment.items.filter(i=>i.type!=='guidance').length} daily requirements answered</p>${result.reasons.length?`<p>Why this day was not won:</p><ul>${result.reasons.map(reason=>`<li>${escapeHtml(reason)}</li>`).join('')}</ul>`:'<p>All required commitments were completed and daily requirements kept. No uncorrected boundary breach is recorded.</p>'}<button class="primary-button" type="button" data-review-confirm>Confirm this day</button>`:'<p>Return to the earlier steps. Your entries are already saved; you can also finish later.</p>'}${m.error?`<p>${escapeHtml(m.error)}</p>`:''}`;
    }
    dialog.innerHTML=`<header><div><p class="section-kicker">${escapeHtml(commandDateLabel(date))} · Step ${step+1} of 3</p><h2>Review this day</h2></div><button type="button" data-review-close aria-label="Close day review">×</button></header><nav aria-label="Review steps">${['Commitments','Daily requirements','Result'].map((title,i)=>`<button type="button" data-review-step="${i}" ${i===step?'aria-current="step"':''}>${i+1}. ${title}</button>`).join('')}</nav><div class="day-review-content">${content}</div><p id="day-review-error" role="alert"></p><footer><span>Entries save as you go. The result requires confirmation.</span>${step>0?'<button type="button" data-review-back>Back</button>':''}${step<2?'<button class="primary-button" type="button" data-review-next>Continue</button>':''}</footer>`;
    dialog.querySelector('h2').setAttribute('tabindex','-1');dialog.querySelector('h2').focus();
  }
  document.addEventListener('click',e=>{
    const open=e.target.closest('[data-guided-review],[data-commitment-review]');if(!open)return;
    e.preventDefault();e.stopImmediatePropagation();date=commitmentSelected();step=savedStep(date);returnFocus=open;
    dialog=document.getElementById('day-review-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='day-review-dialog';dialog.className='day-review-dialog';dialog.setAttribute('aria-label','Review selected day');document.body.append(dialog);}
    draw();dialog.showModal();
  },true);
  document.addEventListener('click',e=>{
    if(!e.target.closest('#day-review-dialog'))return;
    const b=e.target.closest('button');if(!b)return;
    try{
      if(b.hasAttribute('data-review-close'))return close();
      if(b.hasAttribute('data-review-empty')){commitmentMutate({type:'plan.empty'},date);draw();}
      if(b.hasAttribute('data-review-step')){step=Number(b.dataset.reviewStep);draw();}
      if(b.hasAttribute('data-review-next')){step++;draw();}
      if(b.hasAttribute('data-review-back')){step--;draw();}
      if(b.hasAttribute('data-review-confirm')){commitmentMutate({type:'day.review',expectedRevision:previewRevision},date);try{localStorage.removeItem(reviewPositionKey(date));}catch{}close();}
    }catch(error){dialog.querySelector('#day-review-error').textContent=error.message;}
  });
  document.addEventListener('change',e=>{
    if(!e.target.closest('#day-review-dialog'))return;
    const el=e.target;try{if(el.dataset.reviewTask)commitmentMutate({type:'task.progress',taskId:el.dataset.reviewTask,value:Number(el.value)},date);if(el.dataset.reviewItem)commitmentMutate({type:'item.set',itemId:el.dataset.reviewItem,value:el.value},date);dialog.querySelector('#day-review-error').textContent='';}catch(error){dialog.querySelector('#day-review-error').textContent=error.message;}
  });
})();
