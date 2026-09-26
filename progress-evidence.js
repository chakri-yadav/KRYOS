// Read-only projection: source records remain owned by their original pages.
function collectProgressEvidence(life, tasks, career, today) {
  const rows = new Map();
  const known = new Set();
  const add = (id, date, domain, title, source, complete = true) => {
    if (!id) return;
    known.add(id);
    if (complete && date && date <= today) rows.set(id, { id, date, domain, title, source, completed: true });
  };
  (life.actions || []).forEach(e => add(`action:${e.externalId || e.id}`, e.completedAt ? toDateKey(e.completedAt) : '', 'Actions', e.title, 'Actions', e.status === 'done'));
  (career.activityLog || []).filter(e => e.checkId || e.eventType === 'module-complete').forEach(e => add(`career:${e.id}`, e.date, 'Career', e.checkText || e.moduleTitle || 'Career step', 'Career'));
  (tasks.launch?.marketEvents || []).forEach(e => add(`launch:${e.id}`, e.date, 'Launch', e.topic || e.note || e.type, 'Launch', ['application','connection','message','followup','comment','referral','conversation'].includes(e.type) || (e.type === 'post' && e.status === 'published')));
  (tasks.launch?.mockSessions || []).forEach(e => add(`mock:${e.id}`, e.date, 'Articulation', e.focus || `${e.level || 'Recorded'} interview practice`, 'Launch', e.completed || Number(e.minutes) > 0));
  (tasks.rhythm?.events || []).forEach(e => {
    const habit = rhythmHabit(e.habitId);
    add(`rhythm:${e.id}`, e.date, 'Rhythm', `${habit?.title || e.habitId}${habit?.unit ? ` · ${e.value} ${habit.unit}` : ''}`, 'Rhythm', Number(e.value) > 0);
  });
  (tasks.money?.contacts || []).forEach(e => add(`money:${e.id}`, e.date, 'Money', 'Financial follow-up', 'Money'));
  (life.records || []).forEach(e => {
    const action = e.actionRef && (life.actions || []).find(a => a.id === e.actionRef || a.externalId === e.actionRef);
    const ref = e.sourceRef || (action ? `action:${action.externalId || action.id}` : e.actionRef ? `action:${e.actionRef}` : '');
    // Linked evidence uses the source's current state, including an undo.
    if (ref && (known.has(ref) || /^(action|career|launch|mock|rhythm|money):/.test(ref))) return;
    add(ref || `journal:${e.id}`, e.date, e.domain, e.title, 'Journal', e.completed);
  });
  return [...rows.values()];
}

function progressOverview(today) {
  const recent = Array.from({ length: 7 }, (_, i) => progressDate(today, i - 6));
  const evidence = recent.map(date => rewardEvidence(date));
  const monday = rewardWeekKey(today);
  const weekdays = Array.from({ length: 5 }, (_, i) => progressDate(monday, i)).filter(date => date <= today);
  const totalHabit = id => recent.reduce((n, date) => n + rhythmValue(id, date), 0);
  const targets = [
    ['Career', evidence.filter(e => e.scores.career > 0).length, 5, 'days · last 7 days'],
    ['Launch', weekdays.filter(date => rewardEvidence(date).scores.launch > 0).length, 4, 'weekdays · this workweek'],
    ['Articulation', evidence.filter(e => e.scores.articulation >= 6).length, 3, `medium-or-large days · last 7 days · ${evidence.some(e => e.scores.articulation >= 10) ? 'serious mock recorded' : 'one serious mock still needed'}`],
    ['Exercise', totalHabit('exercise'), 2, 'sessions · last 7 days'],
    ['Hair care', totalHabit('hair-care'), 1, 'session · last 7 days'],
    ['Groceries', totalHabit('groceries'), 1, 'trip · last 7 days; restock every 7–10 days'],
  ];
  const sources = ['Career', 'Launch', 'Articulation', 'Rhythm', 'Actions', 'Money', 'Journal'];
  const max = Math.max(1, ...recent.map(date => progressRecords(date, 'all').length));
  const bars = recent.map(date => {
    const records = progressRecords(date, 'all');
    return `<button class="evidence-bar" data-life="day" data-date="${date}" aria-label="${date}: ${records.length} recorded activities. Show evidence"><span>${records.length}</span><span class="evidence-stack">${sources.map((source, i) => { const count = records.filter(r => (r.domain === 'Articulation' ? 'Articulation' : r.source) === source).length; return `<i class="evidence-color-${i}" style="height:${count / max * 100}%"></i>`; }).join('')}</span><small>${progressShortDate(date, { weekday: 'short' })}</small></button>`;
  }).join('');
  return `<section class="life-section evidence-overview"><div class="life-heading"><div><p class="section-kicker">THIS WEEK</p><h2>Your effort, made visible.</h2><p>Recorded activities across all pages. Select a day to see what counted.</p></div></div><div class="evidence-bars">${bars}</div><div class="evidence-legend">${sources.map((s, i) => `<span><i class="evidence-color-${i}"></i>${s}</span>`).join('')}</div><div class="evidence-targets">${targets.map(([title, value, target, note]) => `<article><div><strong>${title}</strong><b>${value} / ${target}</b></div><progress aria-label="${title}: ${value} of ${target}" max="${target}" value="${Math.min(value, target)}"></progress><small>${note}</small></article>`).join('')}</div><p class="evidence-note">Activity counts show recorded effort, not reward credits. Targets show consistency; reward rules calculate credits separately.</p></section>`;
}

function progressJourney(today) {
  const days = Array.from({ length: 48 }, (_, i) => progressDate('2026-09-26', i));
  const containment = lifeStore().innerCommand?.containmentDays || [];
  return `<section class="life-section evidence-journey"><p class="section-kicker">48-DAY DEVI SADHANA</p><h2>Each return is part of your journey.</h2><p>September 26 – November 12, 2026 · Select a day to view its evidence.</p><div class="evidence-calendar">${days.map((date, i) => {
    const day = containment.find(d => d.date === date);
    const drift = day?.status === 'breach' || day?.boundary || day?.boundaries?.length;
    const state = date > today ? 'future' : drift ? 'drift' : progressRecords(date, 'all').length || day?.status === 'kept' ? 'recorded' : 'unknown';
    const label = { future: 'Ahead', drift: 'Recorded drift', recorded: 'Recorded progress', unknown: 'Unrecorded' }[state];
    return `<button class="journey-${state}" data-life="day" data-date="${date}" ${state === 'future' ? 'disabled' : ''} aria-label="${date}: ${label}" title="${date}: ${label}"><span>${i + 1}</span><small>${{ future: '—', drift: '~', recorded: '✓', unknown: '?' }[state]}</small></button>`;
  }).join('')}</div><p class="evidence-note">✓ Recorded progress · ~ Recorded drift · ? Unrecorded · — Ahead. Unrecorded days are not failures.</p></section>`;
}
