const HABITS = new Set(['breakfast', 'lunch', 'dinner', 'protein', 'supplements', 'water', 'face-wash', 'moisturizer', 'serum', 'eye-cream', 'sunscreen', 'exercise', 'hair-care', 'groceries', 'nama-japa', 'gita', 'chalisa', 'aditya', 'meditation', 'pranayama']);
const DOMAINS = new Set(['Career', 'Personal tasks', 'Job applications', 'Skincare', 'Supplements', 'Food', 'Sleep', 'Mood', 'Movement', 'Spiritual practice', 'Relationships', 'Other']);
const PRIORITIES = new Set(['critical', 'important', 'normal']);
const TYPES = new Set(['journal.capture', 'rhythm.measure', 'rhythm.complete', 'rhythm.reopen', 'action.create', 'action.complete', 'action.reopen', 'career.progress', 'career.check.complete', 'inner_command.observe']);

function fail(message) { throw new Error(message); }
function dateIsValid(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function present(value, max) { return typeof value === 'string' && value.trim().length > 0 && value.length <= max; }
function sameText(haystack, needle) { return haystack.includes(needle); }
function clone(value) { return structuredClone(value || {}); }
function eventId(requestId, index) { return `${requestId}:${index}`; }
function completionLooksLikeIntentOrNegation(statement, quote) {
  const position = statement.indexOf(quote);
  const clause = statement.slice(Math.max(0, statement.lastIndexOf('.', position) + 1), position + quote.length).toLowerCase();
  return /\b(?:should|need to|have to|plan to|will|want to|hope to|going to|didn['’]t|did not|haven['’]t|have not|never)\b/.test(clause);
}

export function validateRequest(request) {
  if (!request || request.schema_version !== 1) fail('Unsupported request schema.');
  if (!present(request.idempotency_key, 160) || !/^[a-zA-Z0-9:_-]+$/.test(request.idempotency_key)) fail('A stable idempotency key is required.');
  if (!dateIsValid(request.local_date)) fail('An explicit local date is required.');
  if (!present(request.timezone, 80)) fail('An IANA timezone is required.');
  try { new Intl.DateTimeFormat('en', { timeZone: request.timezone }); } catch { fail('Unknown timezone.'); }
  if (!present(request.raw_text, 100000)) fail('The original statement is required.');
  if (!Array.isArray(request.operations) || !request.operations.length || request.operations.length > 20) fail('Submit one to twenty operations.');
  for (const operation of request.operations) {
    if (!operation || !TYPES.has(operation.type)) fail('Unsupported operation.');
    if (!present(operation.evidence_quote, 1000) || !sameText(request.raw_text, operation.evidence_quote)) fail('Each operation needs an exact excerpt from the original statement.');
    if (['rhythm.complete', 'action.complete', 'career.progress', 'career.check.complete'].includes(operation.type) && completionLooksLikeIntentOrNegation(request.raw_text, operation.evidence_quote)) fail('This sounds like an intention or negation. Review before recording completion.');
    if (operation.type === 'journal.capture' && !present(operation.text, 100000)) fail('Journal text is required.');
    if (operation.type.startsWith('rhythm.')) {
      if (!HABITS.has(operation.habit_key)) fail('Unknown Rhythm habit.');
      if (operation.type === 'rhythm.measure' && operation.habit_key !== 'water') fail('Only water is measurable in this release.');
      if (operation.type !== 'rhythm.measure' && operation.habit_key === 'water') fail('Water needs a litre value.');
      if (operation.type === 'rhythm.measure' && (typeof operation.value !== 'number' || !Number.isFinite(operation.value) || operation.value < 0 || operation.value > 24 || operation.unit !== 'L')) fail('Water must be 0 to 24 L.');
    }
    if (operation.type === 'action.create') {
      if (!present(operation.title, 180) || !DOMAINS.has(operation.domain)) fail('An action needs a title and known domain.');
      if (operation.priority && !PRIORITIES.has(operation.priority)) fail('Unknown action priority.');
      if (operation.deadline && !dateIsValid(operation.deadline)) fail('Invalid action deadline.');
    }
    if (operation.type === 'action.complete' || operation.type === 'action.reopen') {
      if (!present(operation.action_id, 180)) fail('Use the exact action ID.');
    }
    if (operation.type === 'career.progress' && (!present(operation.title, 300) || !Number.isInteger(operation.count) || operation.count < 1 || operation.count > 100)) fail('Career progress needs a title and count from 1 to 100.');
    if (operation.type === 'career.check.complete' && !present(operation.check_id, 180)) fail('Use the exact career checklist ID.');
    if (operation.type === 'inner_command.observe' && !present(operation.note, 500)) fail('An observation note is required.');
  }
  return request;
}

export function projectRequest(request, taskPayload, careerPayload, now = new Date().toISOString()) {
  validateRequest(request);
  const tasks = clone(taskPayload);
  const career = clone(careerPayload);
  const life = tasks.life ||= { version: 1, entries: [], records: [], actions: [] };
  life.entries ||= []; life.records ||= []; life.actions ||= [];
  const rhythm = tasks.rhythm ||= { version: 1, events: [], settings: {} };
  rhythm.events ||= [];
  career.activityLog ||= [];
  const effects = [];
  const events = [];
  let tasksChanged = false;
  let careerChanged = false;
  request.operations.forEach((operation, index) => {
    const id = eventId(request.idempotency_key, index);
    const date = request.local_date;
    const evidence = operation.evidence_quote;
    switch (operation.type) {
      case 'journal.capture':
        life.entries.push({ id, packageId: id, date, text: operation.text.trim(), createdAt: now, source: 'assistant' });
        effects.push({ area: 'Journal', result: 'Entry saved' }); tasksChanged = true; break;
      case 'rhythm.measure':
      case 'rhythm.complete':
      case 'rhythm.reopen': {
        const value = operation.type === 'rhythm.complete' ? 1 : operation.type === 'rhythm.reopen' ? 0 : operation.value;
        const existing = rhythm.events.find(item => item.date === date && item.habitId === operation.habit_key);
        const next = { id: existing?.id || id, date, habitId: operation.habit_key, value, unit: operation.habit_key === 'water' ? 'L' : 'completion', source: `assistant:${id}`, updatedAt: now };
        if (existing) Object.assign(existing, next); else rhythm.events.push(next);
        effects.push({ area: 'Rhythm', result: operation.habit_key === 'water' ? `${value} L recorded` : `${operation.habit_key} ${value ? 'complete' : 'reopened'}` }); tasksChanged = true; break;
      }
      case 'action.create':
        life.actions.push({ id, externalId: id, title: operation.title.trim(), nextAction: String(operation.next_action || '').slice(0, 240), domain: operation.domain, priority: operation.priority || 'normal', deadline: operation.deadline || '', status: 'open', createdAt: now, updatedAt: now, completedAt: null });
        effects.push({ area: 'Actions', result: 'Action created' }); tasksChanged = true; break;
      case 'action.complete':
      case 'action.reopen': {
        const matching = life.actions.filter(item => item.id === operation.action_id || item.externalId === operation.action_id);
        if (matching.length !== 1) fail('Action ID is missing or ambiguous.');
        const action = matching[0];
        const nextStatus = operation.type === 'action.complete' ? 'done' : 'open';
        if (action.status !== nextStatus) {
          action.status = nextStatus;
          action.completedAt = nextStatus === 'done' ? now : null;
          action.updatedAt = now;
          tasksChanged = true;
        }
        effects.push({ area: 'Actions', result: action.status === 'done' ? 'Action completed' : 'Action reopened' }); break;
      }
      case 'career.progress':
        life.records.push({ id, entryId: null, date, title: `${operation.title.trim()} (${operation.count})`, domain: 'Career', kind: 'activity', evidence, minutes: null, completed: true, effort: Math.min(5, operation.count), sourceRef: `journal:${id}` });
        effects.push({ area: 'Career', result: `${operation.count} recorded` }); tasksChanged = true; break;
      case 'career.check.complete': {
        const matches = [];
        for (const roadmap of career.roadmaps || []) for (const module of roadmap.modules || []) for (const topic of module.topics || []) for (const check of topic.checklist || []) if (check.id === operation.check_id) matches.push({ roadmap, module, topic, check });
        if (matches.length !== 1) fail('Career checklist ID is missing or ambiguous.');
        const { roadmap, module, topic, check } = matches[0];
        if (!check.done) {
          check.done = true;
          career.activityLog.push({ id, date, checkId: check.id, checkText: check.text, topicId: topic.id, topicTitle: topic.title, moduleId: module.id, moduleTitle: module.title, roadmapId: roadmap.id, roadmapTitle: roadmap.title, createdAt: now, source: 'assistant' });
          careerChanged = true;
        }
        effects.push({ area: 'Career', result: check.done ? 'Checklist item complete' : 'Checklist item unchanged' }); break;
      }
      case 'inner_command.observe':
        life.records.push({ id, entryId: null, date, title: operation.note.trim(), domain: 'Mood', kind: 'observation', evidence, minutes: null, completed: false, effort: 0, sourceRef: '' });
        effects.push({ area: 'Inner Command', result: 'Observation recorded' }); tasksChanged = true; break;
    }
    events.push({ id, type: operation.type, date, evidence_quote: evidence, payload: operation });
  });
  if (tasksChanged) tasks.meta = { ...(tasks.meta || {}), updatedAt: now };
  if (careerChanged) career.meta = { ...(career.meta || {}), updatedAt: now };
  return { tasks, career, events, effects, tasksChanged, careerChanged };
}
