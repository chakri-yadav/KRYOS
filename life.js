/* Journal records share the existing profile-aware task block and backup path. */
const LIFE_DOMAINS = ['Career', 'Personal tasks', 'Job applications', 'Skincare', 'Supplements', 'Food', 'Sleep', 'Mood', 'Movement', 'Spiritual practice', 'Relationships', 'Other'];
let lifePreview = null;
let lifeNotice = '';
let lifeSelectedDate = '';
function lifeStore() {
  taskState.life ||= { version: 1, entries: [], records: [], draft: '', plannedDays: [1, 2, 3, 4, 5], schedules: [] };
  taskState.life.schedules ||= [];
  return taskState.life;
}
function lifeOptions(items) { return items.map(x => `<option>${escapeHtml(x)}</option>`).join(''); }
function lifeDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function validateLifeImport(data) {
  if (!data || data.version !== 1 || typeof data.id !== 'string' || !data.id.trim() || data.id.length > 160) throw new Error('Use version 1 and a unique package id.');
  if (!lifeDate(data.date) || data.date > toDateKey()) throw new Error('Choose a valid date, today or earlier.');
  if (typeof data.text !== 'string' || !data.text.trim() || data.text.length > 100000) throw new Error('Include the journal text (up to 100,000 characters).');
  if (!Array.isArray(data.records) || data.records.length > 100) throw new Error('Include a records array with at most 100 records.');
  const records = data.records.map(r => {
    if (!r || typeof r.title !== 'string' || !r.title.trim() || r.title.length > 300) throw new Error('Every record needs a short title.');
    if (!LIFE_DOMAINS.includes(r.domain)) throw new Error('Unknown domain. Use Other for a new category.');
    if (!['activity', 'observation', 'task'].includes(r.kind)) throw new Error('Record kind must be activity, observation, or task.');
    if (typeof r.evidence !== 'string' || !r.evidence.trim() || !data.text.includes(r.evidence)) throw new Error('Each record needs an exact supporting excerpt from the journal.');
    if (r.minutes != null && (!Number.isFinite(r.minutes) || r.minutes < 0 || r.minutes > 1440)) throw new Error('Minutes must be between 0 and 1440. Leave unknown durations out.');
    return { title: r.title.trim(), domain: r.domain, kind: r.kind, evidence: r.evidence, minutes: r.minutes ?? null, completed: r.kind === 'activity' && r.completed === true };
  });
  return { id: data.id.trim(), date: data.date, text: data.text, records };
}
function lifeCommit(data) {
  const store = lifeStore();
  if (store.entries.some(e => e.packageId === data.id)) throw new Error('This package has already been imported.');
  const entry = { id: createId(), packageId: data.id, date: data.date, text: data.text, createdAt: new Date().toISOString() };
  store.entries.push(entry);
  data.records.forEach(r => store.records.push({ ...r, id: createId(), entryId: entry.id, date: entry.date }));
  saveTasks();
}
function renderLifeJournal() {
  const store = lifeStore();
  journalView.innerHTML = `<div class="life-status" role="status">${escapeHtml(lifeNotice)}</div>
    <section class="life-compose"><h2>Leave the day here.</h2>
    <form id="life-entry-form"><label>Date<input name="date" type="date" value="${toDateKey()}" max="${toDateKey()}" required></label>
    <label class="life-wide">Your journal<textarea name="text" id="life-draft" placeholder="What happened, what you did, how you felt..." required maxlength="100000">${escapeHtml(store.draft || '')}</textarea></label>
    <button class="primary-button">Save journal</button><span id="life-draft-status" aria-live="polite"></span></form></section>
    <details class="life-section"><summary>Add a structured record</summary><form id="life-record-form" class="life-form">
    <label>Record<input name="title" required maxlength="300" placeholder="Evening skincare completed"></label>
    <label>Domain<select name="domain">${lifeOptions(LIFE_DOMAINS)}</select></label>
    <label>Type<select name="kind"><option value="activity">Completed activity</option><option value="observation">Observation / feeling</option><option value="task">Task to do</option></select></label>
    <label>Date<input type="date" name="date" value="${toDateKey()}" max="${toDateKey()}" required></label>
    <label>Minutes, if known<input type="number" name="minutes" min="0" max="1440"></label><button class="primary-button">Save record</button></form></details>
    <details class="life-section" ${lifePreview ? 'open' : ''}><summary>Import reviewed notes</summary>
    <p>Paste a version 1 journal package. Review the evidence before adding records.</p>
    <form id="life-import-form"><label>Import package<textarea name="package" required placeholder='{"version":1,"id":"unique-id","date":"2026-09-17","text":"Your notes","records":[]}'></textarea></label><button class="secondary-button">Preview import</button></form>
    <a href="docs/journal-import.md" target="_blank" rel="noopener">Import format and assistant instructions</a>
    ${lifePreview ? `<div class="life-preview"><h3>${escapeHtml(lifePreview.date)} · ${lifePreview.records.length} records</h3><p class="life-text">${escapeHtml(lifePreview.text)}</p>${lifePreview.records.map(r => `<div class="life-row"><strong>${escapeHtml(r.title)}</strong><span>${escapeHtml(r.domain)} · ${r.kind}${r.minutes == null ? '' : ` · ${r.minutes} min`}</span><q>${escapeHtml(r.evidence)}</q></div>`).join('')}<button class="primary-button" data-life="approve">Approve import</button> <button class="secondary-button" data-life="cancel">Cancel</button></div>` : ''}</details>
    <section class="life-section"><div class="life-heading"><h2>Your timeline</h2><input id="life-search" type="search" placeholder="Search your journal" aria-label="Search journal"></div><div id="life-timeline">${lifeTimeline()}</div></section>`;
}
function lifeTimeline(query = '') {
  const store = lifeStore();
  const entries = [...store.entries].sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).filter(e => `${e.text} ${e.date}`.toLowerCase().includes(query.toLowerCase()));
  return entries.length ? entries.map(e => `<article class="life-entry"><time>${escapeHtml(e.date)}</time><p class="life-text">${escapeHtml(e.text)}</p>${store.records.filter(r => r.entryId === e.id).map(r => `<div class="life-row"><span>${escapeHtml(r.domain)} · ${escapeHtml(r.title)}${r.minutes == null ? '' : ` · ${r.minutes} min`}</span>${r.kind === 'task' ? `<button class="secondary-button" data-life="task" data-id="${r.id}">${r.completed ? 'Reopen' : 'Complete'}</button>` : ''}</div>`).join('')}<button class="life-delete" data-life="delete" data-id="${e.id}">Delete entry</button></article>`).join('') : '<p class="life-empty">Your first entry starts the timeline. A few words are enough.</p>';
}
function lifeDay(date) {
  const b = getBehavior();
  const records = lifeStore().records.filter(r => r.date === date);
  const sessions = b.sessions.filter(s => s.date === date && s.completed && ['BUILD','ANALYZE'].includes(s.mode));
  // Imported minutes are kept separate: a journal may describe an existing timer session.
  const minutes = sessions.reduce((n,s) => n + Number(s.minutes || 0),0);
  const reported = records.filter(r => r.completed).reduce((n,r) => n + Number(r.minutes || 0),0);
  const completed = records.filter(r => r.completed).length;
  const outcome = Boolean(b.dailyPlans[date]?.outcomeCompletedAt);
  const level = outcome ? 3 : minutes >= 25 || completed ? 2 : minutes >= 5 ? 1 : 0;
  return { date, minutes, reported, completed, outcome, level, records };
}
function renderLifeProgress() {
  const store = lifeStore();
  const days = Array.from({length:84}, (_,i) => lifeDay(toDateKey(addDays(new Date(), i - 83))));
  const today = days.at(-1);
  const planned = d => {
    const schedule = [...store.schedules].reverse().find(s => s.from <= d.date);
    return (schedule?.days || [1,2,3,4,5]).includes(new Date(`${d.date}T12:00:00`).getDay());
  };
  const elapsed = days.filter(d => planned(d) && d.date < toDateKey());
  const successful = elapsed.filter(d => d.level > 0).length;
  let streak = 0;
  for (const d of [...days].reverse()) { if (!planned(d)) continue; if (d.date === toDateKey() && !d.level) continue; if (!d.level) break; streak++; }
  const lifetime = getBehavior().pointEvents.reduce((n,e) => n + Number(e.points || 0),0);
  const level = Math.floor(lifetime / 100) + 1;
  const selected = lifeDay(lifeSelectedDate || toDateKey());
  const weekly = Array.from({length:12},(_,i) => days.slice(i*7,i*7+7).reduce((n,d) => n+d.minutes,0));
  const peak = Math.max(1,...weekly);
  progressView.innerHTML = `<section class="life-progress-header"><div><p class="section-kicker">Your progress, made visible</p><h2>Every return leaves a mark.</h2><p>${successful} completed scheduled days in this 84-day view</p></div><div class="life-level"><span>Level ${level}</span><strong>${lifetime} <small>lifetime VP</small></strong><progress value="${lifetime % 100}" max="100"></progress><span>${100-lifetime%100} VP to level ${level+1}</span></div></section>
    <section class="life-summary"><div><span>Current streak</span><strong>${streak}<small> scheduled days</small></strong></div><div><span>Today, timer work</span><strong>${today.minutes}<small> minutes</small></strong></div><div><span>Available rewards</span><strong>${getPointBalance()}<small> VP</small></strong></div><div><span>Recorded completions</span><strong>${store.records.filter(r=>r.completed).length}</strong></div></section>
    <section class="life-section"><div class="life-heading"><h2>Your consistency</h2><span>Last 84 days</span></div><div class="life-heatmap">${days.map(d => `<button class="life-cell level-${d.level} ${planned(d)?'':'rest'} ${d.date === (lifeSelectedDate || toDateKey())?'selected':''}" data-life="day" data-date="${d.date}" aria-label="${d.date}: ${d.outcome?'outcome complete':d.level?'activity recorded':'no activity logged'}" title="${d.date}: ${d.minutes} timer minutes; ${d.completed} records"><span>${Number(d.date.slice(-2))}</span></button>`).join('')}</div><p class="life-legend">Outline: not logged · Light green: started · Green: activity · Deep green: outcome · Dashed: rest day</p>
    <details><summary>Weekly schedule</summary><div class="life-days">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((n,i)=>`<label><input type="checkbox" data-life-schedule="${i}" ${store.plannedDays.includes(i)?'checked':''}>${n}</label>`).join('')}</div><p>Schedule changes apply to this view; no VP is awarded for changing the schedule.</p></details>
    <div class="life-evidence"><h3>${selected.date}</h3><p>${selected.minutes} timer minutes · ${selected.reported} journal-reported minutes (shown separately) · ${selected.completed} completed records</p>${selected.records.map(r=>`<p><strong>${escapeHtml(r.domain)}</strong> · ${escapeHtml(r.title)}</p>`).join('') || '<p>No structured journal records for this date.</p>'}</div></section>
    <section class="life-section"><h2>Focus across twelve weeks</h2><div class="life-bars" role="img" aria-label="Weekly timer focus minutes: ${weekly.join(', ')}">${weekly.map((n,i)=>`<div><span>${n}m</span><i style="height:${Math.max(2,n/peak*130)}px"></i><small>W${i+1}</small></div>`).join('')}</div></section>
    <section class="life-section"><h2>Across your life</h2><div class="life-domains">${LIFE_DOMAINS.map(domain=>{const records=store.records.filter(r=>r.domain===domain);return records.length?`<div><strong>${domain}</strong><span>${records.length} records · ${records.filter(r=>r.completed).length} completions</span></div>`:'';}).join('') || '<p>Skincare, sleep, mood, food and work appear here as you record them.</p>'}</div></section>`;
}
document.addEventListener('input', e => {
  if (e.target.id === 'life-draft') { lifeStore().draft = e.target.value; saveTasks(); document.querySelector('#life-draft-status').textContent = 'Draft saved on this device'; }
  if (e.target.id === 'life-search') document.querySelector('#life-timeline').innerHTML = lifeTimeline(e.target.value);
});
document.addEventListener('change', e => {
  if (e.target.dataset.lifeSchedule !== undefined) {
    const days=lifeStore().plannedDays; const day=Number(e.target.dataset.lifeSchedule);
    const store=lifeStore();
    store.plannedDays=e.target.checked?[...new Set([...days,day])]:days.filter(x=>x!==day);
    const from=toDateKey(addDays(new Date(),1));
    store.schedules=store.schedules.filter(s=>s.from!==from);
    store.schedules.push({from,days:[...store.plannedDays]});
    saveTasks(); renderLifeProgress();
  }
});
document.addEventListener('submit', e => {
  if (!e.target.id.startsWith('life-')) return;
  e.preventDefault(); const f=new FormData(e.target);
  try {
    if (e.target.id === 'life-entry-form') { lifeCommit(validateLifeImport({version:1,id:createId(),date:f.get('date'),text:f.get('text'),records:[]})); lifeStore().draft=''; saveTasks(); lifeNotice='Journal saved.'; }
    if (e.target.id === 'life-record-form') { const title=f.get('title').trim(); const kind=f.get('kind'); lifeCommit(validateLifeImport({version:1,id:createId(),date:f.get('date'),text:title,records:[{title,domain:f.get('domain'),kind,evidence:title,completed:kind==='activity',minutes:f.get('minutes')===''?null:Number(f.get('minutes'))}]})); lifeNotice='Record saved. No automatic VP for health or mood records.'; }
    if (e.target.id === 'life-import-form') { const candidate=validateLifeImport(JSON.parse(f.get('package'))); if(lifeStore().entries.some(x=>x.packageId===candidate.id))throw new Error('This package is already saved.'); lifePreview=candidate; lifeNotice='Review the proposed records below.'; }
  } catch(error) { lifeNotice=error.message; }
  renderLifeJournal();
});
document.addEventListener('click', e => {
  const button=e.target.closest('[data-life]'); if(!button)return;
  const action=button.dataset.life;
  try {
    if(action==='approve' && lifePreview) {lifeCommit(lifePreview);lifePreview=null;lifeNotice='Import saved. Records now appear in Progress.';}
    if(action==='cancel')lifePreview=null;
    if(action==='delete' && confirm('Delete this journal entry and its linked records?')) {const s=lifeStore();s.entries=s.entries.filter(x=>x.id!==button.dataset.id);s.records=s.records.filter(x=>x.entryId!==button.dataset.id);saveTasks();}
    if(action==='task') {const r=lifeStore().records.find(x=>x.id===button.dataset.id);if(r){r.completed=!r.completed;saveTasks();}}
    if(action==='day'){lifeSelectedDate=button.dataset.date;renderLifeProgress();return;}
  }catch(error){lifeNotice=error.message;}
  renderLifeJournal();
});
