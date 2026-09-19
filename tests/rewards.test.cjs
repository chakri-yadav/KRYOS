const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(assessments = []) {
  const store = { records: [], rewardRedemptions: [], dailyAssessments: assessments };
  const context = vm.createContext({
    document: { addEventListener() {} },
    lifeStore: () => store,
    toDateKey: value => value ? new Date(value).toISOString().slice(0, 10) : '2026-09-19',
  });
  vm.runInContext(fs.readFileSync('rewards.js', 'utf8'), context);
  return { context, store };
}

function assessment(date, total = 9, extra = {}) { return { date, total, qualified: true, astrologySeeking: false, covenantReviewApproved: false, ...extra }; }

test('completed evidence does not automatically earn credits', () => {
  const { context, store } = setup();
  store.records.push(...Array.from({ length: 17 }, () => ({ completed: true, effort: 5 })));
  assert.equal(context.journalRewardStats().earned, 0);
});

test('daily credits are capped at two and weekly consistency is bounded', () => {
  const days = Array.from({ length: 7 }, (_, index) => assessment(`2026-09-${String(21 + index).padStart(2, '0')}`, 10));
  const { context } = setup(days);
  assert.deepEqual({ ...context.journalRewardStats() }, { daily: 14, weekly: 5, earned: 19, spent: 0, balance: 19 });
});

test('seven or eight scores earn one credit and unqualified days earn none', () => {
  const { context } = setup([assessment('2026-09-19', 8), assessment('2026-09-20', 10, { qualified: false })]);
  assert.equal(context.journalRewardStats().daily, 1);
});

test('astrology breach extends covenant and review remains mandatory', () => {
  const days = Array.from({ length: 36 }, (_, index) => assessment(contextDate(index)));
  days[0].astrologySeeking = true;
  let setupResult = setup(days);
  let result = setupResult.context.covenantStats('2026-11-10');
  assert.equal(result.end, '2026-11-05');
  assert.equal(result.unlocked, false);
  days.at(-1).covenantReviewApproved = true;
  setupResult = setup(days);
  result = setupResult.context.covenantStats('2026-11-10');
  assert.equal(result.unlocked, true);
});

function contextDate(index) {
  const date = new Date('2026-09-19T12:00:00');
  date.setDate(date.getDate() + index);
  return date.toISOString().slice(0, 10);
}
