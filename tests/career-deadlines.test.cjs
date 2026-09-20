const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(roadmaps, today = '2026-09-20') {
  const source = fs.readFileSync('app.js', 'utf8');
  const start = source.indexOf('function getChecklistStats');
  const end = source.indexOf('function getCareerStats', start);
  assert.ok(start >= 0 && end > start, 'Career deadline functions are missing');
  const context = {
    careerState: { roadmaps },
    isDateKey: value => /^\d{4}-\d{2}-\d{2}$/.test(value),
    getDateFromKey: value => new Date(`${value}T12:00:00`),
    toDateKey: value => value ? new Date(value).toISOString().slice(0, 10) : today,
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}\nthis.api={getModuleDeadlineState,getCareerDeadlineStats};`, context);
  return context.api;
}

function moduleWith({ targetDate = '', completedAt = '', done = 0, total = 2 } = {}) {
  return {
    id: Math.random().toString(36), title: 'Module', targetDate, completedAt,
    topics: [{ checklist: Array.from({ length: total }, (_, index) => ({ done: index < done })) }],
  };
}

test('module deadline states distinguish upcoming, overdue, on-time and late completion', () => {
  const roadmap = { id: 'r', modules: [] };
  const { getModuleDeadlineState } = setup([roadmap]);
  assert.equal(getModuleDeadlineState(moduleWith({ targetDate: '2026-09-25' }), '2026-09-20').key, 'due-soon');
  assert.equal(getModuleDeadlineState(moduleWith({ targetDate: '2026-09-18' }), '2026-09-20').key, 'overdue');
  assert.equal(getModuleDeadlineState(moduleWith({ targetDate: '2026-09-25', completedAt: '2026-09-24T18:00:00Z', done: 2 }), '2026-09-26').score, 100);
  assert.equal(getModuleDeadlineState(moduleWith({ targetDate: '2026-09-20', completedAt: '2026-09-25T18:00:00Z', done: 2 }), '2026-09-26').score, 70);
});

test('deadline aggregate scores only finished dated modules', () => {
  const modules = [
    moduleWith({ targetDate: '2026-09-20', completedAt: '2026-09-20T18:00:00Z', done: 2 }),
    moduleWith({ targetDate: '2026-09-20', completedAt: '2026-09-25T18:00:00Z', done: 2 }),
    moduleWith({ targetDate: '2026-09-19', done: 1 }),
    moduleWith(),
  ];
  const { getCareerDeadlineStats } = setup([{ id: 'r', title: 'Roadmap', modules }]);
  const stats = getCareerDeadlineStats('2026-09-20');
  assert.equal(stats.deliveryScore, 85);
  assert.equal(stats.onTimeRate, 50);
  assert.equal(stats.overdue, 1);
  assert.equal(stats.unscheduled, 1);
});
