let progressMetric = 'all';
let progressRange = 84;

function progressDate(key, offset = 0) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

function journalProgressDays() {
  const days = new Set();
  lifeStore().entries.forEach(entry => days.add(entry.date));
  return [...days].sort();
}

function journalProgressStreak() {
  const dates = journalProgressDays();
  if (!dates.length) return { current: 0, best: 0, total: 0 };
  let run = 0;
  let best = 0;
  let previous = '';
  dates.forEach(date => {
    run = previous && progressDate(previous, 1) === date ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  });
  const today = toDateKey();
  const last = dates.at(-1);
  const current = last === today || progressDate(last, 1) === today ? run : 0;
  return { current, best, total: dates.length };
}

function progressCell(key) {
  const records = lifeStore().records.filter(record => record.date === key && record.completed);
  const count = progressMetric === 'all' ? records.length : records.filter(record => record.domain === progressMetric).length;
  const level = count >= 5 ? 3 : count >= 2 ? 2 : count ? 1 : 0;
  const selected = key === (lifeSelectedDate || toDateKey());
  return `<button class="life-cell level-${level} ${selected ? 'selected' : ''}" data-life="day" data-date="${key}" aria-pressed="${selected}" aria-label="${key}: ${count} completed records" title="${key}: ${count} completed records"><span>${Number(key.slice(-2))}</span></button>`;
}

function domainSparkBars(domain, today) {
  return Array.from({ length: 14 }, (_, index) => {
    const date = progressDate(today, index - 13);
    const count = lifeStore().records.filter(record => record.date === date && record.completed && record.domain === domain).length;
    return `<i class="domain-spark-bar ${count ? 'active' : ''}" style="--value:${Math.min(4, count)}" title="${date}: ${count}"></i>`;
  }).join('');
}

function renderProgressDashboard() {
  const store = lifeStore();
  const today = toDateKey();
  const streak = journalProgressStreak();
  const days = Array.from({ length: progressRange }, (_, index) => progressDate(today, index - progressRange + 1));
  const domains = LIFE_DOMAINS.filter(domain => store.records.some(record => record.domain === domain));
  if (!['all', ...domains].includes(progressMetric)) progressMetric = 'all';
  const selected = lifeDay(lifeSelectedDate || today);
  const completed = store.records.filter(record => record.completed);
  const domainCounts = domains
    .map(domain => ({ domain, count: completed.filter(record => record.domain === domain).length }))
    .filter(item => item.count)
    .sort((a, b) => b.count - a.count);
  const maximum = Math.max(1, ...domainCounts.map(item => item.count));
  const shortDate = key => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  progressView.innerHTML = `<header class="progress-title"><div><p class="section-kicker">KRYOS / Progress</p><h1>Your journal, made visible.</h1></div><span>${shortDate(today)}</span></header>
    <section class="progress-week"><div class="progress-totals"><div><strong>${streak.total}</strong><span>journal days</span></div><div><strong>${completed.length}</strong><span>completed actions</span></div><div><strong>${streak.best}</strong><span>best journal streak</span></div></div></section>
    <section class="life-section"><div class="life-heading"><div><h2>Consistency</h2><p>${shortDate(days[0])} &ndash; ${shortDate(today)}</p></div><div class="progress-filters"><label>Measure<select id="progress-metric"><option value="all">All progress</option>${domains.map(domain => `<option ${progressMetric === domain ? 'selected' : ''}>${escapeHtml(domain)}</option>`).join('')}</select></label><label>Period<select id="progress-range"><option value="84" ${progressRange === 84 ? 'selected' : ''}>12 weeks</option><option value="364" ${progressRange === 364 ? 'selected' : ''}>52 weeks</option></select></label></div></div>
      <div class="progress-calendar"><div class="progress-map-scroll"><div class="life-heatmap" style="--weeks:${progressRange / 7}">${days.map(progressCell).join('')}</div></div></div>
      <p class="life-legend">Darker green means more completed actions were recorded that day.</p>
      <div class="life-evidence" aria-live="polite"><div class="progress-eyebrow"><strong>${shortDate(selected.date)}</strong><span>${selected.completed} completions</span></div>${selected.records.map(record => `<p><strong>${escapeHtml(record.domain)}</strong> &middot; ${escapeHtml(record.title)}</p>`).join('') || '<p>No structured progress recorded.</p>'}</div>
    </section>
    <section class="life-section"><div class="life-heading"><div><h2>Where your effort went</h2><p>All recorded journal actions</p></div></div><div class="life-domain-list">${domainCounts.map(item => `<article class="life-domain-row"><div><span>${escapeHtml(item.domain)}</span><strong>${item.count}</strong></div><progress max="${maximum}" value="${item.count}"></progress><div class="domain-spark" aria-label="${escapeHtml(item.domain)} activity over 14 days">${domainSparkBars(item.domain, today)}</div></article>`).join('') || '<p>No completed actions yet.</p>'}</div></section>`;
}

document.addEventListener('change', event => {
  if (event.target.id === 'progress-metric') { progressMetric = event.target.value; renderLifeProgress(); }
  if (event.target.id === 'progress-range') { progressRange = Number(event.target.value); renderLifeProgress(); }
});
