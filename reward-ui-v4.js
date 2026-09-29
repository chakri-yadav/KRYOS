const REWARD_GATE_LABELS={work:['Meaningful work','career'],foundation:['Nourishment','rhythm'],care:['Two skincare steps','rhythm'],spiritual:['Two spiritual practices','rhythm'],articulation:['Articulation practice','launch'],containment:['Containment and return','journal']};
function renderRewardV4(){
  const store=lifeStore(),stats=journalRewardStats(),today=toDateKey(),date=rewardSelectedDate||today;
  const modern=date>=KryosRewardV4.start,e=rewardEvidence(date),target=JOURNAL_REWARDS.find(r=>r.id===store.rewardTarget)||JOURNAL_REWARDS[0];
  const eligibility=rewardEligibility(target),ready=stats.balance>=target.cost&&eligibility.allowed;
  const recent=Array.from({length:7},(_,i)=>KryosRewardV4.shift(today,i-6));
  const qualified=store.dailyAssessments.filter(a=>a.ruleVersion===4&&a.qualified&&recent.includes(a.date)).length;
  const next=modern?Object.entries(e.gates).find(([,met])=>!met):null;
  const categories=modern?KryosRewardV4.categories:e.ruleVersion===3?REWARD_CATEGORIES:LEGACY_REWARD_CATEGORIES;
  const currentBonuses=weeklyConsistencyBonuses(store.dailyAssessments).filter(a=>a.week?.includes(KryosRewardV4.week(today))).reduce((n,a)=>n+a.credits,0);
  const historical=store.rewardAssessmentHistory||[];
  const previousEarned=historical.reduce((sum,a)=>sum+Number(a.credits||0),0)+weeklyConsistencyBonuses(historical).reduce((sum,a)=>sum+a.credits,0);
  rewardsView.innerHTML=`<header class="reward-hero"><div><p class="section-kicker">EVIDENCE / CONSISTENCY / ENJOYMENT</p><h1>Earn it. See why.</h1><p>Ordinary rest, meals and supportive contact are always available.</p><span role="status">${escapeHtml(rewardCloudNotice||'Credits shown from this device · cloud confirms redemption')}</span></div><div><small>AVAILABLE CREDITS</small><strong>${stats.balance}</strong><span>${stats.spent} reserved or spent · progress stays yours</span></div></header>
    <p class="reward-policy-note">Every recorded reward day now uses the same evidence rules. ${historical.length?`Original earnings: ${previousEarned} credits → recalculated earnings: ${stats.earned} credits. `:''}Earlier totals remain in private history. Corrections recalculate credits again. Initiated call: 100 credits · movie night: 90.</p>
    ${stats.adjustmentDue||store.rewardCloudAdjustmentDue?`<p class="reward-policy-note">An evidence correction left ${Math.max(stats.adjustmentDue,store.rewardCloudAdjustmentDue||0)} previously spent credits to reconcile. Future earnings cover this before new spending.</p>`:''}
    <div class="reward-focus"><section class="reward-target-card ${ready?'is-ready':''}"><p class="section-kicker">YOUR NEXT REWARD</p><label for="reward-target">Working toward</label><select id="reward-target">${JOURNAL_REWARDS.map(r=>`<option value="${r.id}" ${r.id===target.id?'selected':''}>${r.title}</option>`).join('')}</select><div class="reward-target-meter"><strong>${stats.balance}</strong><span>of ${target.cost} credits</span></div><progress aria-label="Credits toward selected reward" max="${target.cost}" value="${Math.min(stats.balance,target.cost)}"></progress><p>${escapeHtml(rewardTargetMessage(target,stats,eligibility))}</p>${ready?`<button class="primary-button" data-journal-reward="${target.id}">Redeem ${escapeHtml(target.title)}</button>`:''}</section>
    <section class="reward-week-card"><p class="section-kicker">RECENT CONSISTENCY</p><h2>${qualified} / 7 qualified days</h2><div class="reward-week">${recent.map(d=>{const a=store.dailyAssessments.find(a=>a.date===d);return `<div class="${a?.ruleVersion===4&&a.qualified?'qualified':a?'partial':'unknown'}"><small>${getDateFromKey(d).toLocaleDateString(undefined,{weekday:'short'})}</small><strong>${a?'+'+assessmentCredits(a):'—'}</strong><span>${a?.ruleVersion===4?(a.qualified?'Qualified':'Partial'):a?'Earlier rules':'Unrecorded'}</span></div>`;}).join('')}</div><p>${currentBonuses} weekly bonus credits · Career 5/7 · Launch 4/5 weekdays · articulation 3 medium days including a serious mock.</p></section></div>
    <section class="reward-review"><header><div><p class="section-kicker">${modern?'DAILY EVIDENCE':'PRESERVED HISTORY'}</p><h2>${e.total}${modern?' / 100':''} points · +${assessmentCredits(e)} credits</h2><p>${formatDateKey(date)}${modern?` · ${e.qualified?'Qualified day':'Partial day; earned credits still count'} · ${e.remainder}/5 toward another credit`:''}</p></div><input id="reward-date" type="date" max="${today}" value="${date}" aria-label="Evidence date"></header>
    ${modern?`<div class="reward-v4-gates">${Object.entries(e.gates).map(([key,met])=>`<button class="${met?'met':''}" data-page="${REWARD_GATE_LABELS[key][1]}"><span aria-hidden="true">${met?'✓':'○'}</span>${REWARD_GATE_LABELS[key][0]}<small>${met?'Complete':'Still needed →'}</small></button>`).join('')}</div>${next?`<p class="reward-policy-note">Next: ${REWARD_GATE_LABELS[next[0]][0]}. Tap its card to continue.${next[0]==='work'?' Two completed Career steps, one substantive Launch outcome, or a due Money follow-up with its result can qualify.':''}</p>`:''}`:''}
    ${modern&&innerCommandRecord(date)?.boundary?`<form id="reward-recovery-form" class="reward-policy-note"><input type="hidden" name="date" value="${date}"><label>Completed return action<input name="recoveryNote" maxlength="400" required value="${escapeHtml(innerCommandRecord(date)?.recoveryNote||'')}" placeholder="What did you actually finish after the drift?"></label><button class="secondary-button" type="submit">Save return evidence</button></form>`:''}
    <div class="reward-evidence">${Object.entries(categories).filter(([,c])=>c.cap>0).map(([key,c])=>`<details><summary><span>${c.title}</span><b>${e.scores[key]||0}/${c.cap}</b><progress max="${c.cap}" value="${e.scores[key]||0}"></progress></summary>${(e.buckets[key]||[]).map(row=>`<p>${escapeHtml(row.title)}<small>+${row.points||0} · ${escapeHtml(row.source)}</small></p>`).join('')||'<p>No completed evidence earns here yet.</p>'}</details>`).join('')}</div><footer><span>Rules ${e.ruleVersion} · ${modern?'5 points = 1 credit · same credit for late journaling':'historical calculation preserved'}${e.deduction?' · '+e.deduction+' points deducted for recorded drift':''}</span></footer></section>
    <section class="life-section reward-catalogue"><div class="life-heading"><div><p class="section-kicker">FOUR OPTIONAL REWARDS</p><h2>Four choices. One clear focus.</h2><p>Choose a target; redeem only when its requirements are met.</p></div></div><div class="reward-grid">${JOURNAL_REWARDS.map(r=>{const gate=rewardEligibility(r),isReady=stats.balance>=r.cost&&gate.allowed,isSelected=target.id===r.id;return `<article class="reward-card ${isReady?'ready':''} ${isSelected?'selected':''}"><div class="reward-card-heading"><span>${escapeHtml(r.tier)}</span><strong class="reward-cost"><b>${r.cost}</b><small>credits</small></strong></div><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.note)}</p><div class="reward-card-progress"><progress aria-label="${escapeHtml(r.title)}: ${Math.min(stats.balance,r.cost)} of ${r.cost} credits" max="${r.cost}" value="${Math.min(stats.balance,r.cost)}"></progress><small>${Math.min(stats.balance,r.cost)} / ${r.cost}</small></div><div class="reward-card-footer">${isSelected?'<span class="reward-focus-label">Current focus</span>':`<button class="secondary-button" aria-pressed="false" data-reward-target="${r.id}">Make this my focus</button>`}${isReady&&!isSelected?`<button class="primary-button" data-journal-reward="${r.id}">Redeem</button>`:!isReady?`<small class="reward-card-gate">${escapeHtml(rewardTargetMessage(r,stats,gate))}</small>`:''}</div></article>`;}).join('')}</div></section>
    <section class="life-section"><h2>Cloud ledger</h2><p role="status">${escapeHtml(rewardNotice||rewardCloudNotice||'Sync confirms your current records and reward balance.')}</p><button class="secondary-button" data-reward-sync ${rewardCloudBusy?'disabled':''}>${rewardCloudBusy?'Syncing…':'Sync rewards'}</button>${store.rewardRedemptions.slice().reverse().map(r=>`<div class="life-row"><span>${escapeHtml(r.title)} · ${escapeHtml(r.status)}</span><strong>${r.cost} credits</strong></div>`).join('')}</section>`;
}
async function syncRewardV4(){
  if(rewardCloudBusy)return;
  rewardCloudBusy=true;rewardCloudNotice='Confirming recorded evidence…';
  try{
    const session=await getSupabaseSession();if(!session)throw new Error('Sign in under Settings to confirm rewards. Your local evidence is saved.');
    for(let i=0;i<50&&(actionSyncRunning||careerSyncRunning);i++)await new Promise(resolve=>setTimeout(resolve,100));
    if(actionSyncRunning||careerSyncRunning)throw new Error('Records are still syncing. Retry in a moment.');
    await flushTaskCloudSync();await flushCareerCloudSync();
    if(actionSyncState==='error'||careerSyncState==='error')throw new Error('Resolve the record sync issue before redeeming. Your local work is saved.');
    const profile=await ensureSupabaseProfile(session),store=lifeStore();
    // The service calculates from synced records; it never accepts a browser-supplied balance.
    const pending=store.rewardRedemptions.filter(r=>r.status==='pending');
    for(const request of pending.length?pending:[null]){
      const {data,error}=await getSupabaseClient().functions.invoke('kryos-rewards',{body:{profile,request:request?{id:request.id,rewardId:request.rewardId}:null}});
      if(error||data?.error)throw new Error(data?.error||'Cloud could not confirm rewards. Sync your records, then retry.');
      store.rewardCloudBalance=data.balance;store.rewardCloudAdjustmentDue=data.adjustmentDue;
      const known=new Map((data.redemptions||[]).map(r=>[r.id,r]));
      store.rewardRedemptions=store.rewardRedemptions.map(r=>known.get(r.id)||r);
      data.redemptions?.forEach(r=>{if(!store.rewardRedemptions.some(local=>local.id===r.id))store.rewardRedemptions.push(r);});
      if(request&&!data.accepted)rewardNotice=data.reason||'Reward requirements are not yet confirmed.';
    }
    store.rewardCloudSyncedAt=new Date().toISOString();saveTasks();rewardCloudNotice=`Cloud confirmed: ${store.rewardCloudBalance} available credits.`;
  }catch(error){rewardCloudNotice=error.message;}
  finally{rewardCloudBusy=false;if(currentPage==='rewards')renderRewardV4();}
}
document.addEventListener('submit',event=>{
  if(event.target.id!=='reward-recovery-form')return;
  event.preventDefault();const data=new FormData(event.target),record=innerCommandRecord(String(data.get('date')));
  if(!record)return;
  record.recoveryNote=String(data.get('recoveryNote')||'').trim();record.updatedAt=new Date().toISOString();saveTasks();renderRewardV4();
});
