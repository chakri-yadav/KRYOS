const REWARD_RULE_VERSION = 3;
const REWARD_V3_START = '2026-09-26';
const LEGACY_REWARD_CATEGORIES = {
  launch: { title: 'Career Launch', cap: 3 }, career: { title: 'Career Skills', cap: 2 },
  responsibility: { title: 'Responsibilities', cap: 1 }, foundation: { title: 'Health & care', cap: 1 },
  spiritual: { title: 'Spiritual practice', cap: 1 }, containment: { title: 'Containment', cap: 1 },
  closure: { title: 'Honest closure', cap: 1 },
};
const REWARD_CATEGORIES = {
  foundation: { title: 'Nourishment', cap: 20 }, care: { title: 'Skincare', cap: 6 },
  spiritual: { title: 'Spiritual practice', cap: 14 }, career: { title: 'Career', cap: 12 },
  launch: { title: 'Launch', cap: 16 }, articulation: { title: 'Articulation', cap: 10 },
  maintenance: { title: 'Weekly body & home care', cap: 16 },
  responsibility: { title: 'Important actions', cap: 6 }, containment: { title: 'Inner Command', cap: 0 },
  closure: { title: 'Journal evidence', cap: 0 },
};
const REWARD_WORKSPACES = ['Inner Command', 'Actions', 'Career', 'Launch', 'Rhythm', 'Money'];

function legacyRewardEvidence(date) {
  const life = lifeStore(), tasks = typeof taskState === 'undefined' ? {} : taskState;
  const buckets = Object.fromEntries(Object.keys(LEGACY_REWARD_CATEGORIES).map(key => [key, []]));
  const seen = new Set();
  const add = (category, id, title, source) => {
    if (!id || seen.has(id)) return;
    seen.add(id); buckets[category].push({ id, title, source });
  };
  (tasks.launch?.marketEvents || []).filter(e => e.date === date).forEach(e => {
    if (['application','connection','message','followup','comment','referral','conversation'].includes(e.type) || (e.type === 'post' && e.status === 'published'))
      add('launch', `launch:${e.id}`, e.topic || e.note || e.type, 'Launch');
  });
  (tasks.launch?.mockSessions || []).filter(e => e.date === date && e.minutes > 0).forEach(e => add('launch', `mock:${e.id}`, e.focus || 'Interview rehearsal', 'Launch'));
  if (typeof careerState !== 'undefined') (careerState.activityLog || []).filter(e => e.date === date && (e.checkId || e.eventType === 'module-complete')).forEach(e => add('career', `career:${e.id}`, e.checkText || e.moduleTitle || 'Completed career step', 'Career'));
  (life.actions || []).filter(e => {
    if (e.status !== 'done' || !e.completedAt || toDateKey(e.completedAt) !== date) return false;
    if (!['critical', 'important'].includes(e.priority) || !e.deadline) return false;
    return toDateKey(e.completedAt) <= e.deadline;
  }).forEach(e => add('responsibility', `action:${e.externalId || e.id}`, `${e.title} · on-time ${e.priority} deadline`, 'Actions'));
  (tasks.money?.contacts || []).filter(e => e.date === date).slice(0,1).forEach(e => add('responsibility', `money:${e.id}`, 'Financial follow-up', 'Money'));
  (tasks.rhythm?.events || []).filter(e => e.date === date && e.value > 0).forEach(e => {
    const habit = typeof rhythmHabit === 'function' ? rhythmHabit(e.habitId) : null;
    if (habit?.group === 'spirit') add('spiritual', `rhythm:${e.id}`, habit.title, 'Rhythm');
  });
  if (typeof rhythmDay === 'function' && rhythmDay(date).qualified) add('foundation', `foundation:${date}`, 'Daily foundation met', 'Rhythm');
  (life.records || []).filter(e => e.date === date && e.completed).forEach(e => {
    // An explicit source link prevents the same event earning through two pages.
    if (e.sourceRef && seen.has(e.sourceRef)) return;
    const category = e.domain === 'Career' ? 'career' : e.domain === 'Job applications' ? 'launch' : e.domain === 'Personal tasks' ? 'responsibility' : e.domain === 'Spiritual practice' ? 'spiritual' : null;
    if (category) add(category, e.sourceRef || (e.actionRef ? `action:${e.actionRef}` : `journal:${e.id}`), e.title, 'Inner Command');
  });
  const day = (life.innerCommand?.containmentDays || []).find(e => e.date === date);
  if (day?.status === 'kept' && !(life.dailyAssessments || []).some(e => e.date === date && e.astrologySeeking)) add('containment', `containment:${date}`, 'Boundaries reviewed and kept', 'Inner Command');
  if ((life.entries || []).some(e => e.date === date && e.text?.trim())) add('closure', `closure:${date}`, 'Journal recorded', 'Inner Command');
  const scores = Object.fromEntries(Object.entries(buckets).map(([key, rows]) => [key, Math.min(LEGACY_REWARD_CATEGORIES[key].cap, rows.length)]));
  const total = Object.values(scores).reduce((a,b) => a+b,0);
  const qualified = total >= 5 && scores.launch + scores.career + scores.responsibility > 0;
  const workspaces = [...new Set(Object.values(buckets).flat().map(item => item.source).filter(Boolean))];
  return { date, buckets, scores, total, qualified, workspaces, ruleVersion: 2 };
}

function rewardEvidence(date) {
  if (date < REWARD_V3_START) return legacyRewardEvidence(date);
  const life=lifeStore(),tasks=typeof taskState==='undefined'?{}:taskState;
  const buckets=Object.fromEntries(Object.keys(REWARD_CATEGORIES).map(key=>[key,[]]));
  const scores=Object.fromEntries(Object.keys(REWARD_CATEGORIES).map(key=>[key,0]));
  const seen=new Set();
  const add=(category,id,title,source,points)=>{
    if(!id||seen.has(id)||!REWARD_CATEGORIES[category])return;
    seen.add(id); buckets[category].push({id,title,source,points});
    scores[category]=Math.min(REWARD_CATEGORIES[category].cap,scores[category]+points);
  };

  const value=id=>typeof rhythmValue==='function'?rhythmValue(id,date):0;
  const meals=['breakfast','lunch','dinner'].filter(id=>value(id)>0);
  if(meals.length>=2)add('foundation',`meals:${date}`,'Two meals recorded','Rhythm',6);
  if(value('protein')>0)add('foundation',`protein:${date}`,'Protein shake','Rhythm',5);
  if(value('supplements')>0)add('foundation',`supplements:${date}`,'Supplement routine','Rhythm',3);
  if(value('water')>=3)add('foundation',`water:${date}`,'3 L water','Rhythm',6);

  const skincare=['face-wash','moisturizer','serum','eye-cream','sunscreen'].filter(id=>value(id)>0);
  if(skincare.length>=2)add('care',`skincare:${date}`,'Two skincare steps','Rhythm',6);

  const rhythmEvents=tasks.rhythm?.events||[];
  const daysAgo=n=>{const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()-n);return toDateKey(d);};
  const recentTotal=(habitId,days=6)=>rhythmEvents.filter(e=>e.habitId===habitId&&e.date>=daysAgo(days)&&e.date<date).reduce((sum,e)=>sum+Number(e.value||0),0);
  const exerciseUnits=Math.min(Number(value('exercise')||0),Math.max(0,2-recentTotal('exercise')));
  if(exerciseUnits)add('maintenance',`exercise:${date}`,`${exerciseUnits} exercise ${exerciseUnits===1?'session':'sessions'} toward rolling target`,'Rhythm',exerciseUnits*4);
  if(value('hair-care')>0&&recentTotal('hair-care')===0)add('maintenance',`hair:${date}`,'Weekly shampoo and conditioner care','Rhythm',3);
  if(value('groceries')>0&&recentTotal('groceries')===0)add('maintenance',`groceries:${date}`,'Groceries restocked for the next 7–10 days','Rhythm',5);

  const spirit=['pranayama','meditation','aditya','gita','chalisa'].filter(id=>value(id)>0);
  const spiritPoints=[0,3,8,10,12,14][spirit.length]??14;
  if(spiritPoints)add('spiritual',`spirit:${date}`,`${spirit.length} spiritual ${spirit.length===1?'practice':'practices'}`,'Rhythm',spiritPoints);

  const career=(typeof careerState==='undefined'?[]:(careerState.activityLog||[])).filter(e=>e.date===date&&(e.checkId||e.eventType==='module-complete'));
  if(career.length)add('career',`career-day:${date}`,career[0].checkText||career[0].moduleTitle||'Meaningful Career outcome','Career',12);

  const launch=(tasks.launch?.marketEvents||[]).filter(e=>e.date===date&&(['application','connection','message','followup','comment','referral','conversation'].includes(e.type)||(e.type==='post'&&e.status==='published')));
  if(launch.length)add('launch',`launch-day:${date}`,launch[0].topic||launch[0].note||'Meaningful Launch outcome','Launch',12);
  if(career.length&&launch.length)add('launch',`purpose-combination:${date}`,'Career and Launch combination','Purpose Work',4);

  const mocks=(tasks.launch?.mockSessions||[]).filter(e=>e.date===date&&(Number(e.minutes||0)>0||e.completed));
  if(mocks.length){
    const level=mocks.some(e=>e.level==='large'||e.serious===true)?'large':mocks.some(e=>e.level==='medium'||Number(e.minutes||0)>=10)?'medium':'small';
    const points={small:2,medium:6,large:10}[level];
    add('articulation',`articulation:${date}`,`${level[0].toUpperCase()+level.slice(1)} articulation`,'Career',points);
  }

  (life.actions||[]).filter(e=>e.status==='done'&&e.completedAt&&toDateKey(e.completedAt)===date&&['critical','important'].includes(e.priority)).forEach(e=>{
    const onTime=!e.deadline||date<=e.deadline,late=!!e.deadline&&date>e.deadline;
    const points=late?1:e.priority==='critical'?(onTime&&e.deadline?4:3):(onTime&&e.deadline?3:2);
    add('responsibility',`action:${e.externalId||e.id}`,e.title,'Actions',points);
  });

  const day=(life.innerCommand?.containmentDays||[]).find(e=>e.date===date);
  const boundarySet=new Set([...(day?.boundaries||[]),day?.boundary].filter(Boolean));
  const gross=Object.values(scores).reduce((sum,n)=>sum+n,0);
  const deductionRate=Math.min(.20,boundarySet.size*.05);
  const deduction=Math.floor(gross*deductionRate);
  const total=Math.max(0,gross-deduction);
  const workspaces=[...new Set(Object.values(buckets).flat().map(item=>item.source).filter(Boolean))];
  return {date,buckets,scores,gross,deduction,deductionRate,total,qualified:total>0,workspaces,ruleVersion:3};
}

function rewardQualification(evidence) {
  if(evidence.ruleVersion===3)return {pointsMet:evidence.total>0,groundedMet:evidence.scores.career+evidence.scores.launch+evidence.scores.responsibility>0,remainingPoints:0,qualified:evidence.total>0};
  const grounded = evidence.scores.launch + evidence.scores.career + evidence.scores.responsibility;
  return {
    pointsMet: evidence.total >= 5,
    groundedMet: grounded > 0,
    remainingPoints: Math.max(0, 5 - evidence.total),
    qualified: evidence.total >= 5 && grounded > 0,
  };
}

function reviewRewardDay(date, note = '') {
  if (!lifeDate(date) || date > toDateKey()) throw new Error('Choose today or an earlier date.');
  const store = lifeStore(), existing = store.dailyAssessments.find(e => e.date === date);
  if (existing && existing.ruleVersion !== rewardEvidence(date).ruleVersion) throw new Error('This day retains its original reward rules.');
  const evidence = rewardEvidence(date);
  const review = { ...evidence, evidenceIds: Object.values(evidence.buckets).flat().map(e => e.id).sort(), note, reviewedAt: new Date().toISOString(), revision: (existing?.revision || 0) + 1 };
  delete review.buckets;
  upsertDailyAssessment(store, review);
  saveTasks();
  return review;
}

function rewardEvidenceDates() {
  const life=lifeStore(),tasks=typeof taskState==='undefined'?{}:taskState;
  return [...new Set([
    ...(tasks.rhythm?.events||[]).map(e=>e.date),
    ...(tasks.launch?.marketEvents||[]).map(e=>e.date),
    ...(tasks.launch?.mockSessions||[]).map(e=>e.date),
    ...(life.actions||[]).map(e=>e.completedAt?toDateKey(e.completedAt):''),
    ...(life.innerCommand?.containmentDays||[]).map(e=>e.date),
    ...(life.dailyAssessments||[]).filter(e=>e.ruleVersion===3).map(e=>e.date),
    ...(typeof careerState==='undefined'?[]:(careerState.activityLog||[]).map(e=>e.date)),
  ].filter(date=>date>=REWARD_V3_START&&date<=toDateKey()))].sort();
}

function refreshAutomaticRewardAssessments() {
  const store=lifeStore(); let changed=false;
  rewardEvidenceDates().forEach(date=>{
    const evidence=rewardEvidence(date),existing=store.dailyAssessments.find(e=>e.date===date);
    const evidenceIds=Object.values(evidence.buckets).flat().map(e=>e.id).sort();
    const signature=JSON.stringify({scores:evidence.scores,total:evidence.total,gross:evidence.gross,deduction:evidence.deduction,evidenceIds});
    if(existing?.ruleVersion===3&&existing.signature===signature)return;
    const next={...evidence,evidenceIds,signature,note:'Calculated automatically from recorded evidence.',reviewedAt:new Date().toISOString(),revision:(existing?.revision||0)+1};
    delete next.buckets; upsertDailyAssessment(store,next); changed=true;
  });
  if(changed)saveTasks();
  return changed;
}

function rewardReviewStale(review) {
  if (review.ruleVersion === 3) return review.signature!==JSON.stringify({scores:rewardEvidence(review.date).scores,total:rewardEvidence(review.date).total,gross:rewardEvidence(review.date).gross,deduction:rewardEvidence(review.date).deduction,evidenceIds:Object.values(rewardEvidence(review.date).buckets).flat().map(e=>e.id).sort()});
  if (review.ruleVersion !== 2) return false;
  const current = rewardEvidence(review.date);
  return JSON.stringify(current.scores) !== JSON.stringify(review.scores) || JSON.stringify(Object.values(current.buckets).flat().map(e => e.id).sort()) !== JSON.stringify(review.evidenceIds);
}

function rewardEligibility(reward) {
  const store = lifeStore();
  const days = [...new Set(store.dailyAssessments.filter(a => a.qualified && a.date <= toDateKey()).map(a => a.date))].sort();
  const span = days.length ? Math.floor((new Date(`${days.at(-1)}T12:00:00`) - new Date(`${days[0]}T12:00:00`))/86400000)+1 : 0;
  const missingDays = Math.max(0,(reward.days || 0)-days.length);
  const missingSpan = Math.max(0,(reward.span || 0)-span);
  const lastRedemption = (store.rewardRedemptions || []).filter(item => item.rewardId === reward.id && !['rejected','cancelled'].includes(item.status)).sort((a,b) => b.date.localeCompare(a.date))[0];
  const daysSince = lastRedemption ? Math.floor((getDateFromKey(toDateKey()) - getDateFromKey(lastRedemption.date))/86400000) : Infinity;
  const missingCooldown = Math.max(0,(reward.cooldownDays || 0)-daysSince);
  return { allowed: !missingDays && !missingSpan && !missingCooldown, missingDays, missingSpan, missingCooldown };
}

let rewardCloudNotice = '';
let rewardCloudBusy = false;
async function syncRewardLedger() {
  if (rewardCloudBusy) return;
  if (typeof getSupabaseClient !== 'function') {
    rewardCloudNotice = 'Credits are saved on this device. Cloud tools are unavailable in this build.';
    if (typeof currentPage !== 'undefined' && currentPage === 'rewards') renderJournalRewards();
    return;
  }
  rewardCloudBusy = true;
  rewardCloudNotice = 'Syncing reward ledger...';
  if (typeof currentPage !== 'undefined' && currentPage === 'rewards') renderJournalRewards();
  try {
    const session = await getSupabaseSession();
    if (!session) {
      rewardCloudNotice = 'Credits saved on this device. Sign in under Cloud settings when you want to mirror the ledger.';
      return;
    }
    const profile = await ensureSupabaseProfile(session), store = lifeStore();
    const awards = store.dailyAssessments.filter(a => a.date <= toDateKey()).map(a => ({ id: `day:${a.date}`, amount: assessmentCredits(a), revision: a.revision || 1 }));
    weeklyConsistencyBonuses(store.dailyAssessments).forEach(w => awards.push({ id:`week:${w.week}`, amount:w.credits, revision: (w.sourceDates||[]).map(date=>store.dailyAssessments.find(a=>a.date===date)).filter(Boolean).reduce((n,a)=>n+(a.revision||1),0)||1 }));
    const requests = store.rewardRedemptions.filter(r => r.status === 'pending');
    // Each request is retried with the same ID; the server serializes account updates.
    const jobs = requests.length ? requests : [null];
    for (const request of jobs) {
      const { data, error } = await getSupabaseClient().rpc('kryos_reward_transaction', { p_profile: profile, p_awards: awards, p_request: request ? { id:request.id, cost:request.cost, title:request.title, rewardId:request.rewardId, date:request.date } : null });
      if (error) throw new Error(`Credits saved locally. Cloud ledger needs attention: ${error.message || 'transaction unavailable'}`);
      store.rewardCloudBalance = data.balance;
      if (request) request.status = data.accepted ? 'confirmed' : 'rejected';
      store.rewardCloudSyncedAt = new Date().toISOString();
    }
    saveTasks();
    const credited = awards.reduce((sum, award) => sum + Number(award.amount || 0), 0);
    rewardCloudNotice = credited
      ? `Reward ledger synced. ${store.rewardCloudBalance} cloud credits confirmed.`
      : 'Cloud connected. Recorded evidence will sync automatically.';
  } catch (error) { rewardCloudNotice = error.message; }
  finally { rewardCloudBusy = false; if (typeof currentPage !== 'undefined' && currentPage === 'rewards') renderJournalRewards(); }
}
