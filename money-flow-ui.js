/* Money presentation only. No ledger calculations, rewards or storage writes. */
if(typeof KryosUI!=='undefined')KryosUI.claim('money.view','money-flow-ui.js',["money-flow-ui.css","money.css"]);
function moneyFlowNavigationMarkup(sections){
 return '<nav class="money-flow-navigation" aria-label="Money sections"><p class="section-kicker">FIND WHAT YOU NEED</p><div>'+sections.map(s=>'<button type="button" class="secondary-button" data-money-section="'+escapeHtml(s.id)+'">'+escapeHtml(s.title)+'</button>').join('')+'</div></nav>';
}
const moneyFlowOriginalRenderer=renderMoneyView;
function moneyFlowNextModel(configured,settled,follow,nextDate){
 if(!configured)return {title:'Set a verified baseline',note:'Use the existing setup form to record the starting amount.',dialog:'setup',label:'Set baseline'};
 if(settled)return {title:'Recorded balance is settled',note:'Review the dated history or record a new verified event when needed.',dialog:'contact',label:'Record contact'};
 return {title:follow.action,note:'Current follow-up: '+nextDate+' · '+follow.label+'. This schedule uses today, independent of the selected entry date.',dialog:'contact',label:'Log contact'};
}
function moneyFlowNextMarkup(model){return '<section class="money-next-action" aria-label="Current money next action"><div><p class="section-kicker">ONE CURRENT NEXT ACTION</p><h2>'+escapeHtml(model.title)+'</h2><p>'+escapeHtml(model.note)+'</p></div><button type="button" class="primary-button" data-money-open="'+model.dialog+'">'+escapeHtml(model.label)+'</button></section>';}
function moneyFlowDatedMarkup(store,date){
 const contacts=(store.contacts||[]).filter(r=>r.date===date),payments=(store.payments||[]).filter(r=>r.date===date),ledger=(store.ledgerEvents||[]).filter(r=>r.date===date&&!r.voidedAt);
 return '<details class="money-dated-records"><summary>'+escapeHtml(date)+' · '+contacts.length+' contacts · '+payments.length+' received payments · '+ledger.length+' ledger entries</summary><p>Recorded events for the selected day. The current balance above includes all saved dates.</p>'+contacts.map(r=>'<article><time>'+escapeHtml(r.date)+'</time><strong>'+escapeHtml(r.method+' · '+r.outcome)+'</strong><p>'+escapeHtml(r.note||'No additional note')+'</p></article>').join('')+payments.map(r=>'<article><time>'+escapeHtml(r.date)+'</time><strong>Payment received · '+escapeHtml(moneyAmount(r.amountCents))+'</strong><p>'+escapeHtml(r.note||'No additional note')+'</p></article>').join('')+ledger.map(r=>'<article><time>'+escapeHtml(r.date)+'</time><strong>'+escapeHtml(r.type)+' · '+escapeHtml(moneyAmount(r.amountCents))+'</strong><p>'+escapeHtml(r.note||'Recorded ledger event')+'</p></article>').join('')+(!contacts.length&&!payments.length&&!ledger.length?'<p>No contact or received payment recorded for this day.</p>':'')+'</details>';
}
renderMoneyView=function(){
 moneyFlowOriginalRenderer();
 if(!moneyView)return;
 const sections=[...moneyView.querySelectorAll('.money-surface')].map((panel,index)=>{
 const heading=panel.querySelector('h2');if(!heading)return null;
 const id='money-reading-section-'+index;panel.id=id;heading.tabIndex=-1;
 return {id,title:panel.querySelector('.section-kicker')?.textContent||heading.textContent};
 }).filter(Boolean);
 const header=moneyView.querySelector('.money-command,.money-premium-heading');
 if(header){
 const model=moneyFlowNextModel(moneyView.dataset.currentResponsibility==='true'||Number(moneyStore().responsibility.baselineOwedCents)>0,moneyView.dataset.currentBalanceSettled?moneyView.dataset.currentBalanceSettled==='true':Number(moneyView.dataset.currentOwedCents)<=0,moneyContactStatus(),moneyNextFollowUp());
 const existing=moneyView.querySelector('.money-next-action');
 if(existing){existing.querySelector('h2').textContent=model.title;existing.querySelector('h2').insertAdjacentHTML('afterend','<p class="money-current-scope">'+escapeHtml(model.note)+'</p>');}
 else header.insertAdjacentHTML('afterend',moneyFlowNextMarkup(model));
 if(header.classList.contains('money-premium-heading'))header.insertAdjacentHTML('afterend','<p class="money-current-scope">Current ledger positions include all saved dates. Historical checkpoints keep their own verification dates.</p>');
 const amount=header.querySelector('.money-command-stat>span');if(amount)amount.textContent='Current amount owed · all saved dates';
 const tools=header.querySelector('.money-primary-actions');if(tools){const more=document.createElement('details');more.className='money-record-tools';more.innerHTML='<summary>Other record types</summary>';tools.before(more);more.append(tools);}
 }
 const anchor=moneyView.querySelector('.money-next-action')||header;
 if(anchor&&typeof moneyEntryDate==='function')anchor.insertAdjacentHTML('beforebegin','<p class="money-date-context">New records default to '+escapeHtml(moneyEntryDate())+'. Balances and account status show the current position.</p>');
 if(anchor&&sections.length)anchor.insertAdjacentHTML('afterend',moneyFlowNavigationMarkup(sections));
 if(anchor&&typeof moneyEntryDate==='function')anchor.insertAdjacentHTML('afterend',moneyFlowDatedMarkup(moneyStore(),moneyEntryDate()));
 const grid=moneyView.querySelector('.money-contact-grid');
 if(grid){grid.setAttribute('role','img');grid.setAttribute('aria-label','Contact history: '+[...grid.querySelectorAll('[title]')].map(c=>c.title).join('; '));}
};
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-money-section]');if(!button)return;
 const panel=document.getElementById(button.dataset.moneySection);if(!panel)return;
 panel.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 panel.querySelector('h2')?.focus({preventScroll:true});
});
if(typeof moneyView!=='undefined'&&moneyView&&!moneyView.classList.contains('is-hidden'))renderMoneyView();
