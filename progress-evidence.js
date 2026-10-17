// Read-only projection: source records remain owned by their original pages.
function collectProgressEvidence(life, tasks, career, today) {
  const rows = new Map();
  const known = new Set();
  const add = (id, date, domain, title, source, complete = true) => {
    if (!id) return;
    known.add(id);
    if (complete && date && date <= today) rows.set(id, { id, date, domain, title, source, completed: true });
  };
  (life.actions || []).forEach(e => add(`action:${e.externalId || e.id}`, e.completedDate || (e.completedAt ? toDateKey(e.completedAt) : ''), 'Actions', e.title, 'Actions', e.status === 'done'));
  const checkState=new Map();
  for(const roadmap of career.roadmaps||[])for(const module of roadmap.modules||[])for(const topic of module.topics||[])for(const check of topic.checklist||[])checkState.set(roadmap.id+':'+check.id,!!check.done);
  const latestChecks=new Map();
  (career.activityLog||[]).filter(e=>e.checkId).sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(e=>{known.add('career:'+e.id);latestChecks.set((e.roadmapId||'')+':'+e.checkId,e);});
  latestChecks.forEach((e,key)=>add('career-check:'+key,e.date,'Career',e.checkText||'Career step','Career',checkState.get(key)!==false));
  (career.activityLog||[]).filter(e=>e.eventType==='module-complete'&&!e.checkId).forEach(e=>add('career:'+e.id,e.date,'Career',e.moduleTitle||'Career module','Career'));
  (tasks.launch?.marketEvents || []).forEach(e => add(`launch:${e.id}`, e.date, 'Launch', e.topic || e.note || e.type, 'Launch', ['application','connection','message','followup','comment','referral','conversation'].includes(e.type) || (e.type === 'post' && e.status === 'published')));
  (tasks.launch?.mockSessions || []).forEach(e => add(`mock:${e.id}`, e.date, 'Articulation', e.focus || `${e.level || 'Recorded'} interview practice`, 'Launch', e.completed || Number(e.minutes) > 0));
  (tasks.rhythm?.events || []).forEach(e => {
    const habit = rhythmHabit(e.habitId);
    add(`rhythm:${e.id}`, e.date, 'Rhythm', `${habit?.title || e.habitId}${habit?.unit ? ` · ${e.value} ${habit.unit}` : ''}`, 'Rhythm', Number(e.value) > 0);
  });
  (tasks.money?.contacts || []).forEach(e => add(`money:${e.id}`, e.date, 'Money', 'Financial follow-up', 'Money'));
  (life.rewardEvents||[]).forEach(e=>add(e.sourceRef||'work:'+(e.sourceId||e.id),e.date,['articulation-small','articulation-medium'].includes(e.kind)?'Articulation':e.kind==='shift'?'Responsibility':'Career',e.title,'Career',e.completed&&!e.voidedAt));
  (life.marketingSummaries||[]).filter(e=>e.submittedCount>0).forEach(e=>{
    const direct=(tasks.launch?.marketEvents||[]).filter(r=>r.date===e.date&&r.type==='application').length;
    if(e.submittedCount>direct)add('marketing-summary:'+e.date,e.date,'Launch',e.submittedCount+' applications · laptop summary','Launch');
  });
  (life.entries || []).forEach(e => {
    const text = String(e.text || e.body || e.note || '').trim();
    add(`journal-entry:${e.id || e.date}`, e.date, 'Journal', 'Journal recorded', 'Journal', Boolean(text || e.date));
  });
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
  const monday = rewardWeekKey(today);
  const weekdays = Array.from({ length: 5 }, (_, i) => progressDate(monday, i)).filter(date => date <= today);
  const totalHabit = id => recent.reduce((n, date) => n + rhythmValue(id, date), 0);
  const targets = [
    ['Career', recent.filter(date=>progressRecords(date,'all').some(r=>r.domain==='Career')||(lifeStore().rewardEvents||[]).some(r=>r.date===date&&!r.voidedAt&&r.completed&&['concept','practice','mock'].includes(r.kind))).length, 5, 'days · last 7 days'],
    ['Launch', weekdays.filter(date=>(taskState.life?.marketingSummaries||[]).some(s=>s.date===date&&s.submittedCount>0)||(taskState.launch?.marketEvents||[]).some(e=>e.date===date&&e.type==='application')).length, 4, 'weekdays · this workweek'],
    ['Articulation', recent.filter(date=>(lifeStore().rewardEvents||[]).some(r=>r.date===date&&!r.voidedAt&&r.completed&&['articulation-medium','mock'].includes(r.kind))||(taskState.launch?.mockSessions||[]).some(r=>r.date===date&&r.completed&&['medium','large'].includes(r.level))).length, 3, 'medium-or-large practice days · last 7 days'],
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
  const model=KryosCommitment.journey(lifeStore(),today),labels={won:'Won','not-won':'Not won','awaiting-review':'Awaiting review','in-progress':'In progress',upcoming:'Upcoming'},symbols={won:'✓','not-won':'×','awaiting-review':'?','in-progress':'●',upcoming:'—'};
  if(typeof commandJourneyModel==='function'){model.days=commandJourneyModel(lifeStore(),today);model.won=model.days.filter(d=>d.state==='won').length;}
  const range=[model.cycle.startDate,model.cycle.endDate].map(d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'UTC',month:'long',day:'numeric'})).join(' – ');
  return `<section class="life-section evidence-journey"><div class="life-heading"><div><p class="section-kicker">48-DAY COMMITMENT CYCLE</p><h2>The same promise. One connected journey.</h2><p>${range}, ${model.cycle.startDate.slice(0,4)} · Same battle records as Inner Command.</p></div><button type="button" class="secondary-button" data-progress-command-day="${today<model.cycle.startDate?model.cycle.dayZero:today>model.cycle.endDate?model.cycle.endDate:today}">Continue in Inner Command →</button></div><div class="progress-journey-summary"><strong>${model.won}<small> / ${model.cycle.days} days won</small></strong><span>${model.elapsed} days elapsed · ${model.cycle.days-model.elapsed} remaining</span></div><progress max="${model.cycle.days}" value="${model.won}" aria-label="Commitment days won, not days elapsed"></progress><div class="evidence-calendar">${model.days.map(d=>`<button type="button" class="journey-${d.state}" data-progress-command-day="${d.date}" aria-label="Day ${d.number}, ${d.date}: ${labels[d.state]}${d.recovered?', return recorded':''}"><span>${d.number}</span><small aria-hidden="true">${symbols[d.state]}${d.recovered?' ↗':''}</small></button>`).join('')}</div><p class="evidence-note">✓ Won · × Not won · ? Awaiting review · ● In progress · — Upcoming · ↗ Return recorded. Open a day to review or correct its source record.</p></section>`;
}
if(typeof document!=='undefined')document.addEventListener('click',event=>{
  const button=event.target.closest('[data-progress-command-day]');if(!button)return;
  commitmentDate=button.dataset.progressCommandDay;setPage('journal');
});
