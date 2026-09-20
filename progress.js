let progressMetric = 'all';
let progressRange = 84;

function progressDate(key, offset = 0) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

function progressShortDate(key, options = { month: 'short', day: 'numeric' }) {
  return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, options);
}

function journalProgressDays() {
  return [...new Set(lifeStore().entries.map(entry => entry.date))].sort();
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
  return { current: last === today || progressDate(last, 1) === today ? run : 0, best, total: dates.length };
}

function progressRecords(key, metric = progressMetric) {
  const records = lifeStore().records.filter(record => record.date === key && record.completed);
  return metric === 'all' ? records : records.filter(record => record.domain === metric);
}

function progressCell(key) {
  const count = progressRecords(key).length;
  const level = count >= 5 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count ? 1 : 0;
  const selected = key === (lifeSelectedDate || toDateKey());
  return `<button class="life-cell level-${level} ${selected ? 'selected' : ''}" data-life="day" data-date="${key}" aria-pressed="${selected}" aria-label="${key}: ${count} completed records" title="${key}: ${count} completed records"></button>`;
}

function domainSparkBars(domain, today) {
  return Array.from({ length: 14 }, (_, index) => {
    const date = progressDate(today, index - 13);
    const count = progressRecords(date, domain).length;
    return `<i class="domain-spark-bar ${count ? 'active' : ''}" style="--value:${Math.min(4, count)}" title="${date}: ${count}"></i>`;
  }).join('');
}

function progressPulse(today) {
  const values = Array.from({ length: 28 }, (_, index) => {
    const date = progressDate(today, index - 27);
    return { date, value: progressRecords(date).length };
  });
  const max = Math.max(1, ...values.map(item => item.value));
  const points = values.map((item, index) => `${12 + index * (676 / 27)},${116 - (item.value / max) * 88}`).join(' ');
  const circles = values.filter(item => item.value).map((item, index) => {
    const sourceIndex = values.indexOf(item);
    return `<circle cx="${12 + sourceIndex * (676 / 27)}" cy="${116 - (item.value / max) * 88}" r="3.5"><title>${item.date}: ${item.value} completions</title></circle>`;
  }).join('');
  const total = values.reduce((sum, item) => sum + item.value, 0);
  return `<div class="pulse-chart"><svg viewBox="0 0 700 132" role="img" aria-label="Four week completion trend"><line x1="12" y1="116" x2="688" y2="116"></line><line x1="12" y1="72" x2="688" y2="72"></line><line x1="12" y1="28" x2="688" y2="28"></line><polyline points="${points}"></polyline>${circles}</svg><div><span>${progressShortDate(values[0].date)}</span><strong>${total} actions across 28 days</strong><span>${progressShortDate(today)}</span></div></div>`;
}

function momentumStats(today) {
  const thisWeek = Array.from({ length: 7 }, (_, index) => progressRecords(progressDate(today, index - 6)).length);
  const lastWeek = Array.from({ length: 7 }, (_, index) => progressRecords(progressDate(today, index - 13)).length);
  const activeDays = thisWeek.filter(Boolean).length;
  const actions = thisWeek.reduce((sum, value) => sum + value, 0);
  const previous = lastWeek.reduce((sum, value) => sum + value, 0);
  const momentum = Math.round((activeDays / 7) * 100);
  const change = previous ? Math.round(((actions - previous) / previous) * 100) : actions ? 100 : 0;
  return { activeDays, actions, previous, momentum, change };
}

function momentumDial(percent) {
  const circumference = 289;
  const dash = Math.round((Math.max(0, Math.min(100, percent)) / 100) * circumference);
  return `<div class="momentum-dial"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="dial-base" cx="60" cy="60" r="46"></circle><circle class="dial-value" cx="60" cy="60" r="46" stroke-dasharray="${dash} ${circumference - dash}"></circle></svg><div><strong>${percent}</strong><span>momentum</span></div></div>`;
}

function bestDayRecord() {
  const counts = new Map();
  lifeStore().records.filter(record => record.completed).forEach(record => counts.set(record.date, (counts.get(record.date) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]))[0] || ['', 0];
}

function compactCareerProgress() {
  const stats = getCareerStats();
  const primary = careerState.roadmaps.find(roadmap => roadmap.id === selectedRoadmapId) || careerState.roadmaps[0];
  const next = getNextCareerItem(primary);
  return `<section class="progress-career-band"><div><p class="section-kicker">CAREER SKILLS</p><h2>${primary ? escapeHtml(primary.title) : 'No skill roadmap yet'}</h2><p>${next ? `Next: ${escapeHtml(next.item.text)}` : 'Create or review the next evidence step.'}</p></div><div class="progress-career-stat"><strong>${stats.weekActions}</strong><span>steps this week</span></div><div class="progress-career-stat"><strong>${stats.currentStreak}</strong><span>day rhythm</span></div><div class="progress-career-stat"><strong>${stats.progress}%</strong><span>coverage</span></div><button type="button" data-page="career">View Career</button></section>`;
}

function progressDeadlineTracker() {
  const stats = getCareerDeadlineStats();
  const rows = stats.modules.slice().sort((a, b) => {
    const aClosed = ['on-time', 'late'].includes(a.deadline.key) ? 1 : 0;
    const bClosed = ['on-time', 'late'].includes(b.deadline.key) ? 1 : 0;
    return aClosed - bClosed || a.deadline.targetDate.localeCompare(b.deadline.targetDate);
  }).slice(0, 8);
  const score = stats.deliveryScore ?? 0;
  return `<section class="deadline-progress-panel">
    <div class="deadline-progress-head"><div><p class="section-kicker">DEADLINE CONTROL</p><h2>See pressure while it is still manageable.</h2><p>Module dates, live risk and finalized delivery quality in one view.</p></div><div class="deadline-progress-score" style="--deadline-score:${score * 3.6}deg"><strong>${stats.deliveryScore ?? '—'}</strong><span>delivery score</span></div></div>
    <div class="deadline-progress-metrics">
      <article class="${stats.overdue ? 'danger' : ''}"><span>Overdue now</span><strong>${stats.overdue}</strong><small>unfinished modules</small></article>
      <article class="${stats.dueSoon ? 'warning' : ''}"><span>Due within 7 days</span><strong>${stats.dueSoon}</strong><small>early warning</small></article>
      <article><span>On-time finishes</span><strong>${stats.onTime}/${stats.completed}</strong><small>${stats.onTimeRate === null ? 'No dated finish yet' : `${stats.onTimeRate}% on-time rate`}</small></article>
      <article><span>Still undated</span><strong>${stats.unscheduled}</strong><small>schedule only active work</small></article>
    </div>
    ${rows.length ? `<div class="deadline-progress-list">${rows.map(({ roadmap, module, deadline }) => `<button type="button" data-page="career" class="deadline-progress-row state-${deadline.key}"><time>${progressShortDate(deadline.targetDate)}</time><span><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(roadmap.title)} · ${escapeHtml(deadline.label)}</small></span><div><i><u style="width:${deadline.stats.percent}%"></u></i><b>${deadline.stats.percent}%</b></div></button>`).join('')}</div>` : `<div class="deadline-progress-empty"><strong>No deadline signal yet.</strong><p>Add target dates to active Career modules. KRYOS will calculate the rest.</p><button type="button" data-page="career">Set module deadlines</button></div>`}
  </section>`;
}

function renderProgressDashboard() {
  const store = lifeStore();
  const today = toDateKey();
  const streak = journalProgressStreak();
  const momentum = momentumStats(today);
  const days = Array.from({ length: progressRange }, (_, index) => progressDate(today, index - progressRange + 1));
  const domains = LIFE_DOMAINS.filter(domain => store.records.some(record => record.domain === domain));
  if (!['all', ...domains].includes(progressMetric)) progressMetric = 'all';
  const selected = lifeDay(lifeSelectedDate || today);
  const completed = store.records.filter(record => record.completed);
  const domainCounts = domains.map(domain => ({ domain, count: completed.filter(record => record.domain === domain).length })).filter(item => item.count).sort((a, b) => b.count - a.count);
  const maximum = Math.max(1, ...domainCounts.map(item => item.count));
  const [bestDate, bestCount] = bestDayRecord();
  const topDomain = domainCounts[0];
  const assessments = store.dailyAssessments || [];
  const qualified = assessments.filter(item => item.qualified).length;
  const trendLabel = !momentum.previous && momentum.actions ? 'First signal this week' : momentum.change === 0 ? 'No change yet' : `${momentum.change > 0 ? '+' : ''}${momentum.change}% vs prior week`;
  const periodValues = days.map(day => progressRecords(day).length);
  const periodTotal = periodValues.reduce((sum, value) => sum + value, 0);
  const periodActive = periodValues.filter(Boolean).length;

  progressView.innerHTML = `<header class="progress-title progress-title-premium"><div><p class="section-kicker">KRYOS / Progress</p><h1>Proof that you are moving.</h1><p>Every mark comes from journal evidence.</p></div><span>${progressShortDate(today, { weekday: 'long', month: 'short', day: 'numeric' })}</span></header>
    <section class="momentum-command">
      <div class="momentum-copy"><span class="signal-dot"></span><p>Current rhythm</p><h2>${momentum.activeDays ? `${momentum.activeDays} active ${momentum.activeDays === 1 ? 'day' : 'days'} this week` : 'The next action starts the signal'}</h2><small>${trendLabel}</small></div>
      ${momentumDial(momentum.momentum)}
      <div class="command-stat"><strong>${streak.current}</strong><span>current streak</span><small>Best ${streak.best}</small></div>
      <div class="command-stat"><strong>${momentum.actions}</strong><span>actions this week</span><small>${completed.length} lifetime</small></div>
    </section>
    <section class="progress-records" aria-label="Personal records">
      <div><span>Evidence days</span><strong>${streak.total}</strong><small>journal days recorded</small></div>
      <div><span>Strongest day</span><strong>${bestCount}</strong><small>${bestDate ? progressShortDate(bestDate) : 'No record yet'}</small></div>
      <div><span>Leading domain</span><strong>${topDomain ? escapeHtml(topDomain.domain) : '—'}</strong><small>${topDomain ? `${topDomain.count} completed` : 'No record yet'}</small></div>
      <div><span>Qualified days</span><strong>${qualified}</strong><small>strictly reviewed</small></div>
    </section>
    ${compactCareerProgress()}
    ${progressDeadlineTracker()}
    <section class="life-section pulse-section"><div class="life-heading"><div><p class="section-kicker">EFFORT PULSE</p><h2>Four-week trajectory</h2></div><span>Action, not intention</span></div>${progressPulse(today)}</section>
    <section class="life-section consistency-section"><div class="life-heading"><div><p class="section-kicker">CONSISTENCY FIELD</p><h2>${progressRange === 364 ? 'A year of evidence' : 'Your recent rhythm'}</h2><p>${progressShortDate(days[0])} – ${progressShortDate(today)}</p></div><div class="progress-filters"><label>Measure<select id="progress-metric"><option value="all">All progress</option>${domains.map(domain => `<option ${progressMetric === domain ? 'selected' : ''}>${escapeHtml(domain)}</option>`).join('')}</select></label><label>Period<select id="progress-range"><option value="84" ${progressRange === 84 ? 'selected' : ''}>12 weeks</option><option value="364" ${progressRange === 364 ? 'selected' : ''}>52 weeks</option></select></label></div></div>
      <div class="heatmap-shell"><div class="heatmap-days" aria-hidden="true"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span>Sun</span></div><div class="progress-map-scroll"><div class="life-heatmap" style="--weeks:${progressRange / 7}">${days.map(progressCell).join('')}</div></div><div class="heatmap-insight"><span>Selected period</span><strong>${periodTotal}</strong><p>completed actions across <b>${periodActive}</b> active ${periodActive === 1 ? 'day' : 'days'}</p></div></div>
      <div class="heatmap-legend"><span>Quiet</span><i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i><span>Deep</span></div>
      <div class="life-evidence" aria-live="polite"><div class="progress-eyebrow"><strong>${progressShortDate(selected.date, { weekday: 'long', month: 'short', day: 'numeric' })}</strong><span>${selected.completed} completions</span></div>${selected.records.map(record => `<p><strong>${escapeHtml(record.domain)}</strong><span>${escapeHtml(record.title)}</span></p>`).join('') || '<p><span>No structured progress recorded.</span></p>'}</div>
    </section>
    <section class="life-section"><div class="life-heading"><div><p class="section-kicker">LIFE DISTRIBUTION</p><h2>Where your effort is landing</h2><p>Volume and recent rhythm by domain</p></div></div><div class="life-domain-list premium-domains">${domainCounts.map((item, index) => `<article class="life-domain-row" style="--rank:${index}"><div><span>${escapeHtml(item.domain)}</span><strong>${item.count}</strong></div><progress max="${maximum}" value="${item.count}"></progress><div class="domain-spark" aria-label="${escapeHtml(item.domain)} activity over 14 days">${domainSparkBars(item.domain, today)}</div></article>`).join('') || '<p>No completed actions yet.</p>'}</div></section>`;
}

document.addEventListener('change', event => {
  if (event.target.id === 'progress-metric') { progressMetric = event.target.value; renderLifeProgress(); }
  if (event.target.id === 'progress-range') { progressRange = Number(event.target.value); renderLifeProgress(); }
});
