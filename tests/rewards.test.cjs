const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function dateAt(index) {
  const date = new Date('2026-09-19T12:00:00');
  date.setDate(date.getDate() + index);
  return date.toISOString().slice(0, 10);
}

function setup(overrides = {}) {
  const store = {
    entries: [], records: [], actions: [], rewardRedemptions: [], dailyAssessments: [],
    innerCommand: { covenant: { startDate: '2026-09-19', days: 55 }, containmentDays: [] },
    ...overrides.life,
  };
  const taskState = { launch: { marketEvents: [], mockSessions: [] }, rhythm: { events: [] }, money: { contacts: [] }, ...overrides.tasks };
  const context = vm.createContext({
    document: { addEventListener() {} }, taskState, careerState: overrides.career || { activityLog: [] },
    currentPage: 'none', syncState: { status: 'connected' },
    lifeStore: () => store, saveTasks() {}, createId: () => 'review-id',
    lifeDate: value => /^\d{4}-\d{2}-\d{2}$/.test(value),
    toDateKey: value => value ? new Date(value).toISOString().slice(0, 10) : '2026-11-30',
    getDateFromKey: value => new Date(`${value}T12:00:00`),
    upsertDailyAssessment: (target, assessment) => {
      const index = target.dailyAssessments.findIndex(item => item.date === assessment.date);
      if (index >= 0) target.dailyAssessments[index] = assessment; else target.dailyAssessments.push(assessment);
    },
    rhythmHabit: id => ({ id, title: id, group: ['nama-japa','aditya','chalisa','gita','meditation','pranayama'].includes(id) ? 'spirit' : 'daily', target: ['aditya','chalisa'].includes(id) ? 3 : 1 }),
    rhythmTarget: habit => habit.target || 1,
    rhythmValue: (id,date) => Number(taskState.rhythm.events.find(event => event.habitId === id && event.date === date)?.value || 0),
    rhythmDay: date => ({ qualified: overrides.foundationDates?.includes(date) || false }),
    getSupabaseSession: overrides.getSupabaseSession || (async () => null),
    ensureSupabaseProfile: async () => 'profile-id',
    getSupabaseClient: overrides.getSupabaseClient || (() => null),
    escapeHtml: String, formatDateKey: String,
  });
  vm.runInContext(fs.readFileSync('reward-engine.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('rewards.js', 'utf8'), context);
  return { context, store, taskState };
}

function assessment(date, total, extra = {}) { return { date, total, qualified: true, astrologySeeking: false, ...extra }; }

test('historical assessments retain their original credit rules', () => {
  const { context } = setup({ life: { dailyAssessments: [assessment('2026-09-19', 10), assessment('2026-09-20', 8)] } });
  assert.equal(context.journalRewardStats().daily, 3);
});

test('modern reviews award one, two, or three bounded credits', () => {
  const reviews = [5, 7, 9].map((total, index) => assessment(dateAt(index), total, { ruleVersion: 2 }));
  const { context } = setup({ life: { dailyAssessments: reviews } });
  assert.equal(context.journalRewardStats().daily, 6);
});

test('five modern qualifying days earn only the bounded weekly bonus', () => {
  const reviews = Array.from({ length: 7 }, (_, index) => assessment(dateAt(index), 9, { ruleVersion: 2 }));
  const { context } = setup({ life: { dailyAssessments: reviews } });
  assert.deepEqual({ ...context.journalRewardStats() }, { daily: 21, weekly: 2, earned: 23, spent: 0, balance: 23, adjustmentDue: 0 });
});

test('launch evidence is capped and requires real exposure', () => {
  const marketEvents = Array.from({ length: 6 }, (_, index) => ({ id: `m${index}`, date: '2026-09-19', type: 'application', topic: `Application ${index}` }));
  marketEvents.push({ id: 'draft', date: '2026-09-19', type: 'post', status: 'draft', topic: 'Draft only' });
  const { context } = setup({ tasks: { launch: { marketEvents, mockSessions: [{ id: 'mock', date: '2026-09-19', minutes: 20 }] } } });
  const evidence = context.rewardEvidence('2026-09-19');
  assert.equal(evidence.scores.launch, 3);
  assert.equal(evidence.total, 3);
  assert.equal(evidence.qualified, false);
});

test('reward qualification exposes both evidence and grounded-action gates', () => {
  const { context } = setup();
  assert.deepEqual({ ...context.rewardQualification({ total: 4, scores: { launch: 0, career: 0, responsibility: 0 } }) }, { pointsMet: false, groundedMet: false, remainingPoints: 1, qualified: false });
  assert.deepEqual({ ...context.rewardQualification({ total: 5, scores: { launch: 0, career: 1, responsibility: 0 } }) }, { pointsMet: true, groundedMet: true, remainingPoints: 0, qualified: true });
});

test('module completion enters the bounded Career evidence lane', () => {
  const date = '2026-09-19';
  const { context } = setup({ career: { activityLog: [{ id: 'module-event', date, eventType: 'module-complete', moduleId: 'module-one', moduleTitle: 'Backend foundation', checkText: 'Backend foundation completed on time' }] } });
  const evidence = context.rewardEvidence(date);
  assert.equal(evidence.scores.career, 1);
  assert.equal(evidence.buckets.career[0].title, 'Backend foundation completed on time');
});

test('all active workspaces feed one capped reward review', () => {
  const date = '2026-09-19';
  const { context } = setup({
    life: {
      entries: [{ date, text: 'Closed the day honestly.' }],
      records: [{ id: 'spiritual-record', date, completed: true, domain: 'Spiritual practice', title: 'Prayer' }],
      actions: [{ id: 'action-one', title: 'Important responsibility', priority: 'important', deadline: date, status: 'done', completedAt: `${date}T18:00:00Z` }],
      innerCommand: { covenant: { startDate: date, days: 55 }, containmentDays: [{ date, status: 'kept' }] },
    },
    tasks: {
      launch: { marketEvents: [
        { id: 'application', date, type: 'application' },
        { id: 'connection', date, type: 'connection' },
        { id: 'post', date, type: 'post', status: 'published' },
      ], mockSessions: [] },
      rhythm: { events: [{ id: 'spirit-one', date, habitId: 'spirit-japa', value: 1 }] },
      money: { contacts: [{ id: 'contact-one', date }] },
    },
    career: { activityLog: [
      { id: 'career-one', date, checkId: 'one', checkText: 'Array problem' },
      { id: 'career-two', date, checkId: 'two', checkText: 'Graph problem' },
    ] },
    foundationDates: [date],
  });
  const evidence = context.rewardEvidence(date);
  assert.equal(evidence.total, 10);
  assert.equal(evidence.qualified, true);
  assert.deepEqual([...evidence.workspaces].sort(), ['Actions', 'Career', 'Inner Command', 'Launch', 'Money', 'Rhythm']);
  assert.deepEqual({ ...evidence.scores }, { launch: 3, career: 2, responsibility: 1, foundation: 1, spiritual: 1, containment: 1, closure: 1 });
});

test('only on-time important or critical actions earn the capped deadline evidence point', () => {
  const date = '2026-09-19';
  const actions = [
    { id: 'normal', title: 'Normal task', priority: 'normal', deadline: date, status: 'done', completedAt: `${date}T10:00:00Z` },
    { id: 'late', title: 'Late important task', priority: 'important', deadline: '2026-09-18', status: 'done', completedAt: `${date}T11:00:00Z` },
    { id: 'earned', title: 'Critical deadline', priority: 'critical', deadline: date, status: 'done', completedAt: `${date}T12:00:00Z` },
    { id: 'also-earned', title: 'Second important deadline', priority: 'important', deadline: date, status: 'done', completedAt: `${date}T13:00:00Z` },
  ];
  const evidence = setup({ life: { actions } }).context.rewardEvidence(date);
  assert.equal(evidence.scores.responsibility, 1);
  assert.equal(evidence.buckets.responsibility.length, 2);
  assert.match(evidence.buckets.responsibility[0].title, /on-time critical deadline/);
});

test('one source reference cannot earn through two pages', () => {
  const { context } = setup({
    life: { entries: [{ date: '2026-09-19', text: 'Closed the day' }], records: [{ id: 'journal', date: '2026-09-19', completed: true, domain: 'Job applications', title: 'Applied', sourceRef: 'launch:same' }] },
    tasks: { launch: { marketEvents: [{ id: 'same', date: '2026-09-19', type: 'application', topic: 'Applied' }], mockSessions: [] }, money: { contacts: [{ id: 'call', date: '2026-09-19' }] } },
    foundationDates: ['2026-09-19'],
  });
  const evidence = context.rewardEvidence('2026-09-19');
  assert.equal(evidence.buckets.launch.length, 1);
  assert.equal(evidence.total, 4);
});

test('large rewards require both qualifying days and calendar span', () => {
  const reviews = Array.from({ length: 12 }, (_, index) => assessment(dateAt(index), 9, { ruleVersion: 2 }));
  let result = setup({ life: { dailyAssessments: reviews } }).context.rewardEligibility({ days: 12, span: 21 });
  assert.equal(result.allowed, false);
  reviews[11].date = dateAt(20);
  result = setup({ life: { dailyAssessments: reviews } }).context.rewardEligibility({ days: 12, span: 21 });
  assert.equal(result.allowed, true);
});

test('music reward remains unavailable during its cooldown', () => {
  const reviews = [assessment('2026-11-20', 9, { ruleVersion: 2 }), assessment('2026-11-21', 9, { ruleVersion: 2 })];
  const reward = { id: 'music', days: 2, cooldownDays: 3 };
  const blocked = setup({ life: { dailyAssessments: reviews, rewardRedemptions: [{ rewardId: 'music', date: '2026-11-29', status: 'confirmed' }] } }).context.rewardEligibility(reward);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.missingCooldown, 2);
  const ready = setup({ life: { dailyAssessments: reviews, rewardRedemptions: [{ rewardId: 'music', date: '2026-11-26', status: 'confirmed' }] } }).context.rewardEligibility(reward);
  assert.equal(ready.allowed, true);
});

test('initiated call requires five qualified days inside the current seven-day window', () => {
  const old = Array.from({ length: 5 }, (_, index) => assessment(`2026-11-${String(index + 10).padStart(2, '0')}`, 9, { ruleVersion: 2 }));
  const blocked = setup({ life: { dailyAssessments: old } }).context.rewardEligibility({ id: 'initiated-call', qualifiedDaysInWindow: 5, windowDays: 7 });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.missingWindowDays, 5);
  const recent = ['2026-11-24','2026-11-25','2026-11-26','2026-11-27','2026-11-28'].map(date => assessment(date, 9, { ruleVersion: 2 }));
  const ready = setup({ life: { dailyAssessments: recent } }).context.rewardEligibility({ id: 'initiated-call', qualifiedDaysInWindow: 5, windowDays: 7 });
  assert.equal(ready.allowed, true);
  assert.equal(ready.qualifiedInWindow, 5);
});

test('empty cloud ledger reports a successful connection rather than appearing inert', async () => {
  const { context } = setup({
    getSupabaseSession: async () => ({ user: { id: 'user-id', email: 'owner@example.com' } }),
    getSupabaseClient: () => ({ rpc: async () => ({ data: { balance: 0, accepted: false }, error: null }) }),
  });
  await context.syncRewardLedger();
  assert.equal(vm.runInContext('rewardCloudNotice', context), 'Cloud connected. Recorded evidence will sync automatically.');
});

test('48-day Sadhana preserves aligned days without a manual final review', () => {
  const containmentDays = Array.from({ length: 49 }, (_, index) => ({ date: dateAt(index + 7), status: index === 4 ? 'breach' : 'kept', boundary: index === 4 ? 'astrology' : '' }));
  const first = setup({ life: { innerCommand: { covenant: { startDate: '2026-09-26', days: 48 }, containmentDays } } }).context.covenantStats(dateAt(55));
  assert.equal(first.qualified, 48);
  assert.equal(first.breaches, 1);
  assert.equal(first.unlocked, true);
});

test('v3 independently awards grouped nourishment, skincare, and spiritual evidence', () => {
  const date='2026-09-26';
  const events=['breakfast','lunch','protein','supplements','face-wash','moisturizer','gita','nama-japa'].map((habitId,index)=>({id:`e${index}`,date,habitId,value:1}));
  events.push({id:'water',date,habitId:'water',value:3});
  const evidence=setup({tasks:{rhythm:{events}}}).context.rewardEvidence(date);
  assert.equal(evidence.ruleVersion,3);
  assert.equal(evidence.scores.foundation,20);
  assert.equal(evidence.scores.care,6);
  assert.equal(evidence.scores.spiritual,8);
  assert.equal(evidence.total,34);
});

test('v3 requires full Aditya and Hanuman rounds before spiritual completion', () => {
  const date='2026-09-26';
  const partial=setup({tasks:{rhythm:{events:[
    {id:'aditya-1',date,habitId:'aditya',value:1},
    {id:'chalisa-1',date,habitId:'chalisa',value:2},
  ]}}}).context.rewardEvidence(date);
  assert.equal(partial.scores.spiritual,0);

  const complete=setup({tasks:{rhythm:{events:[
    {id:'aditya-3',date,habitId:'aditya',value:3},
    {id:'chalisa-3',date,habitId:'chalisa',value:3},
  ]}}}).context.rewardEvidence(date);
  assert.equal(complete.scores.spiritual,8);
});

test('v3 boundary deductions are capped and never create negative daily earnings', () => {
  const date='2026-09-26';
  const events=[{id:'protein',date,habitId:'protein',value:1}];
  const innerCommand={covenant:{startDate:date,days:48},containmentDays:[{date,status:'breach',boundary:'astrology',boundaries:['astrology','social','information','validation']}]};
  const evidence=setup({life:{innerCommand},tasks:{rhythm:{events}}}).context.rewardEvidence(date);
  assert.equal(evidence.gross,5);
  assert.equal(evidence.deductionRate,.2);
  assert.equal(evidence.deduction,1);
  assert.equal(evidence.total,4);
});

test('v3 Action scoring rewards deadlines modestly and caps the daily lane', () => {
  const date='2026-09-26';
  const actions=[
    {id:'late',title:'Late',priority:'important',deadline:'2026-09-25',status:'done',completedAt:`${date}T12:00:00Z`},
    {id:'critical',title:'Critical',priority:'critical',deadline:date,status:'done',completedAt:`${date}T13:00:00Z`},
    {id:'important',title:'Important',priority:'important',deadline:date,status:'done',completedAt:`${date}T14:00:00Z`},
  ];
  const evidence=setup({life:{actions}}).context.rewardEvidence(date);
  assert.equal(evidence.scores.responsibility,6);
  assert.equal(evidence.total,6);
});

test('v3 dated important evidence earns responsibility credit without an Action Vault item', () => {
  const date='2026-09-26';
  const records=[{id:'past-work',date,title:'Completed money order',domain:'Personal tasks',kind:'activity',completed:true,importance:'important',sourceRef:'evidence:past-work'}];
  const evidence=setup({life:{records,actions:[]}}).context.rewardEvidence(date);
  assert.equal(evidence.scores.responsibility,2);
  assert.equal(evidence.buckets.responsibility[0].source,'Journal evidence');
});

test('v3 skincare correction removes only the affected reward lane', () => {
  const date='2026-09-26';
  const events=[
    {id:'face',date,habitId:'face-wash',value:1},
    {id:'moisturizer',date,habitId:'moisturizer',value:1},
    {id:'protein',date,habitId:'protein',value:1},
  ];
  const {context,taskState}=setup({tasks:{rhythm:{events}}});
  assert.equal(context.rewardEvidence(date).scores.care,6);
  taskState.rhythm.events.find(event=>event.id==='moisturizer').value=0;
  const corrected=context.rewardEvidence(date);
  assert.equal(corrected.scores.care,0);
  assert.equal(corrected.scores.foundation,5);
  assert.equal(corrected.total,5);
});

test('v3 rolling maintenance gates enforce exercise, hair-care, and grocery spacing', () => {
  const events=[
    {id:'exercise-1',date:'2026-09-26',habitId:'exercise',value:1},
    {id:'exercise-2',date:'2026-09-27',habitId:'exercise',value:1},
    {id:'exercise-3',date:'2026-09-28',habitId:'exercise',value:1},
    {id:'hair-1',date:'2026-09-26',habitId:'hair-care',value:1},
    {id:'hair-2',date:'2026-09-27',habitId:'hair-care',value:1},
    {id:'grocery-1',date:'2026-09-26',habitId:'groceries',value:1},
    {id:'grocery-early',date:'2026-10-02',habitId:'groceries',value:1},
    {id:'grocery-ready',date:'2026-10-03',habitId:'groceries',value:1},
  ];
  const {context}=setup({tasks:{rhythm:{events}}});
  assert.equal(context.rewardEvidence('2026-09-26').scores.maintenance,12);
  assert.equal(context.rewardEvidence('2026-09-27').scores.maintenance,4);
  assert.equal(context.rewardEvidence('2026-09-28').scores.maintenance,0);
  assert.equal(context.rewardEvidence('2026-10-02').scores.maintenance,0);
  assert.equal(context.rewardEvidence('2026-10-03').scores.maintenance,0);
  const spacedEvents=events.filter(event=>event.id!=='grocery-early');
  assert.equal(setup({tasks:{rhythm:{events:spacedEvents}}}).context.rewardEvidence('2026-10-03').scores.maintenance,5);
});

test('v3 consistency bonuses require Career 5/7, Launch 4/5 weekdays, and articulation cadence', () => {
  const dates=['2026-09-28','2026-09-29','2026-09-30','2026-10-01','2026-10-02'];
  const reviews=dates.map((date,index)=>assessment(date,12,{ruleVersion:3,scores:{career:12,launch:index<4?12:0,articulation:index<3?(index===2?10:6):0}}));
  const bonuses=setup({life:{dailyAssessments:reviews}}).context.weeklyConsistencyBonuses(reviews);
  assert.equal(bonuses.find(item=>item.week.startsWith('career:')).credits,8);
  assert.equal(bonuses.find(item=>item.week.startsWith('launch:')).credits,8);
  assert.equal(bonuses.find(item=>item.week.startsWith('articulation:')).credits,4);
  assert.equal(bonuses.reduce((sum,item)=>sum+item.credits,0),20);
});
