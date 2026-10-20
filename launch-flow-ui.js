/* Presentation only: existing logs, targets and persistence remain authoritative. */
if(typeof KryosUI!=='undefined')KryosUI.claim('launch.view','launch-flow-ui.js',["launch-flow-ui.css"]);
const launchFlowChoices=new Map();
function launchFlowChoice(market,preferred){return ['market','mock','speaking'].includes(preferred)?preferred:market?'mock':'market';}
function launchFlowScope(date){return JSON.stringify([typeof accountMode==='string'?accountMode:'personal',typeof syncState!=='undefined'?syncState.userId||'device':'device',date]);}
function launchFlowFocusMarkup(date, market, rehearsal, preferred) {
 const choice=launchFlowChoice(market,preferred),titles={market:'Begin with one real market action.',mock:'Keep your speaking practice moving.',speaking:'Explain one idea aloud.'},labels={market:'Record a market action',mock:'Record a rehearsal',speaking:'Record speaking practice'};
 return '<section class="launch-flow-focus" aria-label="Next Launch action"><div><p class="section-kicker">ONE USEFUL STEP</p><h2>'+titles[choice]+'</h2><p>'+market+' market actions · '+rehearsal+' rehearsals recorded for '+escapeHtml(date)+'. Logs are evidence, not a measure of your worth.</p><div class="launch-flow-choices" role="group" aria-label="Choose your next Launch action">'+[['market','Market action'],['mock','Mock interview'],['speaking','Speak aloud']].map(([id,label])=>'<button type="button" class="secondary-button" data-launch-flow-choice="'+id+'" aria-pressed="'+(id===choice)+'">'+label+'</button>').join('')+'</div><small class="launch-flow-note">Choose a focus, then record only what you actually did. Speaking uses the existing self-rehearsal record.</small><button type="button" class="launch-flow-evidence" data-launch-flow-evidence>Application counts & source for this date ↓</button></div><div><button type="button" class="primary-button" data-launch-open="'+(choice==='market'?'market':'mock')+'" '+(choice==='speaking'?'data-launch-flow-speaking':'')+'>'+labels[choice]+'</button><button type="button" class="secondary-button" data-marketing-open>Open Marketing →</button></div></section>';
}
KryosUI.renders.register('launch','launch.focus',{order:10,after(){

 if(!launchView)return;
 const command=launchView.querySelector('.launch-command');
if(command){const date=launchActivityDate();command.insertAdjacentHTML('afterend',launchFlowFocusMarkup(date,launchIntegratedCount(date),launchMocksOn(date).length,launchFlowChoices.get(launchFlowScope(date))));}
 launchView.querySelectorAll('[data-launch-platform]').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('checked'))));
 launchView.querySelectorAll('.launch-heatmap i[title]').forEach(cell=>{cell.setAttribute('tabindex','0');cell.setAttribute('role','img');cell.setAttribute('aria-label',cell.title);});
}});
if(typeof document!=='undefined')document.addEventListener('click',event=>{
 const choice=event.target.closest('[data-launch-flow-choice]');if(choice){const value=choice.dataset.launchFlowChoice;if(!['market','mock','speaking'].includes(value))return;launchFlowChoices.set(launchFlowScope(launchActivityDate()),value);renderLaunchView();document.querySelector(`[data-launch-flow-choice="${value}"]`)?.focus({preventScroll:true});return;}
 if(event.target.closest('[data-launch-flow-speaking]')){event.preventDefault();event.stopImmediatePropagation();launchOpenDialog('mock');const form=document.querySelector('#launch-form');if(form){form.elements.mode.value='self';if(!form.elements.focus.value)form.elements.focus.value='Speaking practice';}return;}
 if(event.target.closest('[data-launch-flow-evidence]')){const section=document.querySelector('#launch-view .marketing-integration');if(section){section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});const heading=section.querySelector('h2');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}}
},true);
if(typeof currentPage!=='undefined'&&currentPage==='launch')renderLaunchView();
