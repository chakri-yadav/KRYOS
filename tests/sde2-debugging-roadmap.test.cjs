const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadRoadmapApi() {
  const source = fs.readFileSync('app.js', 'utf8');
  const start = source.indexOf('const SDE2_DEBUGGING_ROADMAP_VERSION');
  const end = source.indexOf('const defaultCareer', start);
  assert.ok(start >= 0 && end > start, 'SDE-2 debugging roadmap definitions are missing');
  const context = { structuredClone, Date };
  vm.createContext(context);
  vm.runInContext(
    `${source.slice(start, end)}\nthis.api = { SDE2_DEBUGGING_ROADMAP_VERSION, SDE2_DEBUGGING_PHASES, buildSde2DebuggingRoadmapModules, migrateSde2DebuggingRoadmap };`,
    context,
  );
  return context.api;
}

test('SDE-2 debugging roadmap has four progressive phases and integrated practice', () => {
  const { SDE2_DEBUGGING_PHASES, buildSde2DebuggingRoadmapModules } = loadRoadmapApi();
  const modules = buildSde2DebuggingRoadmapModules();
  const checks = modules.flatMap(module => module.topics.flatMap(topic => topic.checklist));
  assert.equal(modules.length, 5);
  assert.match(modules[0].title, /Trace code/);
  assert.match(modules[1].title, /Reproduce and minimize/);
  assert.match(modules[2].title, /Test boundaries/);
  assert.match(modules[3].title, /Interview-style/);
  assert.match(modules[4].title, /Integrated practice/);
  assert.ok(modules.every(module => module.topics.length >= 3));
  assert.ok(checks.length >= 55);
  assert.ok(checks.every(check => check.done === false));
  assert.equal(new Set(checks.map(check => check.id)).size, checks.length);
  assert.ok(SDE2_DEBUGGING_PHASES.every(phase => phase.topics.length > 0));
  assert.doesNotMatch(JSON.stringify(SDE2_DEBUGGING_PHASES), /Leadership Principles|on-call rotation|production RCA/i);
  assert.doesNotMatch(JSON.stringify(SDE2_DEBUGGING_PHASES), /Amazon/i);
});

test('migration adds one roadmap idempotently without changing existing roadmap or activity data', () => {
  const { migrateSde2DebuggingRoadmap } = loadRoadmapApi();
  const state = {
    roadmaps: [{ id: 'system-design', title: 'System Design Roadmap', modules: [{ id: 'keep' }] }],
    activityLog: [{ id: 'career-history' }],
    meta: {},
  };
  assert.equal(migrateSde2DebuggingRoadmap(state), true);
  assert.equal(state.roadmaps.length, 2);
  assert.equal(state.roadmaps[0].modules[0].id, 'keep');
  assert.equal(state.roadmaps[1].id, 'roadmap-sde2-debugging-interview');
  assert.equal(state.roadmaps[1].title, 'SDE-2 Interview Debugging Roadmap');
  assert.equal(state.roadmaps[1].modules.length, 5);
  assert.equal(state.activityLog[0].id, 'career-history');
  assert.equal(migrateSde2DebuggingRoadmap(state), false);
  assert.equal(state.roadmaps.length, 2);
});

test('migration preserves completed checklist evidence if its roadmap is reconciled', () => {
  const { migrateSde2DebuggingRoadmap } = loadRoadmapApi();
  const state = { roadmaps: [{ id: 'roadmap-sde2-debugging-interview', title: 'SDE-2 Interview Debugging Roadmap', modules: [] }], meta: {} };
  assert.equal(migrateSde2DebuggingRoadmap(state), true);
  state.roadmaps[0].modules[0].topics[0].checklist[0].done = true;
  delete state.meta.sde2DebuggingRoadmapVersion;
  assert.equal(migrateSde2DebuggingRoadmap(state), true);
  assert.equal(state.roadmaps[0].modules[0].topics[0].checklist[0].done, true);
});

