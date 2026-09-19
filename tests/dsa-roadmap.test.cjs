const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadDsaRoadmapApi() {
  const source = fs.readFileSync('app.js', 'utf8');
  const start = source.indexOf('const DSA_ROADMAP_VERSION');
  const end = source.indexOf('const defaultCareer', start);
  assert.ok(start >= 0 && end > start, 'DSA roadmap definitions are missing');

  const context = { structuredClone, Date };
  vm.createContext(context);
  vm.runInContext(
    `${source.slice(start, end)}\nthis.api = { DSA_ROADMAP_VERSION, DSA_ROADMAP_GROUPS, buildDsaRoadmapModules, migrateDsaRoadmap };`,
    context,
  );
  return context.api;
}

test('DSA roadmap contains all supplied problems and starts unchecked', () => {
  const { buildDsaRoadmapModules } = loadDsaRoadmapApi();
  const modules = buildDsaRoadmapModules();
  const topics = modules.flatMap((module) => module.topics);
  const checks = topics.flatMap((topic) => topic.checklist);

  assert.equal(modules.length, 3);
  assert.equal(topics.length, 14);
  assert.equal(checks.length, 163);
  assert.ok(checks.every((check) => check.done === false));
  assert.equal(new Set(checks.map((check) => check.id)).size, checks.length);
});

test('DSA migration replaces only DSA content and runs once', () => {
  const { migrateDsaRoadmap } = loadDsaRoadmapApi();
  const state = {
    roadmaps: [
      { id: 'old-dsa', title: 'DSA Roadmap', purpose: 'Old', targetDate: '2027-01-01', modules: [] },
      { id: 'system-design', title: 'System Design Roadmap', modules: [{ id: 'keep-me' }] },
    ],
    activityLog: [{ id: 'history-kept' }],
    meta: {},
  };

  assert.equal(migrateDsaRoadmap(state), true);
  assert.equal(state.roadmaps.length, 2);
  assert.equal(state.roadmaps[0].id, 'old-dsa');
  assert.equal(state.roadmaps[0].targetDate, '2027-01-01');
  assert.equal(state.roadmaps[1].modules[0].id, 'keep-me');
  assert.equal(state.activityLog[0].id, 'history-kept');
  assert.equal(migrateDsaRoadmap(state), false);
});
