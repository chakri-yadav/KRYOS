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
    innerCommand: { covenant: { startDate: '2026-09-19', days: 45 }, containmentDays: [] },
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
    rhythmHabit: id => ({ id, title: id, group: id.startsWith('spirit') ? 'spirit' : 'daily' }),
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
  assert.deepEqual({ ...context.journalRewardStats() }, { daily: 21, weekly: 2, earned: 23, spent: 0, balance: 23 });
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

test('empty cloud ledger reports a successful connection rather than appearing inert', async () => {
  const { context } = setup({
    getSupabaseSession: async () => ({ user: { id: 'user-id', email: 'owner@example.com' } }),
    getSupabaseClient: () => ({ rpc: async () => ({ data: { balance: 0, accepted: false }, error: null }) }),
  });
  await context.syncRewardLedger();
  assert.equal(vm.runInContext('rewardCloudNotice', context), 'Cloud connected. Nothing to upload until you confirm a qualifying daily review.');
});

test('astrology covenant preserves prior kept days and requires a final review', () => {
  const containmentDays = Array.from({ length: 46 }, (_, index) => ({ date: dateAt(index), status: index === 4 ? 'breach' : 'kept', boundary: index === 4 ? 'astrology' : '' }));
  const first = setup({ life: { innerCommand: { covenant: { startDate: '2026-09-19', days: 45 }, containmentDays } } }).context.covenantStats(dateAt(45));
  assert.equal(first.qualified, 45);
  assert.equal(first.breaches, 1);
  assert.equal(first.unlocked, false);
  const reviewed = setup({ life: { innerCommand: { covenant: { startDate: '2026-09-19', days: 45 }, containmentDays }, dailyAssessments: [assessment(dateAt(45), 9, { ruleVersion: 2, covenantReviewApproved: true })] } }).context.covenantStats(dateAt(45));
  assert.equal(reviewed.unlocked, true);
});
