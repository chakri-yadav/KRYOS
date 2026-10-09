/* Shared roadmap renderer. Personal source text is supplied privately, not shipped here. */
function careerParseRoadmap(source, title, id) {
  if(String(source).includes('SDE-2 INTERVIEW DEBUGGING ROADMAP'))return careerParseDebuggingRoadmap(source,title,id);
  if(String(source).includes('SOFTWARE ENGINEERING WORKPLACE MASTERY'))return careerParseWorkplaceRoadmap(source,title,id);
  const raw=String(source).replace(/\r\n/g,"\n");
  const matches=[...raw.matchAll(/^MODULE (\d+) — (.+)$/gm)];
  if(!matches.length)throw Error("Roadmap has no numbered modules.");
  const modules=[];
  function parseBody(body,moduleId) {
    const sections=[];let section=null;
    const headers=/^(TOPICS|BUILD|PRACTICE(?: \d+)?|INTERVIEW PRACTICE|EXTRA PRACTICE|Stretch:|CHAPTER-SPECIFIC AWARENESS|NOTE|LEARNED IN:|BULLET \d+ — .+|MOCK \d+|FINAL RULE)$/;
    for(const original of body.split("\n")){
      const line=original.trim();if(!line||/^=+$/.test(line)||line==="BOOK EXTENSION")continue;
      if(headers.test(line)) {section={title:line.replace(/:$/,""),lines:[]};sections.push(section);continue;}
      if(!section){section={title:"Guidance",lines:[]};sections.push(section);}
      section.lines.push(line);
    }
    let bullet="";const topics=[];
    for(const s of sections){
      if(/^BULLET/.test(s.title)){bullet=s.title;continue;}
      if(["NOTE","FINAL RULE","Guidance","LEARNED IN"].includes(s.title)) {
        topics.push({id:`${moduleId}-section-${topics.length+1}`,title:bullet?`${bullet} · ${s.title}`:s.title,confidence:"Low",workflowLane:"guidance",sourceLines:s.lines,checklist:[],ownerReference:s.title==="LEARNED IN"?s.lines.join("\n"):""});continue;
      }
      const lane=s.title==="TOPICS"?"learn":s.title==="BUILD"?"build":["EXTRA PRACTICE","Stretch"].includes(s.title)?"extra":s.title==="CHAPTER-SPECIFIC AWARENESS"?"awareness":/^MOCK/.test(s.title)?"mock":"practice";
      const topicId=`${moduleId}-section-${topics.length+1}`;
      // Preserve supplied wording and ordering; explanatory lines stay visible as source text.
      const bullets=s.lines.filter(l=>l.startsWith("- ")).map(l=>l.slice(2));
      const chapters=s.lines.filter(l=>/^Chapter \d+ —/.test(l));
      const items=bullets.length?bullets:chapters.length?chapters:s.lines.length?[s.lines.join("\n")]:[];
      topics.push({id:topicId,title:bullet?`${bullet} · ${s.title}`:s.title,confidence:"Low",workflowLane:lane,optional:lane==="extra",sourceLines:s.lines,checklist:items.map((text,i)=>({id:`${topicId}-check-${i+1}`,text,done:false}))});
    }
    return topics;
  }
  matches.forEach((m,i)=>{const end=matches[i+1]?.index??raw.length;let body=raw.slice(m.index+m[0].length,end);const final=body.indexOf("FINAL HLD PRACTICE");const finalApi=body.indexOf("FINAL API ENGINEERING PRACTICE");const cut=final>=0?final:finalApi;
    const moduleId=`${id}-module-${m[1]}`;modules.push({id:moduleId,title:`MODULE ${m[1]} — ${m[2]}`,targetDate:"",goal:body.includes("BOOK EXTENSION")?"BOOK EXTENSION":"",topics:parseBody(cut>=0?body.slice(0,cut):body,moduleId)});
    if(cut>=0){const finalId=`${id}-final`;modules.push({id:finalId,title:final>=0?"FINAL HLD PRACTICE":"FINAL API ENGINEERING PRACTICE",targetDate:"",topics:parseBody((final>=0?"PRACTICE\n":"Guidance\n")+body.slice(cut),finalId)});}
  });
  return {id,title,purpose:raw.slice(0,matches[0].index).split("\n").slice(2).filter(l=>!/^=+$/.test(l)).join("\n").trim(),targetDate:"",workflowVersion:1,sourceText:raw,modules};
}
function careerReplaceRoadmaps(state,incoming,requestId) {
  if(state.meta?.roadmapPackage===requestId)return false;
  state.roadmaps ||= [];state.archivedRoadmaps ||= [];
  const aliases={"System Design":["System Design Roadmap","System Design Roadmap (Book-Based)","HLD / SYSTEM DESIGN"],"API DESIGN":["API Design & Backend Engineering Roadmap","API Design & Backend Engineering"],"INTERVIEW PREP":["Resume Interview Mastery","Resume Interview Mastery — Interview Speaking","Resume Interview Mastery — Speaking"]};
  for(const roadmap of incoming){
    const prior=state.roadmaps.filter(r=>r.id===roadmap.id||r.title===roadmap.title||(aliases[roadmap.title]||[]).includes(r.title));
    const checks=new Map();for(const old of prior)for(const m of old.modules||[])for(const t of m.topics||[])for(const c of t.checklist||[]){const k=c.text.trim().toLowerCase();checks.set(k,[...(checks.get(k)||[]),c]);}
    for(const m of roadmap.modules)for(const t of m.topics)for(const c of t.checklist){const candidates=checks.get(c.text.trim().toLowerCase())||[];if(candidates.length===1){c.done=Boolean(candidates[0].done);if(candidates[0].completedAt)c.completedAt=candidates[0].completedAt;}}
    for(const old of prior)state.archivedRoadmaps.push({...old,archivedAt:new Date().toISOString(),replacedBy:roadmap.id});
    state.roadmaps=state.roadmaps.filter(r=>!prior.includes(r));state.roadmaps.push(roadmap);
  }
  state.meta={...(state.meta||{}),roadmapPackage:requestId};return true;
}
function careerParseDebuggingRoadmap(source,title,id){
  const raw=String(source).replace(/\r\n/g,'\n'),matches=[...raw.matchAll(/^MODULE (\d+) — (.+)$/gm)];
  if(matches.length!==8)throw Error('Debugging source needs all eight modules.');
  const referenceStart=raw.indexOf('FINAL DEBUGGING PRACTICE ROUTINE');
  if(referenceStart<0)throw Error('Debugging practice routine is missing.');
  const modules=matches.map((match,index)=>{
    const moduleId=`${id}-module-${match[1]}`,body=raw.slice(match.index+match[0].length,matches[index+1]?.index??referenceStart);
    const sections=[];let section=null;
    for(const original of body.split('\n')){const line=original.trim();if(!line||/^=+$/.test(line))continue;
      if(/^(TOPICS|PRACTICE|EXTRA PRACTICE|SESSION \d+ — .+)$/.test(line)){section={title:line,lines:[]};sections.push(section);continue;}
      if(!section){section={title:'Guidance',lines:[]};sections.push(section);}section.lines.push(original.trimEnd());
    }
    const topics=sections.filter(s=>s.lines.length).map((s,i)=>{
      const topicId=`${moduleId}-section-${i+1}`,lane=s.title==='TOPICS'?'learn':s.title==='EXTRA PRACTICE'?'extra':s.title.startsWith('SESSION')?'mock':s.title==='PRACTICE'?'practice':'guidance';
      const items=[];
      if(['learn','practice'].includes(lane)){
        for(const line of s.lines){if(/^\d+\. /.test(line))items.push(line);else if(/^\s+/.test(line)&&items.length)items[items.length-1]+='\n'+line;}
      }else if(['mock','extra'].includes(lane))items.push(s.lines.join('\n'));
      return {id:topicId,title:s.title,confidence:'Low',workflowLane:lane,optional:lane==='extra',sourceLines:s.lines,checklist:items.map((text,j)=>({id:`${topicId}-check-${j+1}`,text,done:false}))};
    });return {id:moduleId,title:match[0],targetDate:'',topics};
  });
  const referenceText=raw.slice(referenceStart),referenceSections=[];let current=null;
  for(const line of referenceText.split('\n')){if(/^(FINAL DEBUGGING PRACTICE ROUTINE|BUG PATTERN REFERENCE|COMPLETION RULE)$/.test(line)){current={title:line,lines:[]};referenceSections.push(current);}else if(current&&!/^=+$/.test(line))current.lines.push(line);}
  return {id,title,workflowVersion:1,workflowKind:'debugging',sourceText:raw,purpose:raw.slice(0,matches[0].index).replace(/^=+$/gm,'').trim(),referenceSections,targetDate:'',modules};
}
function careerParseWorkplaceRoadmap(source,title,id){
  const raw=String(source).replace(/\r\n/g,'\n'),lines=raw.split('\n');
  const modules=[];let phase='',module=null,section=null;
  function addSection(name,lane){section={title:name,lane,lines:[]};module.sections.push(section);}
  for(const original of lines){const line=original.trim();if(!line||/^=+$/.test(line))continue;
    if(/^PHASE [A-F] — /.test(line)){phase=line;section=null;continue;}
    if(/^MODULE \d+ — /.test(line)||line==='FINAL SDE-2 WORKPLACE READINESS GATE'){
      module={id:`${id}-module-${modules.length+1}`,title:line,phase,sections:[]};modules.push(module);section=null;continue;
    }
    if(!module)continue;
    if(/^(TECHNICAL \/ WORKPLACE TOPICS|TOPICS|PRACTICE|WORKPLACE LANGUAGE|LANGUAGE|DONE WHEN|PROJECT|MEETING PRACTICE|SCENARIO \d+ — .+)$/.test(line)){
      const lane=/TOPICS$/.test(line)?'learn':/LANGUAGE$/.test(line)?'language':line==='DONE WHEN'?'readiness':line==='PROJECT'?'guidance':line.startsWith('SCENARIO')?'scenario':'practice';addSection(line,lane);continue;
    }
    if(!section)addSection(line==='You should be able to:'?'READINESS CHECKLIST':'Context',line==='You should be able to:'?'readiness':'guidance');
    if(line==='You should be able to:')continue;section.lines.push(original.trimEnd());
  }
  for(const m of modules){m.topics=m.sections.map((s,index)=>{
    const topicId=`${m.id}-section-${index+1}`,items=[];
    const gated=['learn','practice','scenario','readiness'].includes(s.lane);
    if(gated){for(const line of s.lines){if(/^\s*(?:- |\d{2}\. )/.test(line))items.push(line.trim());else if(/^\s+/.test(line)&&items.length)items[items.length-1]+='\n'+line;}
      if(!items.length&&s.lane==='readiness')items.push(s.lines.join('\n').trim());
    }
    return {id:topicId,title:s.title,confidence:'Low',workflowLane:s.lane,sourceLines:s.lines,checklist:items.filter(Boolean).map((text,i)=>({id:`${topicId}-check-${i+1}`,text,done:false}))};
  });delete m.sections;m.targetDate='';}
  if(modules.length!==27)throw Error('Workplace roadmap needs 26 modules and its final readiness gate.');
  return {id,title,workflowVersion:1,workflowKind:'workplace',sourceText:raw,purpose:raw.slice(0,raw.indexOf('PHASE A')).trim(),targetDate:'',modules};
}
function careerVisualIdentity(roadmap){
  const title=roadmap?.title||"Career";
  if(roadmap?.workflowKind==='debugging'||title==='Debugging')return {tone:'violet',symbol:'⌕',label:'Debugging studio',hint:'Reproduce the failure. Understand the cause. Fix it. Verify the regression.'};
  if(roadmap?.workflowKind==='workplace')return {tone:'blue',symbol:'▦',label:'Workplace studio',hint:'Understand the workflow. Rehearse the conversation. Prove it in a safe simulation.'};
  if(title==="System Design")return {tone:"indigo",symbol:"◇",label:"Architecture studio",hint:"Learn the concept. Draw the design. Explain the tradeoff."};
  if(title==="API DESIGN")return {tone:"teal",symbol:"⌘",label:"Engineering studio",hint:"Understand the behavior. Build it. Test the failure."};
  if(title==="INTERVIEW PREP")return {tone:"amber",symbol:"◉",label:"Speaking studio",hint:"Recall real evidence. Shape your answer. Practice aloud."};
  return {tone:"indigo",symbol:"◎",label:"Skill studio",hint:"One clear step. Real evidence. Steady progress."};
}
function careerCoreProgress(roadmap){
  const checks=(roadmap?.modules||[]).flatMap(m=>(m.topics||[]).filter(t=>!t.optional&&t.lane!=="extra").flatMap(t=>t.checklist||[]));
  const done=checks.filter(c=>c.done).length;
  return {done,total:checks.length,percent:checks.length?Math.round(done/checks.length*100):0};
}
if(typeof document!=="undefined"){
  const originalNextCareerItem=getNextCareerItem;
  getNextCareerItem=function(roadmap){
    if(!roadmap?.workflowVersion)return originalNextCareerItem(roadmap);
    for(const module of roadmap.modules)for(const topic of module.topics.filter(t=>!t.optional)){
      const item=topic.checklist.find(c=>!c.done);if(item)return {module,topic,item};
    }
    return null;
  };
  renderCareerView=function(){
    if(!findRoadmap(selectedRoadmapId))selectedRoadmapId=careerState.roadmaps[0]?.id;
    const roadmap=findRoadmap(selectedRoadmapId),identity=careerVisualIdentity(roadmap),next=getNextCareerItem(roadmap),progress=careerCoreProgress(roadmap),stats=getCareerStats();
    careerView.innerHTML=`<div class="career-studio tone-${identity.tone}">
      <header class="studio-top"><div><p class="section-kicker">KRYOS / CAREER</p><h1>Your learning studio</h1><p>Choose a path. Take one useful step.</p></div><span id="career-sync-state" class="career-sync-state state-${careerSyncState}"><i></i>${escapeHtml(careerSyncLabel())}</span></header>
      <nav id="career-portfolio" class="studio-paths" aria-label="Choose a roadmap">${careerState.roadmaps.map(r=>{const s=careerCoreProgress(r),v=careerVisualIdentity(r);return `<button type="button" class="studio-path tone-${v.tone} ${r.id===selectedRoadmapId?"is-selected":""}" aria-pressed="${r.id===selectedRoadmapId}" data-career-select-roadmap="${escapeHtml(r.id)}"><span class="studio-path-icon" aria-hidden="true">${v.symbol}</span><strong>${escapeHtml(r.title)}</strong><span>${r.workflowKind==="workplace"?`${r.modules.filter(m=>careerCoreProgress({modules:[m]}).percent===100).length} / ${r.modules.length} modules complete`:`${s.done} / ${s.total} core steps`}</span><span class="studio-track"><i style="width:${s.percent}%"></i></span></button>`;}).join("")}</nav>
      ${roadmap?`<section class="studio-hero"><div><p class="section-kicker">${identity.label}</p><h2>${escapeHtml(roadmap.title)}</h2><p>${identity.hint}</p><a class="studio-plan-link" href="#career-roadmap-detail" data-studio-plan>Explore the full roadmap ↓</a></div><div class="studio-ring" style="--studio-progress:${progress.percent*3.6}deg"><div><strong>${progress.percent}<small>%</small></strong><span>core coverage</span></div></div></section>
      <section id="career-current-focus" class="studio-next"><div class="studio-next-head"><span class="studio-live-dot"></span><p class="section-kicker">Your next action</p><span>${next?escapeHtml(next.topic.workflowLane||"practice"):"review"}</span></div>${next?`<p class="studio-breadcrumb">${escapeHtml(next.module.title)} · ${escapeHtml(next.topic.title)}</p><h3>${escapeHtml(next.item.text)}</h3><div class="studio-next-footer"><label class="career-next-check"><input type="checkbox" data-career-check="${escapeHtml(next.item.id)}" data-roadmap-id="${escapeHtml(roadmap.id)}" data-module-id="${escapeHtml(next.module.id)}" data-topic-id="${escapeHtml(next.topic.id)}"><span>Mark complete</span></label><button type="button" class="studio-context" data-studio-module="${escapeHtml(next.module.id)}">Open module context →</button></div>`:`<h3>${progress.total?"Core steps complete. Make your understanding durable.":"Your roadmap is ready for its first module."}</h3><p>Review your notes or choose another path. Completion is coverage, not a mastery claim.</p>`}</section>
      <div id="career-roadmap-detail">${renderRoadmapDetail(roadmap)}</div>`:emptyState("Add a roadmap to start learning.")}
      ${roadmap?.referenceSections?.length?`<section class="studio-reference"><h2>Debugging field guide</h2><p>Use faulty code. Diagnose, fix and verify—do not restart by solving the original problem.</p>${roadmap.referenceSections.map(s=>`<details class="career-workflow-guidance"><summary>${escapeHtml(s.title)}</summary><p>${escapeHtml(s.lines.join("\n"))}</p></details>`).join("")}</section>`:""}
      <details class="studio-insights"><summary><span>Progress & planning</span><small>${stats.weekActions} completed steps this week</small></summary><section class="career-section"><div class="career-section-head"><h2>Weekly evidence</h2><span>Current rhythm: ${stats.currentStreak} days · best ${stats.bestStreak}</span></div><div class="career-week-pulse">${getCareerWeekPulse().map(renderCareerPulseDay).join("")}</div></section><div class="career-dashboard-grid"><section class="career-section">${renderCareerTruthBars(stats.progress,getCareerConfidence())}<p>Coverage and confidence stay separate.</p></section><section class="career-section">${renderCareerHeatmap()}</section></div><div id="career-deadlines">${renderCareerDeadlinePanel(getCareerDeadlineStats())}</div><div class="quick-add"><input id="new-roadmap-title" placeholder="New skill roadmap" aria-label="New skill roadmap"><button class="primary-button" data-career-add="roadmap" type="button">Add roadmap</button></div></details>
    </div>`;
  };
  document.addEventListener("click",event=>{
    const button=event.target.closest("[data-studio-module], [data-studio-plan]");if(!button)return;
    event.preventDefault();const moduleId=button.dataset.studioModule;
    const target=moduleId?(document.getElementById(`workflow-${moduleId}`)||document.querySelector(`[data-studio-legacy-module="${CSS.escape(moduleId)}"]`)):document.getElementById("career-roadmap-detail");
    if(!target)return;if(target.tagName==="DETAILS")target.open=true;
    target.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    const focus=target.querySelector("summary, input, button");focus?.focus({preventScroll:true});
  });

  const originalCareerRenderer=renderCareerView;
  renderCareerView=function(){originalCareerRenderer();document.querySelector('#career-view .studio-insights')?.insertAdjacentHTML('beforeend','<details class="career-workflow-guidance"><summary>Roadmap updates</summary><label>Import roadmap package<input type="file" accept=".json,application/json" data-career-package></label><p data-career-package-status role="status">Personal roadmap files are saved through Career, not published to GitHub.</p></details>');};
  document.addEventListener('change',async event=>{
    const input=event.target.closest('[data-career-package]');if(!input?.files?.[0])return;
    const status=document.querySelector('[data-career-package-status]');
    try {
      const session=await getSupabaseClient().auth.getSession();if(!session.data.session)throw Error('Sign in through Cloud & versions on this GitHub app first.');
      const payload=JSON.parse(await input.files[0].text());
      if(!payload.requestId||!Array.isArray(payload.sources)||payload.sources.length!==3)throw Error('Select the complete three-roadmap package.');
      const parsed=payload.sources.map(s=>careerParseRoadmap(s.text,s.title,s.id));
      if(careerReplaceRoadmaps(careerState,parsed,payload.requestId))saveCareer();
      await flushCareerCloudSync();
      if(careerSyncState!=='synced')throw Error('Roadmaps are saved on this browser; cloud confirmation is still pending.');
      render();
    }catch(error){if(status)status.textContent=error.message;}
  });
  const originalModuleStats=getModuleStats;
  getModuleStats=function(module){return originalModuleStats({...module,topics:module.topics.filter(t=>!t.optional)});};
  const originalModuleRenderer=renderModuleBlock;
  renderModuleBlock=function(roadmap,module,isEditing){
    if(isEditing)return originalModuleRenderer(roadmap,module,isEditing);
    if(!roadmap.workflowVersion){
      const active=getNextCareerItem(roadmap)?.module===module,stats=getModuleStats(module);
      return `<details class="career-workflow-module" data-studio-legacy-module="${escapeHtml(module.id)}" ${active?"open":""}><summary><span class="studio-module-number">${String(roadmap.modules.indexOf(module)+1).padStart(2,"0")}</span><span class="studio-module-title"><small>${active?"CONTINUE HERE":"LEARNING MODULE"}</small><strong>${escapeHtml(module.title)}</strong></span><span class="studio-module-meter"><small>${stats.done}/${stats.total} steps</small></span></summary>${originalModuleRenderer(roadmap,module,false)}</details>`;
    }
    const topics=module.topics||[],core=topics.filter(t=>!t.optional&&t.workflowLane!=="guidance");
    const checks=core.flatMap(t=>t.checklist||[]);const done=checks.filter(c=>c.done).length;
    const next=core.find(t=>t.checklist.some(c=>!c.done));
    const renderTopic=t=>["guidance","language"].includes(t.workflowLane)?`<aside class="career-workflow-guidance ${t.workflowLane==="language"?"studio-language":""}"><strong>${escapeHtml(t.title)}</strong><p>${escapeHtml(t.sourceLines.join("\n"))}</p>${t.ownerReference?careerOwnerLinks(t.ownerReference):""}</aside>`:`<section class="studio-lane lane-${escapeHtml(t.workflowLane)}"><span class="studio-lane-label">${escapeHtml(({learn:"01 / LEARN",build:"02 / BUILD",practice:"PRACTICE",mock:roadmap.workflowKind==="debugging"?"DEBUGGING SESSION":"SPEAK & REHEARSE",awareness:"CONTEXT",extra:"OPTIONAL",scenario:"SAFE SIMULATION",readiness:"READINESS CHECK"})[t.workflowLane]||"PRACTICE")}</span>${renderTopicBlock(roadmap,module,t,false)}${t.sourceLines.some(l=>!l.startsWith("- "))?`<details class="career-workflow-guidance"><summary>Original instructions</summary><p>${escapeHtml(t.sourceLines.join("\n"))}</p></details>`:""}</section>`;
    const evidenceFields=roadmap.workflowKind==="debugging"?[["failingInput","Failing input · expected vs actual"],["rootCause","Root cause / first incorrect state"],["focusedFix","Focused fix and why it works"],["regressionEvidence","Regression cases / verification results"]]:roadmap.workflowKind==="workplace"?[["simulationEvidence","Simulation / artifact evidence"],["communicationPractice","My practiced response / handoff"],["remainingGap","What still needs practice"]]:roadmap.title==="INTERVIEW PREP"?[["verifiedEvidence","Real evidence / details not remembered"],["shortExplanation","Short spoken explanation"],["ownership","My contribution, baseline and observed impact"]]:roadmap.title==="API DESIGN"?[["artifact","Implementation / test evidence"],["failureCase","Failure tested and result"]]:[["designNotes","Design sketch / reasoning"],["tradeoffs","Tradeoffs and failure behavior"]];
    const evidence=`<details class="career-workflow-extra"><summary>${roadmap.title==="INTERVIEW PREP"?"My verified experience — never invent missing details":"My practice evidence"}</summary>${evidenceFields.map(([field,label])=>`<label class="career-workflow-note">${escapeHtml(label)}<textarea maxlength="4000" rows="3" data-workflow-field="${field}" data-workflow-roadmap="${escapeHtml(roadmap.id)}" data-workflow-module="${escapeHtml(module.id)}">${escapeHtml(module.workflowEvidence?.[field]||"")}</textarea></label>`).join("")}<small>Optional notes. These do not automatically mark any step complete.</small></details>`;
    const index=roadmap.modules.indexOf(module)+1,percent=checks.length?Math.round(done/checks.length*100):0;
    const active=next&&module===roadmap.modules.find(m=>m.topics.some(t=>!t.optional&&t.checklist.some(c=>!c.done)));
    const phaseStart=module.phase&&roadmap.modules[index-2]?.phase!==module.phase;
    return `${phaseStart?`<div class="studio-phase-heading"><p class="section-kicker">${escapeHtml(module.phase)}</p><span>Learn · Practice · Rehearse · Verify</span></div>`:""}<details class="career-workflow-module ${active?"is-current":""}" id="workflow-${escapeHtml(module.id)}" ${active?"open":""}><summary><span class="studio-module-number">${String(index).padStart(2,"0")}</span><span class="studio-module-title"><small>${active?"CONTINUE HERE":percent===100?"CORE COMPLETE":"LEARNING MODULE"}</small><strong>${escapeHtml(module.title)}</strong></span><span class="studio-module-meter"><small>${done}/${checks.length} core steps</small><span class="studio-track"><i style="width:${percent}%"></i></span></span></summary><div class="studio-module-body">${module.goal?`<p>${escapeHtml(module.goal)}</p>`:""}<p class="career-workflow-next">${next?`Next: ${escapeHtml(next.checklist.find(c=>!c.done).text)}`:"Core steps complete. Extra practice is optional."}</p>${topics.filter(t=>!t.optional).map(renderTopic).join("")}${evidence}${topics.some(t=>t.optional)?`<details class="career-workflow-extra"><summary>Extra practice · optional</summary>${topics.filter(t=>t.optional).map(renderTopic).join("")}</details>`:""}</div></details>`;
  };
  function careerOwnerLinks(reference){const buttons=[];for(const line of reference.split("\n")){const title=line.startsWith("HLD")?"System Design":"API DESIGN";const nums=line.match(/\d+/g)||[];for(const num of nums)buttons.push(`<button type="button" data-career-owner-title="${title}" data-career-owner-module="${Number(num)}">${title} · Module ${Number(num)}</button>`);}return buttons.join("");}
  document.addEventListener("click",event=>{const b=event.target.closest("[data-career-owner-title]");if(!b)return;const r=careerState.roadmaps.find(r=>r.title===b.dataset.careerOwnerTitle);const m=r?.modules.find(m=>m.title.startsWith(`MODULE ${String(b.dataset.careerOwnerModule).padStart(2,"0")} —`));if(!r||!m)return;selectedRoadmapId=r.id;render();const panel=document.getElementById(`workflow-${m.id}`);if(panel){panel.open=true;panel.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}});
  document.addEventListener("change",event=>{const input=event.target.closest("[data-workflow-field]");if(!input)return;const module=careerState.roadmaps.find(r=>r.id===input.dataset.workflowRoadmap)?.modules.find(m=>m.id===input.dataset.workflowModule);if(!module)return;module.workflowEvidence={...(module.workflowEvidence||{}),[input.dataset.workflowField]:input.value};saveCareer();});
}
async function installPendingCareerRoadmaps(){
  if(location.hostname!=="127.0.0.1"||isDemoMode())return false;
  try{const response=await fetch("/api/career/roadmaps",{cache:"no-store"});if(!response.ok)return false;const payload=await response.json();const roadmaps=payload.sources.map(s=>careerParseRoadmap(s.text,s.title,s.id));if(careerReplaceRoadmaps(careerState,roadmaps,payload.requestId)){saveCareer();if(currentPage==="career")render();return true;}}
  catch(error){console.warn("Career roadmap package was not installed.",error);}return false;
}
if(typeof window!=="undefined")window.addEventListener("DOMContentLoaded",function ready(){
  if(location.hostname!=="127.0.0.1")return;
  refreshCloudData({automatic:true}).then(result=>{
    if(result.busy){setTimeout(ready,1200);return;}
    if(!result.error&&!result.conflicts)installPendingCareerRoadmaps();
  });
},{once:true});
