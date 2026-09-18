let progressMetric = 'outcome';
let progressRange = 84;

function progressDate(key, offset = 0) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

function progressPlanned(key) {
  const schedules = lifeStore().schedules.filter(s => s.from <= key).sort((a,b) => b.from.localeCompare(a.from));
  return (schedules[0]?.days || [1,2,3,4,5]).includes(new Date(`${key}T12:00:00`).getDay());
}

function progressHistory() {
  const behavior = getBehavior();
  const today = toDateKey();
  const dates = Object.keys(behavior.dailyPlans).filter(d => lifeDate(d) && d <= today && behavior.dailyPlans[d].outcome?.trim()).sort();
  if (!dates.length) return { current: 0, best: 0, total: 0 };
  let run = 0, best = 0, total = 0;
  for (let key = dates[0]; key <= today; key = progressDate(key, 1)) {
    const done = Boolean(behavior.dailyPlans[key]?.outcome?.trim() && behavior.dailyPlans[key]?.outcomeCompletedAt);
    if (done) total++;
    if (!progressPlanned(key)) continue;
    if (done) { run++; best = Math.max(best, run); }
    else if (key < today) run = 0;
  }
  return { current: run, best, total };
}

function progressStatus(key) {
  const plan = getBehavior().dailyPlans[key];
  if (key > toDateKey()) return 'future';
  if (plan?.outcome?.trim() && plan.outcomeCompletedAt) return 'done';
  if (!progressPlanned(key)) return 'rest';
  if (!plan?.outcome?.trim()) return 'unlogged';
  return 'planned';
}

function progressReward() {
  const rewards = getBehavior().rewards.filter(r => r.active && Number(r.cost) > 0);
  return { rewards, selected: rewards.find(r => r.id === lifeStore().selectedRewardId) || rewards[0] };
}

function renderProgressReward() {
  const { rewards, selected } = progressReward();
  const balance = getPointBalance();
  if (!selected) return '<div class="progress-reward"><p class="section-kicker">Something to look forward to</p><h3>Choose your next reward</h3><button class="secondary-button" data-page="rewards">Add a reward</button></div>';
  const remaining = Math.max(0, selected.cost - balance);
  return `<div class="progress-reward"><div class="progress-eyebrow"><span>Next reward</span><span class="progress-gold">${remaining ? `${remaining} VP away` : 'Ready to redeem'}</span></div>
    <label class="progress-reward-label">Your reward<select data-progress-reward aria-label="Choose your reward">${rewards.map(r => `<option value="${escapeHtml(r.id)}" ${r.id === selected.id ? 'selected' : ''}>${escapeHtml(r.title)}</option>`).join('')}</select></label>
    <progress class="progress-track gold" max="${selected.cost}" value="${Math.max(0,Math.min(balance,selected.cost))}" aria-label="Reward progress"></progress>
    <div class="progress-eyebrow"><span>${balance} / ${selected.cost} VP</span><button class="progress-link" data-page="rewards">View rewards &#8594;</button></div></div>`;
}

function renderProgressToday() {
  const plan = getBehavior().dailyPlans[toDateKey()];
  const hasPlan = Boolean(plan?.outcome?.trim());
  const done = hasPlan && Boolean(plan.outcomeCompletedAt);
  return `<section class="progress-daily"><div class="progress-daily-main"><p class="section-kicker">Today's finish line</p><h2>${done ? 'You made it happen.' : hasPlan ? 'One outcome. Within reach.' : 'Make room for one win.'}</h2>
    <p class="progress-outcome">${escapeHtml(hasPlan ? plan.outcome : 'Choose the result you want to finish today.')}</p>
    <div class="progress-finish ${done ? 'done' : ''}"><span aria-hidden="true">${done ? '&#10003;' : '1'}</span><div><strong>${done ? '1 / 1 outcome complete' : hasPlan ? '0 / 1 outcome complete' : 'No outcome set yet'}</strong><progress class="progress-track" max="1" value="${done ? 1 : 0}" aria-label="Daily outcome completion"></progress></div></div>
    ${done ? '<button class="progress-link" data-page="journal">Capture the day &#8594;</button>' : hasPlan ? `<p class="progress-next">${escapeHtml(plan.nextAction || 'Start with five minutes.')}</p><button class="primary-button" data-behavior-action="start-focus" data-minutes="5" data-mode="BUILD">Start 5 minutes</button>` : '<button class="primary-button" data-page="today">Set today\'s outcome</button>'}</div>${renderProgressReward()}</section>`;
}

function progressCell(key) {
  const day = lifeDay(key);
  let status = progressStatus(key), level = 0, label;
  if (progressMetric === 'outcome') {
    level = status === 'done' ? 3 : 0;
    label = { done:'Outcome complete', planned:'Outcome not marked complete', rest:'Scheduled rest', unlogged:'No outcome logged', future:'Upcoming' }[status];
  } else if (progressMetric === 'focus') {
    level = day.minutes >= 50 ? 3 : day.minutes >= 25 ? 2 : day.minutes > 0 ? 1 : 0;
    label = `${day.minutes} timed focus minutes`;
  } else {
    const count = day.records.filter(r => r.domain === progressMetric && r.completed).length;
    level = count ? 3 : 0;
    label = count ? 'Completion recorded' : 'No completion recorded';
  }
  const selected = key === (lifeSelectedDate || toDateKey());
  return `<button class="life-cell level-${level} ${status === 'rest' ? 'rest' : ''} ${selected ? 'selected' : ''}" data-life="day" data-date="${key}" ${status==='future'?'disabled':''} aria-pressed="${selected}" aria-label="${key}: ${label}" title="${key}: ${label}"><span>${Number(key.slice(-2))}</span></button>`;
}

function renderProgressDashboard() {
  const today = toDateKey();
  const store = lifeStore();
  const behavior = getBehavior();
  const stats = progressHistory();
  const monday = progressDate(today, -((new Date(`${today}T12:00:00`).getDay()+6)%7));
  const week = Array.from({length:7}, (_,i) => progressDate(monday,i));
  const due = week.filter(progressPlanned);
  const achieved = due.filter(d => progressStatus(d) === 'done').length;
  const days = Array.from({length:progressRange},(_,i) => progressDate(monday,i-progressRange+7));
  const lifetime = behavior.pointEvents.reduce((sum,e) => sum + Number(e.points || 0),0);
  const selected = lifeDay(lifeSelectedDate || today);
  const selectedPlan = behavior.dailyPlans[selected.date];
  const focusWeeks = Array.from({length:8},(_,i) => {
    const start = progressDate(monday,(i-7)*7);
    return {start,minutes:behavior.sessions.filter(s => s.completed && ['BUILD','ANALYZE'].includes(s.mode) && s.date >= start && s.date <= progressDate(start,6) && s.date <= today).reduce((n,s)=>n+Number(s.minutes || 0),0)};
  });
  const maximum = Math.max(1,...focusWeeks.map(w=>w.minutes));
  const shortDate = key => new Date(`${key}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'});
  const domains = LIFE_DOMAINS.filter(domain => store.records.some(r=>r.domain===domain));
  if (!['outcome','focus',...domains].includes(progressMetric)) progressMetric='outcome';
  progressView.innerHTML = `<header class="progress-title"><div><p class="section-kicker">KRYOS / Progress</p><h1>Look how far you've come.</h1></div><span>${shortDate(today)}</span></header>
    ${renderProgressToday()}
    <section class="progress-week"><div class="life-heading"><div><h2>Your week, taking shape</h2><p>${achieved} of ${due.length} scheduled outcomes complete</p></div><span class="progress-streak">${stats.current}<small> day streak</small></span></div>
      <div class="progress-week-days">${week.map((key,i)=>{const status=progressStatus(key);return `<button class="progress-week-day ${status} ${key===today?'today':''}" data-life="day" data-date="${key}" aria-label="${key}: ${status}"><span>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span><b aria-hidden="true">${status==='done'?'&#10003;':status==='rest'?'&ndash;':Number(key.slice(-2))}</b><small>${{done:'Done',rest:'Rest',future:'Next',planned:'Planned',unlogged:'Unlogged'}[status]}</small></button>`;}).join('')}</div>
      <div class="progress-totals"><div><strong>${stats.total}</strong><span>outcomes completed</span></div><div><strong>${stats.best}</strong><span>best scheduled streak</span></div><div><strong>${lifetime}</strong><span>lifetime VP earned</span></div></div>
    </section>
    <section class="life-section"><div class="life-heading"><div><h2>Your consistency</h2><p>${shortDate(days[0])} &ndash; ${shortDate(today)}</p></div><div class="progress-filters"><label>Measure<select id="progress-metric"><option value="outcome" ${progressMetric==='outcome'?'selected':''}>Daily outcomes</option><option value="focus" ${progressMetric==='focus'?'selected':''}>Timed focus</option>${domains.map(d=>`<option ${progressMetric===d?'selected':''}>${escapeHtml(d)}</option>`).join('')}</select></label><label>Period<select id="progress-range"><option value="84" ${progressRange===84?'selected':''}>12 weeks</option><option value="364" ${progressRange===364?'selected':''}>52 weeks</option></select></label></div></div>
      <div class="progress-calendar"><div class="progress-week-labels" aria-hidden="true">${['M','T','W','T','F','S','S'].map(d=>`<span>${d}</span>`).join('')}</div><div class="progress-map-scroll"><div class="life-heatmap" style="--weeks:${progressRange/7}">${days.map(progressCell).join('')}</div></div></div>
      <p class="life-legend">${progressMetric==='focus'?'Timed focus: 0 / 1-24 / 25-49 / 50+ minutes.':progressMetric==='outcome'?'Green: outcome complete. Outline: no completed outcome.':'Green: completion recorded. Outline: no completion recorded.'} Dashed outline: scheduled rest.</p>
      <details><summary>Scheduled days</summary><div class="life-days">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((n,i)=>`<label><input type="checkbox" data-life-schedule="${i}" ${store.plannedDays.includes(i)?'checked':''}>${n}</label>`).join('')}</div><p class="life-legend">Changes take effect tomorrow. Streaks count scheduled daily outcomes.</p></details>
      <div class="life-evidence" aria-live="polite"><div class="progress-eyebrow"><strong>${shortDate(selected.date)}</strong><span>${progressStatus(selected.date)==='done'?'Outcome complete':'Daily record'}</span></div>${selectedPlan?.outcome ? `<p>${escapeHtml(selectedPlan.outcome)}</p>`:''}<p>${selected.minutes} timed minutes &middot; ${selected.reported} reported minutes &middot; ${selected.completed} record completions</p>${selected.records.map(r=>`<p><strong>${escapeHtml(r.domain)}</strong> &middot; ${escapeHtml(r.title)}</p>`).join('') || '<p>No structured journal records.</p>'}<small>Reported and timed minutes are separate; they may describe the same work.</small></div>
    </section>
    <details class="life-section progress-deeper"><summary>Focus history</summary><p class="life-legend">Timed work by calendar week. The current week is still in progress.</p><div class="life-bars" role="img" aria-label="${focusWeeks.map(w=>`${shortDate(w.start)}: ${w.minutes} minutes`).join('; ')}">${focusWeeks.map(w=>`<div><span>${w.minutes}m</span><i style="height:${w.minutes/maximum*130}px"></i><small>${shortDate(w.start)}</small></div>`).join('')}</div></details>`;
}

document.addEventListener('change', event => {
  if (event.target.id === 'progress-metric') { progressMetric = event.target.value; renderLifeProgress(); }
  if (event.target.id === 'progress-range') { progressRange = Number(event.target.value); renderLifeProgress(); }
  if (event.target.matches('[data-progress-reward]')) { lifeStore().selectedRewardId=event.target.value; saveTasks(); renderLifeProgress(); }
});

document.addEventListener('click', event => {
  const button=event.target.closest('#progress-view [data-page]');
  if (button && isSecurityUnlocked) setPage(button.dataset.page);
});
