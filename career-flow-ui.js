/* Career reading and navigation only. Curriculum, check IDs and persistence stay in the existing owners. */
function careerFlowMetrics(roadmap){
 const overall=careerCoreProgress(roadmap);
 const modules=(roadmap?.modules||[]).map(m=>({id:m.id,title:m.title,...careerCoreProgress({modules:[m]})}));
 return {overall,modules,finished:modules.filter(m=>m.total>0&&m.done===m.total).length};
}
function careerFlowProgressMarkup(roadmap){
 const {overall,modules,finished}=careerFlowMetrics(roadmap);
 return `<div class="career-flow-progress"><p class="section-kicker">RECORDED CORE COVERAGE</p><strong>${overall.done}<small> / ${overall.total} steps</small></strong><progress max="${Math.max(1,overall.total)}" value="${overall.done}" aria-label="Completed core steps for ${escapeHtml(roadmap.title)}"></progress><span>${finished} / ${modules.length} modules complete</span><small>Completion records coverage—not a claim of mastery.</small></div>`;
}
function careerFlowModulePicker(roadmap){
 const {modules}=careerFlowMetrics(roadmap);
 return `<section class="career-flow-navigation"><div><p class="section-kicker">YOUR ROADMAP</p><h2>Learn. Practise. Explain.</h2><p>Open a module for its full context. Optional practice stays separate.</p></div><label>Jump to a module<select data-career-flow-module><option value="">Choose module context</option>${modules.map((m,index)=>`<option value="${escapeHtml(m.id)}">${index+1}. ${escapeHtml(m.title)} · ${m.done}/${m.total} core steps</option>`).join('')}</select></label><button type="button" class="secondary-button" data-career-flow-continue>Return to next action ↑</button></section>`;
}
const careerFlowOpenModules=new Map(),careerFlowDrafts=new Map();
const careerFlowPreviousRenderer=renderCareerView;
renderCareerView=function(){
 const old=document.querySelector('#career-view .career-studio'),oldId=old?.dataset.flowRoadmap;
 if(oldId)careerFlowOpenModules.set(oldId,new Map([...old.querySelectorAll('details.career-workflow-module')].map(d=>[d.id||d.dataset.studioLegacyModule,d.open])));
 const active=document.activeElement,checkId=active?.dataset?.careerCheck,field=active?.dataset?.workflowField,moduleId=active?.dataset?.workflowModule;
 const nextCard=!!active?.closest('.studio-next'),y=window.scrollY,main=document.querySelector('#app'),scroll=main?.scrollTop||0;
 careerFlowPreviousRenderer();
 const roadmap=findRoadmap(selectedRoadmapId),studio=document.querySelector('#career-view .career-studio');
 if(!roadmap||!studio)return;
 studio.dataset.flowRoadmap=roadmap.id;
 const hero=studio.querySelector('.studio-hero');
 if(hero){hero.querySelector('.studio-ring')?.remove();hero.insertAdjacentHTML('beforeend',careerFlowProgressMarkup(roadmap));}
 const detail=document.querySelector('#career-roadmap-detail');
 if(detail)detail.insertAdjacentHTML('beforebegin',careerFlowModulePicker(roadmap));
 const panels=careerFlowOpenModules.get(roadmap.id);
 if(panels)studio.querySelectorAll('details.career-workflow-module').forEach(d=>{const key=d.id||d.dataset.studioLegacyModule;if(panels.has(key))d.open=panels.get(key);});
 studio.querySelectorAll('[data-workflow-field]').forEach(input=>{const key=[roadmap.id,input.dataset.workflowModule,input.dataset.workflowField].join('|');if(careerFlowDrafts.has(key))input.value=careerFlowDrafts.get(key);});
 if(oldId===roadmap.id)requestAnimationFrame(()=>{if(main)main.scrollTop=scroll;window.scrollTo({top:y,behavior:'instant'});const selector=checkId?`${nextCard?'.studio-next ':''}[data-career-check="${CSS.escape(checkId)}"]`:field?`[data-workflow-field="${CSS.escape(field)}"][data-workflow-module="${CSS.escape(moduleId)}"]`:null;if(selector)studio.querySelector(selector)?.focus({preventScroll:true});});
};
document.addEventListener('input',event=>{const input=event.target;if(!input.dataset.workflowField)return;careerFlowDrafts.set([input.dataset.workflowRoadmap,input.dataset.workflowModule,input.dataset.workflowField].join('|'),input.value);});
document.addEventListener('change',event=>{
 const input=event.target;
 if(input.dataset.workflowField)careerFlowDrafts.delete([input.dataset.workflowRoadmap,input.dataset.workflowModule,input.dataset.workflowField].join('|'));
 if(!input.hasAttribute('data-career-flow-module')||!input.value)return;
 const target=document.getElementById('workflow-'+input.value)||document.querySelector(`[data-studio-legacy-module="${CSS.escape(input.value)}"]`);
 if(target){if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.querySelector('summary')?.focus({preventScroll:true});}
});
document.addEventListener('click',event=>{if(!event.target.closest('[data-career-flow-continue]'))return;const target=document.querySelector('#career-current-focus');target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target?.querySelector('input,button')?.focus({preventScroll:true});});
