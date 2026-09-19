const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
  const context = vm.createContext({
    taskState: {},
    document: { addEventListener() {} },
    toDateKey: date => date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : '2026-09-19',
  });
  vm.runInContext(`function lifeStore(){taskState.life ||= {entries:[],records:[],schedules:[]};return taskState.life}`, context);
  vm.runInContext(fs.readFileSync('progress.js', 'utf8'), context);
  return context;
}

test('journal streak counts consecutive recorded days', () => {
  const context = setup();
  context.lifeStore().entries.push(
    { date: '2026-09-17' },
    { date: '2026-09-18' },
    { date: '2026-09-19' },
  );
  assert.deepEqual({ ...context.journalProgressStreak() }, { current: 3, best: 3, total: 3 });
});

test('a gap preserves best streak and resets current streak', () => {
  const context = setup();
  context.lifeStore().entries.push(
    { date: '2026-09-14' },
    { date: '2026-09-15' },
    { date: '2026-09-17' },
  );
  assert.deepEqual({ ...context.journalProgressStreak() }, { current: 0, best: 2, total: 3 });
});

test('duplicate entries on one date count as one journal day', () => {
  const context = setup();
  context.lifeStore().entries.push({ date: '2026-09-19' }, { date: '2026-09-19' });
  assert.equal(context.journalProgressStreak().total, 1);
});
