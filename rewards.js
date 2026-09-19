const JOURNAL_REWARDS = [
  { id: 'video', title: 'Enjoyable video', cost: 3, tier: 'Quick reset' },
  { id: 'walk', title: 'Long peaceful walk', cost: 4, tier: 'Daily' },
  { id: 'friend-call', title: 'Relaxed call with a friend', cost: 5, tier: 'Midweek' },
  { id: 'snack', title: 'Special snack', cost: 6, tier: 'Small treat' },
  { id: 'movie', title: 'Full movie night', cost: 15, tier: 'Weekly' },
  { id: 'meal', title: 'Favorite meal', cost: 18, tier: 'Weekly' },
  { id: 'friends', title: 'Extended time with friends', cost: 22, tier: 'Milestone' },
  { id: 'astrology', title: 'Rare astrology reading', cost: 30, tier: 'Rare' },
  { id: 'celebration', title: 'Planned celebration or basket purchase', cost: 40, tier: 'Major milestone' },
];

function journalRewardStore() {
  const store = lifeStore();
  store.rewardRedemptions ||= [];
  return store;
}

function journalRewardStats() {
  const store = journalRewardStore();
  const earned = store.records.filter(record => record.completed).reduce((sum, record) => sum + (Number(record.effort) || 1), 0);
  const spent = store.rewardRedemptions.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  return { earned, spent, balance: Math.max(0, earned - spent) };
}

function renderJournalRewards() {
  const store = journalRewardStore();
  const stats = journalRewardStats();
  const next = JOURNAL_REWARDS.find(reward => reward.cost > stats.balance) || JOURNAL_REWARDS.at(-1);
  rewardsView.innerHTML = `<header class="progress-title"><div><p class="section-kicker">KRYOS / Rewards</p><h1>Effort should make life better.</h1></div><span>${stats.balance} credits</span></header>
    <section class="reward-balance"><div><span>Available</span><strong>${stats.balance}</strong><small>effort credits</small></div><div class="reward-balance-copy"><p>Reviewed actions earn 1 to 5 credits based on effort. Observations earn none. Redeeming spends credits but never erases your progress.</p><progress max="${next.cost}" value="${Math.min(stats.balance, next.cost)}"></progress><small>${Math.max(0, next.cost - stats.balance)} credits to ${escapeHtml(next.title)}</small></div></section>
    <section class="life-section"><div class="life-heading"><div><h2>Choose a reward</h2><p>Enjoy it without guilt after the effort is recorded.</p></div></div><div class="reward-grid">${JOURNAL_REWARDS.map(reward => `<article class="reward-card ${stats.balance >= reward.cost ? 'ready' : ''}"><div><span>${escapeHtml(reward.tier)}</span><strong>${escapeHtml(reward.title)}</strong></div><div class="reward-cost"><b>${reward.cost}</b><small>credits</small></div><button class="${stats.balance >= reward.cost ? 'primary-button' : 'secondary-button'}" data-journal-reward="${reward.id}" ${stats.balance < reward.cost ? 'disabled' : ''}>${stats.balance >= reward.cost ? 'Redeem' : `${reward.cost - stats.balance} to go`}</button></article>`).join('')}</div></section>
    <section class="life-section"><div class="life-heading"><div><h2>Reward history</h2><p>${stats.earned} earned &middot; ${stats.spent} spent</p></div></div>${store.rewardRedemptions.length ? `<div class="reward-history">${[...store.rewardRedemptions].reverse().map(item => `<div><span>${escapeHtml(item.title)}</span><time>${escapeHtml(item.date)}</time><strong>-${item.cost}</strong></div>`).join('')}</div>` : '<p class="life-empty">Your first redeemed reward will appear here.</p>'}</section>`;
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
