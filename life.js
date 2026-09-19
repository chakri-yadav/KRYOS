/* Journal records share the existing profile-aware task block and backup path. */
const LIFE_DOMAINS = ['Career', 'Personal tasks', 'Job applications', 'Skincare', 'Supplements', 'Food', 'Sleep', 'Mood', 'Movement', 'Spiritual practice', 'Relationships', 'Other'];
let lifePreview = null;
let lifeNotice = '';
let lifeSelectedDate = '';
let assistantImportOpened = false;
let containmentDialogOpen = false;
function lifeStore() {
  taskState.life ||= { version: 1, entries: [], records: [], draft: '', plannedDays: [1, 2, 3, 4, 5], schedules: [] };
  taskState.life.schedules ||= [];
  taskState.life.actions ||= [];
  taskState.life.rewardRedemptions ||= [];
  taskState.life.dailyAssessments ||= [];
  taskState.life.innerCommand ||= {
    covenant: { startDate: '2026-09-19', days: 45 },
    containmentDays: [],
  };
  taskState.life.innerCommand.containmentDays ||= [];
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
    const effort = r.kind === 'activity' ? Math.max(1, Math.min(5, Number(r.effort) || 1)) : 0;
    return { title: r.title.trim(), domain: r.domain, kind: r.kind, evidence: r.evidence, minutes: r.minutes ?? null, completed: r.kind === 'activity' && r.completed === true, effort, actionRef: typeof r.actionRef === 'string' ? r.actionRef.trim() : '', sourceRef: typeof r.sourceRef === 'string' ? r.sourceRef.trim().slice(0, 180) : '' };
  });
  const actions = Array.isArray(data.actions) ? data.actions.map(action => normalizeImportedAction(action)) : [];
  const actionUpdates = Array.isArray(data.actionUpdates) ? data.actionUpdates.map(update => normalizeActionUpdate(update)) : [];
  const assessment = data.assessment == null ? null : normalizeDailyAssessment(data.assessment, data.date);
  return { id: data.id.trim(), date: data.date, text: data.text, records, actions, actionUpdates, assessment };
}
function normalizeDailyAssessment(assessment, date) {
  if (!assessment || typeof assessment !== 'object') throw new Error('The daily assessment must be an object.');
  const limits = { priority: 3, resistance: 2, foundation: 2, spiritual: 1, closure: 1, containment: 1 };
  const scores = {};
  Object.entries(limits).forEach(([key, max]) => {
    const value = Number(assessment.scores?.[key]);
    if (!Number.isInteger(value) || value < 0 || value > max) throw new Error(`${key} score must be a whole number from 0 to ${max}.`);
    scores[key] = value;
  });
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const qualified = total >= 7 && scores.priority >= 1 && assessment.qualified !== false;
  return { date, scores, total, qualified, astrologySeeking: assessment.astrologySeeking === true, covenantReviewApproved: assessment.covenantReviewApproved === true, note: String(assessment.note || '').trim().slice(0, 600) };
}
function normalizeImportedAction(action) {
  if (!action || typeof action.id !== 'string' || !action.id.trim() || typeof action.title !== 'string' || !action.title.trim()) throw new Error('Every imported action needs an id and title.');
  if (!LIFE_DOMAINS.includes(action.domain)) throw new Error('Every imported action needs a known domain.');
  const priority = ['critical', 'important', 'normal'].includes(action.priority) ? action.priority : 'normal';
  return { externalId: action.id.trim(), title: action.title.trim(), domain: action.domain, priority, nextAction: String(action.nextAction || '').trim(), deadline: lifeDate(action.deadline) ? action.deadline : '', status: 'open' };
}
function normalizeActionUpdate(update) {
  if (!update || typeof update.id !== 'string' || !['open', 'active', 'waiting', 'done', 'archived'].includes(update.status)) throw new Error('Invalid action update.');
  return { externalId: update.id.trim(), status: update.status };
}
function decodeAssistantImport(value) {
  const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
  const padded=normalized+'='.repeat((4-normalized.length%4)%4);
  const bytes=Uint8Array.from(atob(padded),character=>character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function openAssistantImportFromHash() {
  if (assistantImportOpened || !isSecurityUnlocked || !location.hash.startsWith('#kryos-import=')) return false;
  assistantImportOpened=true;
  try {
    const candidate=validateLifeImport(decodeAssistantImport(location.hash.slice('#kryos-import='.length)));
    if(lifeStore().entries.some(entry=>entry.packageId===candidate.id)) throw new Error('This journal is already in KRYOS.');
    lifePreview=candidate;
    lifeNotice=`Assistant import ready: review ${candidate.records.length} records before saving.`;
  } catch(error) {
    lifeNotice=`Import link could not be opened: ${error.message}`;
  }
  history.replaceState(null,'',`${location.pathname}${location.search}`);
  setPage('journal');
  return true;
}
function lifeCommit(data) {
  const store = lifeStore();
  if (store.entries.some(e => e.packageId === data.id)) throw new Error('This package has already been imported.');
  const entry = { id: createId(), packageId: data.id, date: data.date, text: data.text, createdAt: new Date().toISOString() };
  store.entries.push(entry);
  (data.actions || []).forEach(action => {
    if (!store.actions.some(item => item.externalId === action.externalId)) store.actions.push({ ...action, id: createId(), createdAt: new Date().toISOString(), completedAt: null });
  });
  (data.actionUpdates || []).forEach(update => {
    const action = store.actions.find(item => item.externalId === update.externalId);
    if (action) { action.status = update.status; action.completedAt = update.status === 'done' ? new Date().toISOString() : null; }
  });
  data.records.forEach(r => {
    store.records.push({ ...r, id: createId(), entryId: entry.id, date: entry.date });
    if (r.completed && r.actionRef) {
      const action = store.actions.find(item => item.externalId === r.actionRef);
      if (action) { action.status = 'done'; action.completedAt = new Date().toISOString(); }
    }
  });
  if (data.assessment) upsertDailyAssessment(store, data.assessment);
  saveTasks();
}
function upsertDailyAssessment(store, assessment) {
  const index = store.dailyAssessments.findIndex(item => item.date === assessment.date);
  const next = { ...assessment, reviewedAt: new Date().toISOString() };
  if (index >= 0) store.dailyAssessments[index] = next;
  else store.dailyAssessments.push(next);
}
function reconcileLifePackage(data, existingEntry) {
  const store = lifeStore();
  data.records.forEach(incoming => {
    const record = store.records.find(item => item.entryId === existingEntry.id && item.title === incoming.title);
    if (record) { record.effort = incoming.effort; record.actionRef = incoming.actionRef; }
  });
  (data.actions || []).forEach(action => {
    if (!store.actions.some(item => item.externalId === action.externalId)) store.actions.push({ ...action, id: createId(), createdAt: new Date().toISOString(), completedAt: null });
  });
  (data.actionUpdates || []).forEach(update => {
    const action = store.actions.find(item => item.externalId === update.externalId);
    if (action) { action.status = update.status; action.completedAt = update.status === 'done' ? new Date().toISOString() : null; }
  });
  if (data.assessment) upsertDailyAssessment(store, data.assessment);
  saveTasks();
}
function lifeBase64Bytes(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}
async function decryptBundledAssistantImports() {
  const bundle = window.KRYOS_ASSISTANT_IMPORTS_ENCRYPTED;
  if (!bundle || !securityState?.passHash || !window.crypto?.subtle || !window.DecompressionStream) return [];
  const material = new TextEncoder().encode(`kryos-assistant-data:${securityState.passHash}`);
  const digest = await crypto.subtle.digest('SHA-256', material);
  const key = await crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: lifeBase64Bytes(bundle.iv) }, key, lifeBase64Bytes(bundle.data));
  const stream = new Blob([decrypted]).stream().pipeThrough(new DecompressionStream(bundle.compression));
  return JSON.parse(await new Response(stream).text());
}
async function consumeBundledAssistantImports() {
  if (isDemoMode()) return 0;
  let packages;
  try {
    packages = await decryptBundledAssistantImports();
  } catch (error) {
    console.warn('KRYOS assistant package could not be decrypted.', error);
    return 0;
  }
  if (!Array.isArray(packages)) return 0;
  let imported = 0;
  packages.forEach(packageData => {
    const candidate = validateLifeImport(packageData);
    const existing = lifeStore().entries.find(entry => entry.packageId === candidate.id);
    if (existing) { reconcileLifePackage(candidate, existing); return; }
    lifeCommit(candidate);
    imported += 1;
  });
  if (imported) {
    lifeNotice = `${imported} reviewed journal ${imported === 1 ? 'entry' : 'entries'} added by your assistant.`;
    render();
  }
  return imported;
}
function innerCommandDayNumber(dateKey = toDateKey()) {
  const covenant = lifeStore().innerCommand.covenant;
  return Math.floor((getDateFromKey(dateKey) - getDateFromKey(covenant.startDate)) / 86400000) + 1;
}
function innerCommandEndDate() {
  const covenant = lifeStore().innerCommand.covenant;
  return toDateKey(addDays(getDateFromKey(covenant.startDate), covenant.days - 1));
}
function innerCommandRecord(dateKey) {
  return lifeStore().innerCommand.containmentDays.find(item => item.date === dateKey) || null;
}
function innerCommandStatus(dateKey) {
  const assessment = lifeStore().dailyAssessments.find(item => item.date === dateKey);
  if (assessment?.astrologySeeking) return 'breach';
  return innerCommandRecord(dateKey)?.status || 'unreviewed';
}
function innerCommandStats() {
  const { startDate, days } = lifeStore().innerCommand.covenant;
  const dates = Array.from({ length: days }, (_, index) => toDateKey(addDays(getDateFromKey(startDate), index)));
  const elapsed = dates.filter(date => date <= toDateKey());
  const kept = elapsed.filter(date => innerCommandStatus(date) === 'kept').length;
  const breaches = elapsed.filter(date => innerCommandStatus(date) === 'breach').length;
  let current = 0;
  for (let index = elapsed.length - 1; index >= 0; index -= 1) {
    const status = innerCommandStatus(elapsed[index]);
    if (status === 'kept') current += 1;
    else if (status === 'breach') break;
  }
  return { dates, elapsed: elapsed.length, kept, breaches, current };
}
function renderInnerCommandPurpose() {
  return `<section class="command-purpose"><div class="command-purpose-copy"><p class="section-kicker">WHY THIS EXISTS</p><h1>Govern the self. Offer the work.</h1><p>KRYOS protects attention, removes negotiation from right action, and turns discipline into an offering. The effort is yours. The result is not yours to command.</p><blockquote>Contain. Act. Complete. Surrender.</blockquote></div><div class="command-archetypes"><article><span>01</span><div><p>RAMA / DIRECTION</p><h2>Remain steady in changing conditions.</h2><small>Let dharma, truth, and the promise decide the action instead of the mood.</small></div></article><article><span>02</span><div><p>SITA / SHAKTI</p><h2>Protect the energy that makes action possible.</h2><small>Attention is living power. Give it a worthy direction instead of letting impulse spend it.</small></div></article><article><span>03</span><div><p>HANUMAN / SERVICE</p><h2>Treat your own work as entrusted work.</h2><small>Stop negotiating because the task is “for me.” Perform it with the sincerity you naturally give in service.</small></div></article></div></section>`;
}
function renderContainmentCovenant() {
  const store = lifeStore(), covenant = store.innerCommand.covenant, stats = innerCommandStats();
  const day = innerCommandDayNumber(), todayStatus = innerCommandStatus(toDateKey());
  const visibleDay = Math.max(0, Math.min(covenant.days, day));
  return `<section class="containment-command"><header><div><p class="section-kicker">45-DAY MIND CONTAINMENT</p><h2>${day < 1 ? `Begins ${formatDateKey(covenant.startDate)}` : day > covenant.days ? 'Covenant complete' : `Day ${day} of ${covenant.days}`}</h2><p>${formatDateKey(covenant.startDate)} to ${formatDateKey(innerCommandEndDate())}</p></div><div class="containment-score"><strong>${stats.current}</strong><span>current kept days</span><small>${stats.kept} kept · ${stats.breaches} honestly recorded</small></div></header><div class="containment-body"><div class="containment-boundaries"><article><i>${typeof rhythmIcon === 'function' ? rhythmIcon('shield-check') : ''}</i><div><strong>No astrology seeking</strong><span>No readings, predictions, chart checking, or reassurance loops during the covenant.</span></div></article><article><i>${typeof rhythmIcon === 'function' ? rhythmIcon('smartphone-off') : ''}</i><div><strong>No Instagram or Snapchat</strong><span>Do not hand your attention to feeds designed to keep it unfinished.</span></div></article><article><i>${typeof rhythmIcon === 'function' ? rhythmIcon('message-circle-off') : ''}</i><div><strong>No validation-seeking contact</strong><span>Healthy connection is allowed. Contact used to escape anxiety or obtain reassurance is the boundary.</span></div></article><article class="return"><i>${typeof rhythmIcon === 'function' ? rhythmIcon('rotate-ccw') : ''}</i><div><strong>Anxiety is not a breach</strong><span>Name the feeling. Breathe. Reduce the next action. Return without punishment.</span></div></article></div><div class="containment-calendar" style="--covenant-progress:${Math.round(visibleDay / covenant.days * 100)}%"><div class="containment-track"><i></i></div><div class="containment-days">${stats.dates.map((date,index) => `<button class="${innerCommandStatus(date)} ${date === toDateKey() ? 'today' : ''}" type="button" title="Day ${index + 1} · ${formatDateKey(date)} · ${innerCommandStatus(date)}" ${date > toDateKey() ? 'disabled' : ''}><span>${index + 1}</span></button>`).join('')}</div><div class="containment-legend"><span><i class="kept"></i>Kept</span><span><i class="breach"></i>Breach recorded</span><span><i></i>Unreviewed</span></div><div class="containment-today"><div><span>TODAY'S TRUTH</span><strong>${todayStatus === 'kept' ? 'Covenant kept' : todayStatus === 'breach' ? 'Breach acknowledged. Return now.' : 'Not reviewed yet'}</strong></div><button class="primary-button" data-containment="kept" ${day < 1 || day > covenant.days ? 'disabled' : ''}>Kept today</button><button class="secondary-button" data-containment="breach" ${day < 1 || day > covenant.days ? 'disabled' : ''}>Record breach</button></div></div></div></section>`;
}
function renderContainmentDialog() {
  if (!containmentDialogOpen) return '';
  return `<dialog id="containment-dialog" class="money-dialog containment-dialog"><form id="life-containment-form"><header><div><p class="section-kicker">TRUTH, THEN RETURN</p><h2>What boundary was crossed?</h2></div><button type="button" data-containment="close" aria-label="Close">×</button></header><div class="containment-breach-options"><label><input type="radio" name="boundary" value="astrology" required><span><strong>Astrology seeking</strong><small>Reading, prediction, chart check, or reassurance loop</small></span></label><label><input type="radio" name="boundary" value="social" required><span><strong>Instagram or Snapchat</strong><small>Feed use during the covenant</small></span></label><label><input type="radio" name="boundary" value="validation" required><span><strong>Validation-seeking contact</strong><small>Contact used primarily to escape or obtain reassurance</small></span></label><label class="containment-note"><span><strong>What happened?</strong><small>Brief facts, without punishment or justification.</small></span><textarea name="note" maxlength="500"></textarea></label></div><footer><button type="button" class="secondary-button" data-containment="close">Cancel</button><button class="primary-button">Record and return</button></footer></form></dialog>`;
}
function renderLifeJournal() {
  const store = lifeStore();
  const today = toDateKey();
  const todayRecords = store.records.filter(record => record.date === today && record.completed);
  const domains = new Set(todayRecords.map(record => record.domain));
  const streak = typeof journalProgressStreak === 'function' ? journalProgressStreak() : { current: 0 };
  journalView.innerHTML = `${renderInnerCommandPurpose()}${renderContainmentCovenant()}${renderContainmentDialog()}<header class="journal-title inner-journal-title"><div><p class="section-kicker">DAILY EVIDENCE</p><h1>Tell the truth about the day.</h1><p>Record what happened. KRYOS and your assistant can organize the signal.</p></div><div class="journal-today"><strong>${todayRecords.length}</strong><span>actions today</span><small>${domains.size} domains · ${streak.current} day rhythm</small></div></header>
    <div class="life-status" role="status">${escapeHtml(lifeNotice)}</div>
    <section class="life-compose premium-compose">
      <div class="compose-rail"><span>DAILY CAPTURE</span><strong>${new Date(`${today}T12:00:00`).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</strong><p>Work, body, mood, relationships, and whatever affected the day.</p></div>
      <form id="life-entry-form"><div class="compose-toolbar"><label>Date<input name="date" type="date" value="${today}" max="${today}" required></label><span class="draft-indicator"><i></i><span id="life-draft-status" aria-live="polite">${store.draft ? 'Draft preserved' : 'Ready to capture'}</span></span></div>
      <label class="life-wide journal-paper"><span>Journal entry</span><textarea name="text" id="life-draft" placeholder="Write the day as it happened. What moved, what resisted, what mattered?" required maxlength="100000">${escapeHtml(store.draft || '')}</textarea></label>
      <div class="compose-footer"><span>One honest record is enough.</span><button class="primary-button">Save to timeline</button></div></form>
    </section>
    <section class="life-section journal-history"><div class="life-heading"><div><p class="section-kicker">EVIDENCE LEDGER</p><h2>Your timeline</h2><p>${store.entries.length} entries preserved</p></div><input id="life-search" type="search" placeholder="Search entries" aria-label="Search journal"></div><div id="life-timeline" class="journal-timeline">${lifeTimeline()}</div></section>`;
}
function lifeTimeline(query = '') {
  const store = lifeStore();
  const entries = [...store.entries].sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).filter(e => `${e.text} ${e.date}`.toLowerCase().includes(query.toLowerCase()));
  return entries.length ? entries.map(e => {
    const records = store.records.filter(r => r.entryId === e.id);
    const completed = records.filter(r => r.completed);
    const domains = [...new Set(records.map(r => r.domain))];
    const date = new Date(`${e.date}T12:00:00`);
    return `<article class="life-entry premium-entry"><div class="entry-date"><span>${date.toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</span><strong>${date.getDate()}</strong><small>${date.toLocaleDateString(undefined,{weekday:'short'})}</small></div><div class="entry-body"><div class="entry-head"><div><time>${date.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}</time><div class="entry-chips">${domains.slice(0,4).map(domain => `<span>${escapeHtml(domain)}</span>`).join('')}${domains.length > 4 ? `<span>+${domains.length - 4}</span>` : ''}</div></div><div class="entry-score"><strong>${completed.length}</strong><span>done</span></div></div><p class="life-text">${escapeHtml(e.text)}</p>${records.length ? `<div class="entry-records">${records.map(r => `<div class="life-row"><span><i class="record-dot ${r.completed ? 'done' : ''}"></i><b>${escapeHtml(r.domain)}</b>${escapeHtml(r.title)}${r.minutes == null ? '' : `<small>${r.minutes} min</small>`}</span>${r.kind === 'task' ? `<button class="secondary-button" data-life="task" data-id="${r.id}">${r.completed ? 'Reopen' : 'Complete'}</button>` : ''}</div>`).join('')}</div>` : ''}<button class="life-delete" data-life="delete" data-id="${e.id}">Delete entry</button></div></article>`;
  }).join('') : '<div class="journal-empty"><strong>Your evidence begins here.</strong><p>A few truthful lines are enough to start the pattern.</p></div>';
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
  renderProgressDashboard();
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
    if (e.target.id === 'life-containment-form') {
      const store=lifeStore(),date=toDateKey(),existing=innerCommandRecord(date);
      const next={date,status:'breach',boundary:String(f.get('boundary')),note:String(f.get('note')||'').trim(),updatedAt:new Date().toISOString()};
      if(existing)Object.assign(existing,next);else store.innerCommand.containmentDays.push(next);
      containmentDialogOpen=false;saveTasks();lifeNotice='Breach recorded without excuses. Return through the next right action.';
    }
    if (e.target.id === 'life-entry-form') { lifeCommit(validateLifeImport({version:1,id:createId(),date:f.get('date'),text:f.get('text'),records:[]})); lifeStore().draft=''; saveTasks(); lifeNotice='Journal saved.'; }
    if (e.target.id === 'life-record-form') { const title=f.get('title').trim(); const kind=f.get('kind'); lifeCommit(validateLifeImport({version:1,id:createId(),date:f.get('date'),text:title,records:[{title,domain:f.get('domain'),kind,evidence:title,completed:kind==='activity',minutes:f.get('minutes')===''?null:Number(f.get('minutes'))}]})); lifeNotice='Record saved. No automatic VP for health or mood records.'; }
    if (e.target.id === 'life-import-form') { const candidate=validateLifeImport(JSON.parse(f.get('package'))); if(lifeStore().entries.some(x=>x.packageId===candidate.id))throw new Error('This package is already saved.'); lifePreview=candidate; lifeNotice='Review the proposed records below.'; }
  } catch(error) { lifeNotice=error.message; }
  renderLifeJournal();
});
document.addEventListener('click', async e => {
  const containment=e.target.closest('[data-containment]');
  if(containment){
    const store=lifeStore(),date=toDateKey(),status=containment.dataset.containment;
    if(status==='breach'){containmentDialogOpen=true;renderLifeJournal();setTimeout(()=>document.querySelector('#containment-dialog')?.showModal(),0);return;}
    if(status==='close'){document.querySelector('#containment-dialog')?.close();containmentDialogOpen=false;renderLifeJournal();return;}
    const existing=store.innerCommand.containmentDays.find(item=>item.date===date);
    const next={date,status,updatedAt:new Date().toISOString()};
    if(existing)Object.assign(existing,next);else store.innerCommand.containmentDays.push(next);
    saveTasks();lifeNotice=status==='kept'?'Containment recorded. Keep moving.':'Breach recorded without excuses. Return through the next right action.';renderLifeJournal();return;
  }
  const button=e.target.closest('[data-life]'); if(!button)return;
  const action=button.dataset.life;
  try {
    if(action==='approve' && lifePreview) {
      lifeCommit(lifePreview);lifePreview=null;lifeNotice='Import saved on this device. Records now appear in Progress.';
      if(!isDemoMode() && await getSupabaseSession()) {
        await pushToSupabase();
        lifeNotice=syncState.status==='connected'?'Import saved and synced to your personal cloud profile.':`Import saved locally. ${syncNotice}`;
      }
    }
    if(action==='cancel')lifePreview=null;
    if(action==='delete' && confirm('Delete this journal entry and its linked records?')) {const s=lifeStore();s.entries=s.entries.filter(x=>x.id!==button.dataset.id);s.records=s.records.filter(x=>x.entryId!==button.dataset.id);saveTasks();}
    if(action==='task') {const r=lifeStore().records.find(x=>x.id===button.dataset.id);if(r){r.completed=!r.completed;saveTasks();}}
    if(action==='day'){lifeSelectedDate=button.dataset.date;renderLifeProgress();return;}
  }catch(error){lifeNotice=error.message;}
  renderLifeJournal();
});
