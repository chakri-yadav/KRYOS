const JOURNAL_REWARDS = [
  { id:'food', title:'Food enjoyment', cost:15, tier:'Small reward' },
  { id:'video', title:'45-minute information or video session', cost:20, tier:'Small reward' },
  { id:'music', title:'One-hour leisure music session', cost:20, tier:'Small reward' },
  { id:'conversation', title:'One-hour initiated casual conversation', cost:35, tier:'Social reward' },
  { id:'movie', title:'Movie night', cost:90, tier:'Medium reward' },
  { id:'important-call', title:'Important initiated call', cost:250, tier:'Medium reward' },
];
const COVENANT = { start:'2026-09-26', end:'2026-11-12', requiredDays:48 };
let rewardSelectedDate = '';
let rewardNotice = '';

function journalRewardStore() { const s=lifeStore(); s.rewardRedemptions ||= []; s.dailyAssessments ||= []; return s; }
function rewardDateAdd(key, days) { const d=new Date(`${key}T12:00:00`); d.setDate(d.getDate()+days); return toDateKey(d); }
function rewardWeekKey(key) { const d=new Date(`${key}T12:00:00`); return rewardDateAdd(key,-((d.getDay()+6)%7)); }
function assessmentCredits(a) {
  if (!a?.qualified) return 0;
  if (a.ruleVersion===3) return Math.max(0,Number(a.total||0));
  if (a.ruleVersion===2) return a.total>=9?3:a.total>=7?2:a.total>=5?1:0;
  return a.total>=9?2:a.total>=7?1:0;
}
function weeklyConsistencyBonuses(assessments) {
  const unique=[...new Map(assessments.map(a=>[a.date,a])).values()].filter(a=>a.qualified).sort((a,b)=>a.date.localeCompare(b.date));
  const legacyWeeks=new Map();
  unique.filter(a=>a.ruleVersion!==3).forEach(a=>{
    const key=rewardWeekKey(a.date),row=legacyWeeks.get(key)||{week:key,days:0,modern:false,sourceDates:[]};
    row.days++; row.modern ||= a.ruleVersion===2; row.sourceDates.push(a.date); legacyWeeks.set(key,row);
  });
  const bonuses=[...legacyWeeks.values()].map(row=>({...row,credits:row.modern?(row.days>=5?2:0):(row.days>=7?5:row.days===6?3:row.days===5?2:0)}));
  const v3=unique.filter(a=>a.ruleVersion===3);
  const rollingBonus=(id,eligible,target,credits,extra=()=>true)=>{
    let pool=[];
    v3.forEach(a=>{
      pool=pool.filter(item=>item.date>=rewardDateAdd(a.date,-6));
      if(eligible(a))pool.push(a);
      if(pool.length>=target&&extra(pool)){
        const used=pool.slice(); bonuses.push({week:`${id}:${a.date}`,days:used.length,credits,sourceDates:used.map(x=>x.date)}); pool=[];
      }
    });
  };
  rollingBonus('career',a=>Number(a.scores?.career||0)>0,5,8);
  rollingBonus('articulation',a=>Number(a.scores?.articulation||0)>=6,3,4,pool=>pool.some(a=>Number(a.scores?.articulation||0)>=10));
  const launchWeeks=new Map();
  v3.filter(a=>Number(a.scores?.launch||0)>0&&![0,6].includes(getDateFromKey(a.date).getDay())).forEach(a=>{
    const key=rewardWeekKey(a.date),row=launchWeeks.get(key)||[]; row.push(a); launchWeeks.set(key,row);
  });
  launchWeeks.forEach((rows,key)=>{if(rows.length>=4)bonuses.push({week:`launch:${key}`,days:rows.length,credits:8,sourceDates:rows.map(a=>a.date)});});
  return bonuses;
}
function journalRewardStats() {
  if(typeof refreshAutomaticRewardAssessments==='function')refreshAutomaticRewardAssessments();
  const s=journalRewardStore(),reviews=[...new Map(s.dailyAssessments.map(a=>[a.date,a])).values()];
  const daily=reviews.reduce((n,a)=>n+assessmentCredits(a),0),weekly=weeklyConsistencyBonuses(reviews).reduce((n,w)=>n+w.credits,0);
  const spent=s.rewardRedemptions.filter(r=>!['rejected','cancelled'].includes(r.status)).reduce((n,r)=>n+Number(r.cost||0),0);
  return {daily,weekly,earned:daily+weekly,spent,balance:Math.max(0,daily+weekly-spent)};
}
function covenantStats(today=toDateKey()) {
  const s=journalRewardStore(),records=s.innerCommand?.containmentDays||[],reviews=s.dailyAssessments,start=s.innerCommand?.covenant?.startDate||COVENANT.start;
  const keys=[...new Set([...records.map(r=>r.date),...reviews.map(r=>r.date)])].filter(d=>d>=start&&d<=today).sort();
  let qualified=0,breaches=0,readyDate='';
  keys.forEach(date=>{
    const r=records.find(x=>x.date===date),a=reviews.find(x=>x.date===date);
    const breach=a?.astrologySeeking===true||r?.boundary==='astrology'||r?.breaches?.some(b=>b.boundary==='astrology');
    const kept=!breach&&(r?.status==='kept'||r?.astrologyKept===true||a?.astrologyKept===true);
    if(breach)breaches++; if(kept)qualified++; if(qualified===COVENANT.requiredDays&&!readyDate)readyDate=date;
  });
  return {qualified,breaches,unlocked:qualified>=COVENANT.requiredDays,remaining:Math.max(0,COVENANT.requiredDays-qualified),readyDate,start};
}
function assessmentRows() {
  const rows=[...journalRewardStore().dailyAssessments].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);
  if(!rows.length)return '<p class="life-empty">No reward evidence recorded yet.</p>';
  return `<div class="reward-audit">${rows.map(a=>`<article><time>${escapeHtml(a.date)}</time><strong>${a.ruleVersion===3?`${a.total} earned`:`${a.total}/10`}</strong><span>+${assessmentCredits(a)} credits</span><small>Rules ${a.ruleVersion||1}${rewardReviewStale(a)?' · evidence changed; recalculating':''}</small><p>${escapeHtml(a.note||(a.ruleVersion===3?'Calculated automatically from recorded evidence.':'Daily evidence reviewed'))}</p></article>`).join('')}</div>`;
}
function latestRewardEvidenceDate() {
  const s=journalRewardStore(),tasks=typeof taskState==='undefined'?{}:taskState;
  const dates=[
    ...(s.entries||[]).map(item=>item.date),
    ...(s.records||[]).map(item=>item.date),
    ...(s.actions||[]).map(item=>item.completedAt?toDateKey(item.completedAt):''),
    ...(s.innerCommand?.containmentDays||[]).map(item=>item.date),
    ...(typeof careerState==='undefined'?[]:(careerState.activityLog||[]).map(item=>item.date)),
    ...(tasks.launch?.marketEvents||[]).map(item=>item.date),
    ...(tasks.launch?.mockSessions||[]).map(item=>item.date),
    ...(tasks.rhythm?.events||[]).map(item=>item.date),
    ...(tasks.money?.contacts||[]).map(item=>item.date),
  ].filter(date=>date&&date<=toDateKey()).sort();
  return dates.at(-1)||toDateKey();
}
function rewardNoticeText(gate,review) {
  if(review)return 'Review is saved locally. Recalculate after new evidence is added.';
  if(!gate.pointsMet)return `Add ${gate.remainingPoints} more supported evidence point${gate.remainingPoints===1?'':'s'}, then confirm the review.`;
  if(!gate.groundedMet)return 'Complete at least one Career, Launch or Responsibility action, then confirm the review.';
  return 'Ready. Confirm this daily review to add credits immediately on this device.';
}
function renderJournalRewards() {
  if(typeof refreshAutomaticRewardAssessments==='function')refreshAutomaticRewardAssessments();
  const s=journalRewardStore(),stats=journalRewardStats(),c=covenantStats(),date=rewardSelectedDate||latestRewardEvidenceDate(),e=rewardEvidence(date),review=s.dailyAssessments.find(a=>a.date===date),gate=rewardQualification(e);
  const displayCategories=e.ruleVersion===3?REWARD_CATEGORIES:LEGACY_REWARD_CATEGORIES;
  const target=JOURNAL_REWARDS.find(r=>r.id===s.rewardTarget)||JOURNAL_REWARDS[0],eligibility=rewardEligibility(target);
  const week=rewardWeekKey(toDateKey()),weekDates=Array.from({length:7},(_,i)=>rewardDateAdd(week,i));
  rewardsView.innerHTML=`<header class="reward-hero"><div><p class="section-kicker">EFFORT / CONSISTENCY / ENJOYMENT</p><h1>Make room for earned enjoyment.</h1><p>Rest, meals, sleep, ordinary walks and supportive contact are always available.</p><span role="status">${escapeHtml(rewardCloudNotice||'Saved locally · cloud confirmation required for redemption')}</span></div><div><small>AVAILABLE CREDITS</small><strong>${stats.balance}</strong><span>${stats.earned} earned · ${stats.spent} reserved or spent</span></div></header>
    <div class="reward-focus"><section><p class="section-kicker">YOUR NEXT REWARD</p><label for="reward-target">Working toward</label><select id="reward-target">${JOURNAL_REWARDS.map(r=>`<option value="${r.id}" ${r.id===target.id?'selected':''}>${r.title}</option>`).join('')}</select><progress max="${target.cost}" value="${Math.min(stats.balance,target.cost)}"></progress><p>${Math.max(0,target.cost-stats.balance)} credits remaining</p></section><section><p class="section-kicker">THIS WEEK</p><div class="reward-week">${weekDates.map(d=>{const a=s.dailyAssessments.find(x=>x.date===d);return `<div class="${d>toDateKey()?'future':a?.qualified?'qualified':a?'partial':'unknown'}"><small>${getDateFromKey(d).toLocaleDateString(undefined,{weekday:'short'})}</small><strong>${d>toDateKey()?'—':a?`+${assessmentCredits(a)}`:'?'}</strong><span>${a?'Calculated':d>toDateKey()?'Ahead':'Unrecorded'}</span></div>`}).join('')}</div><p>Five evidence days earn an eight-credit consistency bonus.</p></section></div>
    <section class="reward-review"><header><div><p class="section-kicker">${e.ruleVersion===3?'AUTOMATIC EVIDENCE':'HISTORICAL EVIDENCE'}</p><h2>${e.total} ${e.ruleVersion===3?'credits calculated':'evidence points'} for ${formatDateKey(date)}</h2><p>${e.workspaces.length} KRYOS areas contributed${e.deduction?` · ${e.deduction} deducted for recorded drift`:''}.</p></div><input id="reward-date" type="date" max="${toDateKey()}" value="${date}" aria-label="Evidence date"></header><div class="reward-gates"><div class="${e.scores.foundation?'met':''}"><i></i><span>Foundation</span><strong>${e.scores.foundation||0}/${displayCategories.foundation.cap}</strong></div><div class="${gate.groundedMet?'met':''}"><i></i><span>Purpose and responsibility</span><strong>${(e.scores.career||0)+(e.scores.launch||0)+(e.scores.responsibility||0)}</strong></div><div class="${e.total?'met':''}"><i></i><span>${e.ruleVersion===3?'Automatic result':'Historical result'}</span><strong>+${assessmentCredits(e)} credits</strong></div></div><div class="reward-evidence">${Object.entries(displayCategories).filter(([,category])=>category.cap>0).map(([key,category])=>{const rows=e.buckets[key]||[],score=e.scores[key]||0;return `<details><summary><span>${category.title}</span><b>${score}/${category.cap}</b><progress max="${category.cap}" value="${score}"></progress></summary>${rows.length?rows.map(row=>`<p>${escapeHtml(row.title)}<small>${row.points?`+${row.points} · `:''}${escapeHtml(row.source||'KRYOS')}</small></p>`).join(''):'<p>No qualifying evidence recorded.</p>'}</details>`}).join('')}</div><footer><span>Rules ${e.ruleVersion}${e.ruleVersion===3?' · recalculated automatically when evidence changes':' · preserved historical calculation'}</span></footer><p role="status">${escapeHtml(rewardNotice||(e.ruleVersion===3?'No manual daily review is required.':'Historical days retain their original rules.'))}</p></section>
    <section class="reward-covenant"><div><p class="section-kicker">48-DAY DEVI SADHANA</p><h2>${c.unlocked?'Journey evidence complete':'Build the identity one truthful day at a time'}</h2><p>${c.qualified}/${COVENANT.requiredDays} aligned days · ${c.breaches} drift days recorded · ${c.remaining} remaining · ends November 12</p><p>Recorded drift gently reduces that day’s earnings and never removes earlier wallet points.</p></div><div class="reward-covenant-grid">${Array.from({length:COVENANT.requiredDays},(_,i)=>`<i class="${i<c.qualified?'kept':''}" title="${i+1} of ${COVENANT.requiredDays} days">${i+1}</i>`).join('')}</div></section>
    <section class="life-section"><h2>Choose your reward</h2><div class="reward-grid">${JOURNAL_REWARDS.map(r=>{const gate=rewardEligibility(r),ready=stats.balance>=r.cost&&gate.allowed;return `<article class="reward-card ${ready?'ready':''}"><span>${r.tier}</span><h3>${r.title}</h3><strong>${r.cost} credits</strong><small>${r.days?`${r.days} qualifying days`:'Daily credit balance'}${r.cooldownDays?` · ${r.cooldownDays}-day cooldown`:''}${r.span?' · across three weeks':''}</small><button class="${ready?'primary-button':'secondary-button'}" data-journal-reward="${r.id}" ${ready?'':'disabled'}>${ready?'Request reward':gate.missingCooldown?`${gate.missingCooldown} cooldown days remaining`:gate.missingDays?`${gate.missingDays} days remaining`:gate.missingSpan?`${gate.missingSpan} calendar days remaining`:`${r.cost-stats.balance} credits remaining`}</button></article>`}).join('')}</div></section>
    <section class="life-section"><h2>Calculated evidence</h2>${assessmentRows()}</section><section class="life-section"><header class="life-heading"><div><h2>Reward ledger</h2><p>${syncState?.status==='connected'?'Cloud account connected':'Cloud sign-in is required once per browser.'}</p></div><div class="reward-ledger-actions"><button class="secondary-button" data-reward-settings>Cloud settings</button><button class="secondary-button" data-reward-sync ${rewardCloudBusy?'disabled':''}>${rewardCloudBusy?'Syncing...':'Sync reward ledger'}</button></div></header><p class="reward-ledger-status" role="status">${escapeHtml(rewardCloudNotice||'Recorded evidence creates credits automatically.')}</p>${s.rewardRedemptions.length?s.rewardRedemptions.slice().reverse().map(r=>`<div class="life-row"><span>${escapeHtml(r.title)} · ${escapeHtml(r.status||'legacy redemption')}</span><strong>${r.cost} credits</strong></div>`).join(''):'<p>No rewards requested yet.</p>'}</section>`;
}
document.addEventListener('change',event=>{
  if(event.target.id==='reward-target'){lifeStore().rewardTarget=event.target.value;saveTasks();renderJournalRewards();}
  if(event.target.id==='reward-date'){rewardSelectedDate=event.target.value;renderJournalRewards();}
});
document.addEventListener('click',async event=>{
  const review=event.target.closest('[data-reward-review]');
  if(review){try{reviewRewardDay(review.dataset.rewardReview);rewardNotice='Review saved. Credits updated.';}catch(error){rewardNotice=error.message;}renderJournalRewards();await syncRewardLedger();return;}
  if(event.target.closest('[data-reward-sync]')){await syncRewardLedger();return;}
  if(event.target.closest('[data-reward-settings]')){setPage('settings');return;}
  const button=event.target.closest('[data-journal-reward]'); if(!button||currentPage!=='rewards')return;
  const reward=JOURNAL_REWARDS.find(r=>r.id===button.dataset.journalReward);
  if(!reward||journalRewardStats().balance<reward.cost||!rewardEligibility(reward).allowed)return;
  if(!confirm(`Request ${reward.title} for ${reward.cost} credits?`))return;
  lifeStore().rewardRedemptions.push({id:createId(),rewardId:reward.id,title:reward.title,cost:reward.cost,date:toDateKey(),status:'pending',createdAt:new Date().toISOString()});
  saveTasks();renderJournalRewards();await syncRewardLedger();
});
