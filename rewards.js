const JOURNAL_REWARDS = [
  { id:'video', title:'One bounded enjoyable video', cost:2, tier:'Short reset' },
  { id:'music', title:'One 30-minute music session', cost:4, days:2, cooldownDays:3, tier:'Occasional reset' },
  { id:'snack', title:'Special snack', cost:4, tier:'Small treat' },
  { id:'leisure', title:'Optional extended leisure', cost:5, tier:'Restoration' },
  { id:'meal', title:'Favorite meal', cost:10, days:5, tier:'Weekly' },
  { id:'movie', title:'Movie night', cost:10, days:5, tier:'Weekly' },
  { id:'friends', title:'Planned extended friend time', cost:15, days:8, tier:'Milestone' },
  { id:'celebration', title:'Celebration or budgeted basket purchase', cost:25, days:12, span:21, tier:'Major milestone' },
];
const COVENANT = { start:'2026-09-19', requiredDays:45 };
let rewardSelectedDate = '';
let rewardNotice = '';

function journalRewardStore() { const s=lifeStore(); s.rewardRedemptions ||= []; s.dailyAssessments ||= []; return s; }
function rewardDateAdd(key, days) { const d=new Date(`${key}T12:00:00`); d.setDate(d.getDate()+days); return toDateKey(d); }
function rewardWeekKey(key) { const d=new Date(`${key}T12:00:00`); return rewardDateAdd(key,-((d.getDay()+6)%7)); }
function assessmentCredits(a) {
  if (!a?.qualified) return 0;
  if (a.ruleVersion===2) return a.total>=9?3:a.total>=7?2:a.total>=5?1:0;
  return a.total>=9?2:a.total>=7?1:0;
}
function weeklyConsistencyBonuses(assessments) {
  const weeks=new Map();
  [...new Map(assessments.map(a=>[a.date,a])).values()].filter(a=>a.qualified).forEach(a=>{
    const key=rewardWeekKey(a.date),row=weeks.get(key)||{week:key,days:0,modern:false};
    row.days++; row.modern ||= a.ruleVersion===2; weeks.set(key,row);
  });
  return [...weeks.values()].map(row=>({...row,credits:row.modern?(row.days>=5?2:0):(row.days>=7?5:row.days===6?3:row.days===5?2:0)}));
}
function journalRewardStats() {
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
    if(breach)breaches++; if(kept)qualified++; if(qualified===45&&!readyDate)readyDate=date;
  });
  const reviewApproved=!!readyDate&&reviews.some(a=>a.date>=readyDate&&a.date<=today&&a.covenantReviewApproved);
  return {qualified,breaches,reviewApproved,unlocked:qualified>=45&&reviewApproved,remaining:Math.max(0,45-qualified),readyDate,start};
}
function assessmentRows() {
  const rows=[...journalRewardStore().dailyAssessments].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);
  if(!rows.length)return '<p class="life-empty">No reviewed days yet. Journal evidence alone does not create credits.</p>';
  return `<div class="reward-audit">${rows.map(a=>`<article><time>${escapeHtml(a.date)}</time><strong>${a.total}/10</strong><span>+${assessmentCredits(a)} credits</span><small>Rules ${a.ruleVersion||1}${rewardReviewStale(a)?' · evidence changed; review again':''}</small><p>${escapeHtml(a.note||'Daily evidence reviewed')}</p></article>`).join('')}</div>`;
}
function renderJournalRewards() {
  const s=journalRewardStore(),stats=journalRewardStats(),c=covenantStats(),date=rewardSelectedDate||toDateKey(),e=rewardEvidence(date),review=s.dailyAssessments.find(a=>a.date===date);
  const target=JOURNAL_REWARDS.find(r=>r.id===s.rewardTarget)||JOURNAL_REWARDS[0],eligibility=rewardEligibility(target);
  const week=rewardWeekKey(toDateKey()),weekDates=Array.from({length:7},(_,i)=>rewardDateAdd(week,i));
  rewardsView.innerHTML=`<header class="reward-hero"><div><p class="section-kicker">EFFORT / CONSISTENCY / ENJOYMENT</p><h1>Make room for earned enjoyment.</h1><p>Rest, meals, sleep, ordinary walks and supportive contact are always available.</p><span role="status">${escapeHtml(rewardCloudNotice||'Saved locally · cloud confirmation required for redemption')}</span></div><div><small>AVAILABLE CREDITS</small><strong>${stats.balance}</strong><span>${stats.earned} earned · ${stats.spent} reserved or spent</span></div></header>
    <div class="reward-focus"><section><p class="section-kicker">YOUR NEXT REWARD</p><label for="reward-target">Working toward</label><select id="reward-target">${JOURNAL_REWARDS.map(r=>`<option value="${r.id}" ${r.id===target.id?'selected':''}>${r.title}</option>`).join('')}</select><progress max="${target.cost}" value="${Math.min(stats.balance,target.cost)}"></progress><p>${Math.max(0,target.cost-stats.balance)} credits remaining${eligibility.missingDays?` · ${eligibility.missingDays} qualifying days remaining`:''}${eligibility.missingSpan?` · ${eligibility.missingSpan} calendar days remaining`:''}</p></section><section><p class="section-kicker">THIS WEEK</p><div class="reward-week">${weekDates.map(d=>{const a=s.dailyAssessments.find(x=>x.date===d);return `<div class="${d>toDateKey()?'future':a?.qualified?'qualified':a?'partial':'unknown'}"><small>${getDateFromKey(d).toLocaleDateString(undefined,{weekday:'short'})}</small><strong>${d>toDateKey()?'—':a?`+${assessmentCredits(a)}`:'?'}</strong><span>${a?'Reviewed':d>toDateKey()?'Ahead':'Unreviewed'}</span></div>`}).join('')}</div><p>Five qualifying days earn two consistency credits.</p></section></div>
    <section class="reward-review"><header><div><p class="section-kicker">ONE REVIEW ACROSS KRYOS</p><h2>${e.total}/10 supported on ${formatDateKey(date)}</h2></div><input id="reward-date" type="date" max="${toDateKey()}" value="${date}" aria-label="Review date"></header><div class="reward-evidence">${Object.entries(REWARD_CATEGORIES).map(([key,category])=>`<details><summary><span>${category.title}</span><b>${e.scores[key]}/${category.cap}</b><progress max="${category.cap}" value="${e.scores[key]}"></progress></summary>${e.buckets[key].length?e.buckets[key].map(row=>`<p>${escapeHtml(row.title)}</p>`).join(''):'<p>No qualifying evidence recorded.</p>'}</details>`).join('')}</div><footer><span>${review?`Reviewed under rules ${review.ruleVersion||1}`:'Awaiting review'} · ${e.qualified?assessmentCredits(e):0} proposed credits</span><button class="primary-button" data-reward-review="${date}" ${review&&review.ruleVersion!==2?'disabled':''}>${review?'Review updated evidence':'Confirm daily review'}</button></footer><p role="status">${escapeHtml(rewardNotice)}</p></section>
    <section class="reward-covenant"><div><p class="section-kicker">PROTECTED / 45 REVIEWED DAYS</p><h2>${c.unlocked?'Astrology review approved':'Astrology remains protected'}</h2><p>${c.qualified}/45 kept days · ${c.breaches} lapses recorded · ${c.remaining} days remaining</p><p>A lapse pauses accumulation. Unknown days remain unknown. Credits cannot bypass this boundary.</p></div><div class="reward-covenant-grid">${Array.from({length:45},(_,i)=>`<i class="${i<c.qualified?'kept':''}" title="${i+1} of 45 reviewed days">${i+1}</i>`).join('')}</div></section>
    <section class="life-section"><h2>Choose your reward</h2><div class="reward-grid">${JOURNAL_REWARDS.map(r=>{const gate=rewardEligibility(r),ready=stats.balance>=r.cost&&gate.allowed;return `<article class="reward-card ${ready?'ready':''}"><span>${r.tier}</span><h3>${r.title}</h3><strong>${r.cost} credits</strong><small>${r.days?`${r.days} qualifying days`:'Daily credit balance'}${r.cooldownDays?` · ${r.cooldownDays}-day cooldown`:''}${r.span?' · across three weeks':''}</small><button class="${ready?'primary-button':'secondary-button'}" data-journal-reward="${r.id}" ${ready?'':'disabled'}>${ready?'Request reward':gate.missingCooldown?`${gate.missingCooldown} cooldown days remaining`:gate.missingDays?`${gate.missingDays} days remaining`:gate.missingSpan?`${gate.missingSpan} calendar days remaining`:`${r.cost-stats.balance} credits remaining`}</button></article>`}).join('')}</div></section>
    <section class="life-section"><h2>Reviewed discipline</h2>${assessmentRows()}</section><section class="life-section"><header class="life-heading"><div><h2>Reward ledger</h2><p>${syncState?.status==='connected'?'Cloud account connected':'Cloud sign-in is required once per browser.'}</p></div><div class="reward-ledger-actions"><button class="secondary-button" data-reward-settings>Cloud settings</button><button class="secondary-button" data-reward-sync ${rewardCloudBusy?'disabled':''}>${rewardCloudBusy?'Syncing...':'Sync reward ledger'}</button></div></header><p class="reward-ledger-status" role="status">${escapeHtml(rewardCloudNotice||'Confirm a qualifying daily review before credits can be added.')}</p>${s.rewardRedemptions.length?s.rewardRedemptions.slice().reverse().map(r=>`<div class="life-row"><span>${escapeHtml(r.title)} · ${escapeHtml(r.status||'legacy redemption')}</span><strong>${r.cost} credits</strong></div>`).join(''):'<p>No rewards requested yet.</p>'}</section>`;
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
