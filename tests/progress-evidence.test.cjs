const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const context = vm.createContext({ toDateKey: value => String(value).slice(0, 10), rhythmHabit: id => ({ title: id }) });
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../progress-evidence.js'), 'utf8'), context);
const collect = context.collectProgressEvidence;
test('combines direct sources and counts linked journal evidence once', () => {
  const life = { actions: [{ id:'a', status:'done', completedAt:'2026-09-26', title:'Action' }], records:[{ id:'j', actionRef:'a', date:'2026-09-26', completed:true }] };
  const tasks = { rhythm:{ events:[{ id:'r', habitId:'water', value:1, date:'2026-09-26' }] }, launch:{ marketEvents:[{ id:'l', type:'application', date:'2026-09-26' }], mockSessions:[{ id:'m', completed:true, date:'2026-09-26' }] } };
  const career = { activityLog:[{ id:'c', checkId:'check', date:'2026-09-26' }] };
  assert.equal(collect(life, tasks, career, '2026-09-26').length, 5);
});
test('reopened actions override linked completed journal rows', () => {
  const life = { actions:[{ id:'a', status:'open' }], records:[{ id:'j', actionRef:'a', completed:true, date:'2026-09-26' }] };
  assert.equal(collect(life, {}, {}, '2026-09-26').length, 0);
});
test('ignores zero Rhythm, draft posts, and future evidence; retains journal-only history', () => {
  const life = { records:[{ id:'j', completed:true, date:'2026-09-25' }, { id:'f', completed:true, date:'2026-09-27' }] };
  const tasks = { rhythm:{ events:[{ id:'r', value:0, date:'2026-09-26' }] }, launch:{ marketEvents:[{ id:'d', type:'post', status:'draft', date:'2026-09-26' }] } };
  assert.equal(collect(life, tasks, {}, '2026-09-26').length, 1);
});
