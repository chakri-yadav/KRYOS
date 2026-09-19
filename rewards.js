const JOURNAL_REWARDS = [
  { id: 'video', title: 'One enjoyable short video', cost: 3, tier: 'Quick reset' },
  { id: 'walk', title: 'Unhurried leisure walk', cost: 4, tier: 'Daily restoration' },
  { id: 'friend-call', title: 'Relaxed call with a friend', cost: 6, tier: 'Connection' },
  { id: 'snack', title: 'Special snack', cost: 8, tier: 'Small treat' },
  { id: 'meal', title: 'Favorite meal', cost: 18, tier: 'Weekly' },
  { id: 'movie', title: 'Full movie night', cost: 24, tier: 'Weekly' },
  { id: 'friends', title: 'Extended time with friends', cost: 30, tier: 'Milestone' },
  { id: 'celebration', title: 'Planned celebration or basket purchase', cost: 45, tier: 'Major milestone' },
];

const COVENANT = { start: '2026-09-19', baseEnd: '2026-11-02', requiredDays: 36, breachExtensionDays: 3 };

function journalRewardStore() {
  const store = lifeStore();
  store.rewardRedemptions ||= [];
  store.dailyAssessments ||= [];
  return store;
}

function rewardDateAdd(key, days) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function rewardWeekKey(key) {
  const date = new Date(`${key}T12:00:00`);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return toDateKey(date);
}

function assessmentCredits(assessment) {
  if (!assessment?.qualified) return 0;
  return assessment.total >= 9 ? 2 : assessment.total >= 7 ? 1 : 0;
}

function weeklyConsistencyBonuses(assessments) {
  const weeks = new Map();
  assessments.filter(item => item.qualified).forEach(item => {
    const key = rewardWeekKey(item.date);
    weeks.set(key, (weeks.get(key) || 0) + 1);
  });
  return [...weeks.entries()].map(([week, days]) => ({ week, days, credits: days >= 7 ? 5 : days === 6 ? 3 : days === 5 ? 2 : 0 }));
}

function journalRewardStats() {
  const store = journalRewardStore();
  const daily = store.dailyAssessments.reduce((sum, item) => sum + assessmentCredits(item), 0);
  const weekly = weeklyConsistencyBonuses(store.dailyAssessments).reduce((sum, item) => sum + item.credits, 0);
  const spent = store.rewardRedemptions.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const earned = daily + weekly;
  return { daily, weekly, earned, spent, balance: Math.max(0, earned - spent) };
}

function covenantStats(today = toDateKey()) {
  const assessments = journalRewardStore().dailyAssessments.filter(item => item.date >= COVENANT.start);
  const breaches = assessments.filter(item => item.astrologySeeking).length;
  const end = rewardDateAdd(COVENANT.baseEnd, breaches * COVENANT.breachExtensionDays);
  const qualified = assessments.filter(item => item.date <= end && item.qualified).length;
  const reviewApproved = assessments.some(item => item.covenantReviewApproved);
  const unlocked = today > end && qualified >= COVENANT.requiredDays && reviewApproved;
  return { breaches, end, qualified, reviewApproved, unlocked, remaining: Math.max(0, COVENANT.requiredDays - qualified) };
}

function assessmentRows() {
  const labels = { priority: 'Meaningful priority', resistance: 'Kept commitment', foundation: 'Body foundation', spiritual: 'Spiritual containment', closure: 'Honest closure', containment: 'Stopped avoidance' };
  const assessments = [...journalRewardStore().dailyAssessments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  if (!assessments.length) return '<p class="life-empty">No reviewed days yet. Journal evidence alone does not create credits.</p>';
  return `<div class="assessment-list">${assessments.map(item => `<article><div><time>${escapeHtml(item.date)}</time><strong>${item.total}/10</strong><span class="assessment-status ${item.qualified ? 'qualified' : ''}">${item.qualified ? `Qualified · +${assessmentCredits(item)}` : 'Recorded · +0'}</span></div><div class="assessment-breakdown">${Object.entries(item.scores).map(([key, value]) => `<span>${escapeHtml(labels[key])}<b>${value}</b></span>`).join('')}</div>${item.note ? `<p>${escapeHtml(item.note)}</p>` : ''}</article>`).join('')}</div>`;
}

function renderJournalRewards() {
  const store = journalRewardStore();
  const stats = journalRewardStats();
  const covenant = covenantStats();
  const next = JOURNAL_REWARDS.find(reward => reward.cost > stats.balance) || JOURNAL_REWARDS.at(-1);
  rewardsView.innerHTML = `<header class="progress-title"><div><p class="section-kicker">KRYOS / Rewards</p><h1>Evidence first. Privilege follows.</h1></div><span>${stats.balance} credits</span></header>
    <section class="reward-balance"><div><span>Available</span><strong>${stats.balance}</strong><small>reviewed credits</small></div><div class="reward-balance-copy"><p>Completed actions remain evidence. Only a reviewed daily score can earn credits: one credit at 7–8, two at 9–10, never more than two per day.</p><progress max="${next.cost}" value="${Math.min(stats.balance, next.cost)}"></progress><small>${Math.max(0, next.cost - stats.balance)} credits to ${escapeHtml(next.title)}</small></div></section>
    <section class="covenant-card ${covenant.unlocked ? 'complete' : ''}"><div><p class="section-kicker">45-day containment covenant</p><h2>${covenant.unlocked ? 'Astrology session unlocked' : 'Astrology remains protected'}</h2><p>September 19 through ${escapeHtml(covenant.end)}. This privilege cannot be purchased with credits.</p></div><div class="covenant-score"><strong>${covenant.qualified}</strong><span>/ ${COVENANT.requiredDays} qualified days</span></div><div class="covenant-track"><progress max="${COVENANT.requiredDays}" value="${Math.min(covenant.qualified, COVENANT.requiredDays)}"></progress><small>${covenant.breaches ? `${covenant.breaches} breach${covenant.breaches === 1 ? '' : 'es'} · end extended by ${covenant.breaches * COVENANT.breachExtensionDays} days` : 'No astrology-seeking breaches recorded'} · Day-45 review ${covenant.reviewApproved ? 'approved' : 'required'}</small></div></section>
    <section class="life-section"><div class="life-heading"><div><h2>Reviewed discipline</h2><p>Strict scoring, visible reasoning, no points for task inflation.</p></div><span>${stats.daily} daily + ${stats.weekly} consistency</span></div>${assessmentRows()}</section>
    <section class="life-section"><div class="life-heading"><div><h2>Choose a bounded reward</h2><p>Restoration is earned without turning ordinary health needs into punishment.</p></div></div><div class="reward-grid">${JOURNAL_REWARDS.map(reward => `<article class="reward-card ${stats.balance >= reward.cost ? 'ready' : ''}"><div><span>${escapeHtml(reward.tier)}</span><strong>${escapeHtml(reward.title)}</strong></div><div class="reward-cost"><b>${reward.cost}</b><small>credits</small></div><button class="${stats.balance >= reward.cost ? 'primary-button' : 'secondary-button'}" data-journal-reward="${reward.id}" ${stats.balance < reward.cost ? 'disabled' : ''}>${stats.balance >= reward.cost ? 'Redeem' : `${reward.cost - stats.balance} to go`}</button></article>`).join('')}</div></section>
    <section class="life-section"><div class="life-heading"><div><h2>Reward history</h2><p>${stats.earned} earned · ${stats.spent} spent</p></div></div>${store.rewardRedemptions.length ? `<div class="reward-history">${[...store.rewardRedemptions].reverse().map(item => `<div><span>${escapeHtml(item.title)}</span><time>${escapeHtml(item.date)}</time><strong>-${item.cost}</strong></div>`).join('')}</div>` : '<p class="life-empty">Your first redeemed reward will appear here.</p>'}</section>`;
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-journal-reward]');
  if (!button || currentPage !== 'rewards') return;
  const reward = JOURNAL_REWARDS.find(item => item.id === button.dataset.journalReward);
  const stats = journalRewardStats();
  if (!reward || stats.balance < reward.cost) return;
  if (!confirm(`Redeem ${reward.cost} credits for ${reward.title}?`)) return;
  journalRewardStore().rewardRedemptions.push({ id: createId(), rewardId: reward.id, title: reward.title, cost: reward.cost, date: toDateKey(), createdAt: new Date().toISOString() });
  saveTasks();
  renderJournalRewards();
});
