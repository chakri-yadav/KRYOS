/* Date-captured correction controller. Existing domain operations own all writes. */
(function(root){
 function session(value){return Object.freeze({...value});}
 function operation(s,fields){
  const reason=String(fields.reason||'').trim();if(!reason||reason.length>500)throw Error('Enter a reason of up to 500 characters.');
  if(s.type==='breach.correct')return {type:s.type,breachId:s.id,reason,expectedRevision:s.revision};
  const target=Number(fields.target);
  if(!Number.isInteger(target)||target<1||target>100000||(s.kind==='check'&&target!==1))throw Error(s.kind==='check'?'A check task has a target of 1.':'Use a whole-number target from 1 to 100000.');
  return {type:s.type,taskId:s.id,target,reason,expectedRevision:s.revision};
 }
 let owner,dialog,current,invoker,selector,saving=false;
 function close(restore=true){
  if(dialog?.open)dialog.close();
  if(restore){const target=invoker?.isConnected?invoker:selector?document.querySelector(selector):null;for(let parent=target?.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;target?.focus({preventScroll:true});}
  current=null;
 }
 function install(config){
  if(owner)throw Error('Daily correction owner already installed.');owner=config;
  if(typeof KryosUI!=='undefined')KryosUI.claim('daily.corrections','daily-corrections.js',['daily-corrections.css']);
  document.addEventListener('click',event=>{
   const prefix=owner.prefix,button=event.target.closest('[data-'+prefix+'-correct],[data-'+prefix+'-breach-correct]');if(!button)return;
   event.preventDefault();event.stopImmediatePropagation();
   const date=owner.getDate(),day=owner.getDay(date),taskId=button.getAttribute('data-'+prefix+'-correct'),id=taskId||button.getAttribute('data-'+prefix+'-breach-correct');
   const record=taskId?day.tasks.find(t=>t.id===id):day.breaches.find(b=>b.id===id&&!b.correctedAt);
   if(!record)return;
   invoker=button;selector='[data-'+prefix+(taskId?'-correct':'-breach-correct')+'="'+CSS.escape(id)+'"]';
   current=session({date,revision:day.revision,type:taskId?'task.correct':'breach.correct',id,kind:record.kind,target:record.target,requestId:crypto.randomUUID()});
   if(!dialog){
    dialog=document.createElement('dialog');dialog.id='command-correction-dialog';dialog.className='daily-correction-dialog';
    dialog.setAttribute('aria-labelledby','daily-correction-title');document.body.append(dialog);
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
   }
   dialog.innerHTML='<form id="command-correction-form" novalidate><header><div><p id="daily-correction-date" class="section-kicker"></p><h2 id="daily-correction-title">Correct the record</h2></div><button type="button" data-correction-close aria-label="Close correction">×</button></header><p id="command-correction-context"></p><p id="daily-correction-original"></p><label id="command-correction-target">Corrected target<input type="number" name="target" min="1" max="100000" step="1"></label><label>Reason for this correction<textarea name="reason" maxlength="500" required rows="3"></textarea></label><p id="daily-correction-impact"></p><p id="command-correction-error" role="alert"></p><button type="button" data-correction-refresh hidden>Load latest record</button><footer><button type="button" data-correction-close class="secondary-button">Cancel</button><button type="submit" class="primary-button">Save correction</button></footer></form>';
   dialog.querySelector('#daily-correction-date').textContent=owner.label(date)+' · changes belong to this date';
   const form=dialog.querySelector('form'),target=form.elements.target;
   dialog.querySelector('#command-correction-target').hidden=!taskId;target.disabled=!taskId;
   if(taskId){
    target.value=record.target;target.readOnly=record.kind==='check';
    dialog.querySelector('#command-correction-context').textContent=record.title;
    dialog.querySelector('#daily-correction-original').textContent='Original target: '+record.target+' · Recorded amount: '+(record.progress?.value||0);
    dialog.querySelector('#daily-correction-impact').textContent='Linked task completion will be recalculated. A reviewed result will need confirmation.';
   }else{
    const labels=record.boundaries.map(id=>owner.items.find(i=>i.id===id)?.label||id);
    dialog.querySelector('#command-correction-context').textContent=labels.join(' · ');
    dialog.querySelector('#daily-correction-original').textContent='Recorded incident: '+(record.note||'No additional note.');
    dialog.querySelector('#daily-correction-impact').textContent='Use this only for a mistaken incident. The original stays in history; affected requirements may need an answer again.';
   }
   dialog.showModal();form.elements.reason.focus();
  },true);
  document.addEventListener('click',event=>{
   if(event.target.closest('#command-correction-dialog [data-correction-close]')){close();return;}
   if(!event.target.closest('#command-correction-dialog [data-correction-refresh]')||!current)return;
   if(owner.getDate()!==current.date){close(false);return;}
   const day=owner.getDay(current.date),record=current.type==='task.correct'?day.tasks.find(t=>t.id===current.id):day.breaches.find(b=>b.id===current.id&&!b.correctedAt);
   if(!record){dialog.querySelector('#command-correction-error').textContent='This record is no longer available. Cancel and review this day.';return;}
   current=session({...current,revision:day.revision,requestId:crypto.randomUUID()});
   dialog.querySelector('#daily-correction-original').textContent=current.type==='task.correct'?'Latest target: '+record.target+' · Recorded amount: '+(record.progress?.value||0):'Recorded incident: '+(record.note||'No additional note.');
   dialog.querySelector('#command-correction-error').textContent='';
   dialog.querySelector('[data-correction-refresh]').hidden=true;dialog.querySelector('textarea').focus();
  });
  document.addEventListener('submit',event=>{
   if(event.target.id!=='command-correction-form'||!current)return;event.preventDefault();if(saving)return;
   const form=event.target,error=form.querySelector('#command-correction-error');
   try{
    if(owner.getDate()!==current.date){close(false);return;}
    if(owner.getDay(current.date).revision!==current.revision){dialog.querySelector('[data-correction-refresh]').hidden=false;throw Error('This day changed while you were editing. Your draft is preserved. Load the latest record, review it and save again.');}
    const op=operation(current,{reason:form.elements.reason.value,target:form.elements.target.value});
    saving=true;form.querySelector('[type="submit"]').disabled=true;
    owner.mutate(op,current.date,current.requestId);close();
   }catch(e){error.textContent=e.message;form.querySelector('[type="submit"]').disabled=false;}
   finally{saving=false;}
  });
  window.addEventListener('kryos:day-changed',()=>{if(current&&owner.getDate()!==current.date)close(false);});
  for(const event of ['popstate','hashchange'])window.addEventListener(event,()=>{if(current)close(false);});
 }
 root.KryosDailyCorrections={session,operation,install};
 if(typeof module==='object'&&module.exports)module.exports={session,operation};
})(globalThis);
