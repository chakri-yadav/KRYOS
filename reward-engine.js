const REWARD_RULE_VERSION = 2;
const REWARD_CATEGORIES = {
  launch: { title: 'Career Launch', cap: 3 }, career: { title: 'Career Skills', cap: 2 },
  responsibility: { title: 'Responsibilities', cap: 1 }, foundation: { title: 'Health & care', cap: 1 },
  spiritual: { title: 'Spiritual practice', cap: 1 }, containment: { title: 'Containment', cap: 1 },
  closure: { title: 'Honest closure', cap: 1 },
};
const REWARD_WORKSPACES = ['Inner Command', 'Actions', 'Career', 'Launch', 'Rhythm', 'Money'];

function rewardEvidence(date) {
  const life = lifeStore(), tasks = typeof taskState === 'undefined' ? {} : taskState;
  const buckets = Object.fromEntries(Object.keys(REWARD_CATEGORIES).map(key => [key, []]));
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
  (life.actions || []).filter(e => e.status === 'done' && e.completedAt && toDateKey(e.completedAt) === date).forEach(e => add('responsibility', `action:${e.externalId || e.id}`, e.title, 'Actions'));
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
  const scores = Object.fromEntries(Object.entries(buckets).map(([key, rows]) => [key, Math.min(REWARD_CATEGORIES[key].cap, rows.length)]));
  const total = Object.values(scores).reduce((a,b) => a+b,0);
  const qualified = total >= 5 && scores.launch + scores.career + scores.responsibility > 0;
  const workspaces = [...new Set(Object.values(buckets).flat().map(item => item.source).filter(Boolean))];
  return { date, buckets, scores, total, qualified, workspaces, ruleVersion: 2 };
}

function rewardQualification(evidence) {
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
  if (existing && existing.ruleVersion !== 2) throw new Error('This day retains its original reward rules.');
  const evidence = rewardEvidence(date);
  const review = { ...evidence, evidenceIds: Object.values(evidence.buckets).flat().map(e => e.id).sort(), note, reviewedAt: new Date().toISOString(), revision: (existing?.revision || 0) + 1 };
  delete review.buckets;
  upsertDailyAssessment(store, review);
  saveTasks();
  return review;
}

function rewardReviewStale(review) {
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
    weeklyConsistencyBonuses(store.dailyAssessments).forEach(w => awards.push({ id:`week:${w.week}`, amount:w.credits, revision: store.dailyAssessments.filter(a => rewardWeekKey(a.date) === w.week).reduce((n,a) => n+(a.revision||1),0) }));
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
      : 'Cloud connected. Nothing to upload until you confirm a qualifying daily review.';
  } catch (error) { rewardCloudNotice = error.message; }
  finally { rewardCloudBusy = false; if (typeof currentPage !== 'undefined' && currentPage === 'rewards') renderJournalRewards(); }
}
