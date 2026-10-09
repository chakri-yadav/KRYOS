/* Shared roadmap renderer. Personal source text is supplied privately, not shipped here. */
function careerParseRoadmap(source, title, id) {
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
if(typeof document!=="undefined"){
  const originalCareerRenderer=renderCareerView;
  renderCareerView=function(){originalCareerRenderer();document.querySelector('#career-view')?.insertAdjacentHTML('afterbegin','<details class="career-workflow-guidance"><summary>Roadmap updates</summary><label>Import roadmap package<input type="file" accept=".json,application/json" data-career-package></label><p data-career-package-status role="status">Personal roadmap files are saved through Career, not published to GitHub.</p></details>');};
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
    if(!roadmap.workflowVersion||isEditing)return originalModuleRenderer(roadmap,module,isEditing);
    const topics=module.topics||[],core=topics.filter(t=>!t.optional&&t.workflowLane!=="guidance");
    const checks=core.flatMap(t=>t.checklist||[]);const done=checks.filter(c=>c.done).length;
    const next=core.find(t=>t.checklist.some(c=>!c.done));
    const renderTopic=t=>t.workflowLane==="guidance"?`<aside class="career-workflow-guidance"><strong>${escapeHtml(t.title)}</strong><p>${escapeHtml(t.sourceLines.join("\n"))}</p>${t.ownerReference?careerOwnerLinks(t.ownerReference):""}</aside>`:`${renderTopicBlock(roadmap,module,t,false)}${t.sourceLines.some(l=>!l.startsWith("- "))?`<details class="career-workflow-guidance"><summary>Original instructions</summary><p>${escapeHtml(t.sourceLines.join("\n"))}</p></details>`:""}`;
    const evidenceFields=roadmap.title==="INTERVIEW PREP"?[["verifiedEvidence","Real evidence / details not remembered"],["shortExplanation","Short spoken explanation"],["ownership","My contribution, baseline and observed impact"]]:roadmap.title==="API DESIGN"?[["artifact","Implementation / test evidence"],["failureCase","Failure tested and result"]]:[["designNotes","Design sketch / reasoning"],["tradeoffs","Tradeoffs and failure behavior"]];
    const evidence=`<details class="career-workflow-extra"><summary>${roadmap.title==="INTERVIEW PREP"?"My verified experience — never invent missing details":"My practice evidence"}</summary>${evidenceFields.map(([field,label])=>`<label class="career-workflow-note">${escapeHtml(label)}<textarea maxlength="4000" rows="3" data-workflow-field="${field}" data-workflow-roadmap="${escapeHtml(roadmap.id)}" data-workflow-module="${escapeHtml(module.id)}">${escapeHtml(module.workflowEvidence?.[field]||"")}</textarea></label>`).join("")}<small>Optional notes. These do not automatically mark any step complete.</small></details>`;
    return `<details class="career-workflow-module" id="workflow-${escapeHtml(module.id)}" ${next&&module===roadmap.modules.find(m=>m.topics.some(t=>!t.optional&&t.checklist.some(c=>!c.done)))?"open":""}><summary><span>${escapeHtml(module.title)}</span><small>${done}/${checks.length} core steps</small></summary>${module.goal?`<p>${escapeHtml(module.goal)}</p>`:""}<p class="career-workflow-next">${next?`Next: ${escapeHtml(next.title)}`:"Core steps complete. Extra practice is optional."}</p>${evidence}${topics.filter(t=>!t.optional).map(renderTopic).join("")}<details class="career-workflow-extra"><summary>Extra practice · optional</summary>${topics.filter(t=>t.optional).map(renderTopic).join("")||"No extra practice assigned."}</details></details>`;
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
