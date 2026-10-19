/* Career reading and navigation only. Curriculum, check IDs and persistence stay in the existing owners. */
if(typeof KryosUI!=='undefined')KryosUI.claim('career.view','career-flow-ui.js',["career-flow-ui.css","career-workflows.css"]);
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
const careerFlowContexts=new Map(),careerFlowDrafts=new Map();
function careerFlowContextKey(roadmapId){
 const workspace=typeof careerLocalSave==='function'?'laptop':'hosted',mode=typeof accountMode==='string'?accountMode:'personal';
 const profile=workspace==='hosted'&&typeof syncState!=='undefined'?(syncState.userId||'device'):'device';
 return 'kryos-career-context-v1:'+JSON.stringify([workspace,mode,profile,roadmapId]);
}
function careerFlowRead(roadmapId){
 const key=careerFlowContextKey(roadmapId);if(careerFlowContexts.has(key))return careerFlowContexts.get(key);
 try{const value=JSON.parse(localStorage.getItem(key));if(value&&typeof value==='object'&&!Array.isArray(value)){careerFlowContexts.set(key,value);return value;}}catch{}
 return {};
}
function careerFlowRemember(roadmapId,patch){
 const key=careerFlowContextKey(roadmapId),value={...careerFlowRead(roadmapId),...patch};careerFlowContexts.set(key,value);
 try{localStorage.setItem(key,JSON.stringify(value));}catch{}return value;
}
function careerFlowResume(roadmap,saved={}){
 const module=roadmap?.modules?.find(m=>m.id===saved.moduleId),topic=module?.topics?.find(t=>t.id===saved.topicId);
 return module?{module,topic:topic||null}:null;
}
function careerFlowNext(roadmap,saved={}){
 const resume=careerFlowResume(roadmap,saved);if(!resume)return null;
 const topics=resume.module.topics||[],ordered=resume.topic?[resume.topic,...topics.filter(t=>t!==resume.topic)]:topics;
 for(const topic of ordered){if(topic.optional||topic.lane==='extra'||topic.workflowLane==='extra')continue;const item=(topic.checklist||[]).find(c=>!c.done);if(item)return {module:resume.module,topic,item};}
 return null;
}
const careerFlowPreviousNext=typeof getNextCareerItem==='function'?getNextCareerItem:null;
if(careerFlowPreviousNext)getNextCareerItem=roadmap=>careerFlowNext(roadmap,careerFlowRead(roadmap?.id))||careerFlowPreviousNext(roadmap);
function careerFlowPanelId(panel){return panel.id?.replace(/^workflow-/,'')||panel.dataset.studioLegacyModule;}
function careerFlowCapture(studio){
 const id=studio?.dataset.flowRoadmap;if(!id||studio.dataset.flowScope!==careerFlowContextKey(id))return;
 const panels={},expanded={};studio.querySelectorAll('details.career-workflow-module').forEach(panel=>{const key=careerFlowPanelId(panel);panels[key]=panel.open;expanded[key]=[...panel.querySelectorAll('details')].map(d=>d.open);});
 careerFlowRemember(id,{panels,expanded});
}
function careerFlowOpenContext(roadmap,moduleId,topicId){
 const module=roadmap?.modules?.find(m=>m.id===moduleId);if(!module)return;
 const panel=document.getElementById('workflow-'+moduleId)||document.querySelector(`[data-studio-legacy-module="${CSS.escape(moduleId)}"]`);if(!panel)return;
 panel.open=true;careerFlowRemember(roadmap.id,{moduleId,topicId:topicId||null});careerFlowCapture(panel.closest('.career-studio'));
 const check=topicId?panel.querySelector(`[data-topic-id="${CSS.escape(topicId)}"][data-career-check]`):null;
 const target=check?.closest('.topic-block')||check||panel;
 for(let parent=target.parentElement;parent&&panel.contains(parent);parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});(check||panel.querySelector('summary'))?.focus({preventScroll:true});
}
const careerFlowPreviousRenderer=renderCareerView;
renderCareerView=function(){
 const old=document.querySelector('#career-view .career-studio'),oldId=old?.dataset.flowRoadmap;
 if(oldId)careerFlowCapture(old);
 const active=document.activeElement,checkId=active?.dataset?.careerCheck,field=active?.dataset?.workflowField,moduleId=active?.dataset?.workflowModule;
 const nextCard=!!active?.closest('.studio-next'),y=window.scrollY,main=document.querySelector('#app'),scroll=main?.scrollTop||0;
 careerFlowPreviousRenderer();
 const roadmap=findRoadmap(selectedRoadmapId),studio=document.querySelector('#career-view .career-studio');
 if(!roadmap||!studio)return;
 studio.dataset.flowRoadmap=roadmap.id;
 studio.dataset.flowScope=careerFlowContextKey(roadmap.id);
 // Put the actionable step ahead of the catalogue in DOM and keyboard order.
 const paths=studio.querySelector('.studio-paths'),next=studio.querySelector('.studio-next');
 if(paths&&next)studio.insertBefore(next,paths);
 const hero=studio.querySelector('.studio-hero');
 if(hero){hero.querySelector('.studio-ring')?.remove();hero.insertAdjacentHTML('beforeend',careerFlowProgressMarkup(roadmap));}
 const detail=document.querySelector('#career-roadmap-detail');
 if(detail)detail.insertAdjacentHTML('beforebegin',careerFlowModulePicker(roadmap));
 const saved=careerFlowRead(roadmap.id),panels=saved.panels||{},resume=careerFlowResume(roadmap,saved);
 studio.querySelectorAll('details.career-workflow-module').forEach(d=>{const key=careerFlowPanelId(d);if(typeof panels[key]==='boolean')d.open=panels[key];const expanded=saved.expanded?.[key];if(Array.isArray(expanded))d.querySelectorAll('details').forEach((panel,index)=>{if(typeof expanded[index]==='boolean')panel.open=expanded[index];});d.dataset.careerFlowPanel=key;});
 const nextItem=getNextCareerItem(roadmap),contextButton=studio.querySelector('.studio-context');
 if(contextButton&&nextItem){contextButton.textContent='Continue '+nextItem.topic.title;contextButton.dataset.careerFlowTopic=nextItem.topic.id;}
 const navigation=studio.querySelector('.career-flow-navigation');
 if(navigation){navigation.insertAdjacentHTML('beforeend',`<p class="career-flow-memory">Context stays in this browser only. Notes save when you leave the field; unfinished typing survives navigation, not reload.</p>${resume?`<button type="button" class="secondary-button" data-career-flow-resume>Reopen ${escapeHtml(resume.topic?.title||resume.module.title)}</button>`:''}`);}
 studio.querySelectorAll('[data-workflow-field]').forEach(input=>{const key=[careerFlowContextKey(roadmap.id),input.dataset.workflowModule,input.dataset.workflowField].join('|');if(careerFlowDrafts.has(key)){input.value=careerFlowDrafts.get(key);for(let parent=input.parentElement;parent&&studio.contains(parent);parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;}});
 if(oldId===roadmap.id)requestAnimationFrame(()=>{if(main)main.scrollTop=scroll;window.scrollTo({top:y,behavior:'instant'});const selector=checkId?`${nextCard?'.studio-next ':''}[data-career-check="${CSS.escape(checkId)}"]`:field?`[data-workflow-field="${CSS.escape(field)}"][data-workflow-module="${CSS.escape(moduleId)}"]`:null;if(selector)studio.querySelector(selector)?.focus({preventScroll:true});});
};
document.addEventListener('input',event=>{const input=event.target;if(!input.dataset.workflowField)return;careerFlowDrafts.set([careerFlowContextKey(input.dataset.workflowRoadmap),input.dataset.workflowModule,input.dataset.workflowField].join('|'),input.value);});
document.addEventListener('focusin',event=>{const input=event.target;if(input.dataset.careerCheck&&input.dataset.roadmapId)careerFlowRemember(input.dataset.roadmapId,{moduleId:input.dataset.moduleId,topicId:input.dataset.topicId});else if(input.dataset.workflowField)careerFlowRemember(input.dataset.workflowRoadmap,{moduleId:input.dataset.workflowModule});});
document.addEventListener('toggle',event=>{const panel=event.target;if(!panel.matches?.('details')||!panel.isConnected)return;careerFlowCapture(panel.closest('.career-studio'));},true);
document.addEventListener('click',event=>{const summary=event.target.closest('summary'),panel=summary?.parentElement;if(panel?.matches('details[data-career-flow-panel]')&&!panel.open)careerFlowRemember(panel.closest('.career-studio').dataset.flowRoadmap,{moduleId:panel.dataset.careerFlowPanel,topicId:null});},true);
if(typeof window!=='undefined')window.addEventListener('beforeunload',event=>{if(careerFlowDrafts.size){event.preventDefault();event.returnValue='';}});
document.addEventListener('change',event=>{
 const input=event.target;
 if(input.dataset.workflowField)careerFlowDrafts.delete([careerFlowContextKey(input.dataset.workflowRoadmap),input.dataset.workflowModule,input.dataset.workflowField].join('|'));
 if(!input.hasAttribute('data-career-flow-module')||!input.value)return;
 careerFlowOpenContext(findRoadmap(selectedRoadmapId),input.value);
});

document.addEventListener('click',event=>{const resume=event.target.closest('[data-career-flow-resume]'),context=event.target.closest('[data-studio-module][data-career-flow-topic]');if(!resume&&!context)return;const roadmap=findRoadmap(selectedRoadmapId),saved=careerFlowRead(roadmap?.id);if(resume){const target=careerFlowResume(roadmap,saved);if(target)careerFlowOpenContext(roadmap,target.module.id,target.topic?.id);}else{event.preventDefault();event.stopImmediatePropagation();careerFlowOpenContext(roadmap,context.dataset.studioModule,context.dataset.careerFlowTopic);}},true);
document.addEventListener('click',event=>{if(!event.target.closest('[data-career-flow-continue]'))return;const target=document.querySelector('#career-current-focus');target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target?.querySelector('input,button')?.focus({preventScroll:true});});
if(typeof currentPage!=='undefined'&&currentPage==='career')renderCareerView();
