const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadApiRoadmapApi() {
  const source = fs.readFileSync('app.js', 'utf8');
  const start = source.indexOf('const API_DESIGN_ROADMAP_VERSION');
  const end = source.indexOf('const defaultCareer', start);
  assert.ok(start >= 0 && end > start, 'API roadmap definitions are missing');
  const context = { structuredClone, Date };
  vm.createContext(context);
  vm.runInContext(
    `${source.slice(start, end)}\nthis.api = { API_DESIGN_ROADMAP_VERSION, API_DESIGN_PHASES, buildApiDesignRoadmapModules, migrateApiDesignRoadmap };`,
    context,
  );
  return context.api;
}

test('API roadmap preserves all nine phases and twenty interview questions', () => {
  const { buildApiDesignRoadmapModules } = loadApiRoadmapApi();
  const modules = buildApiDesignRoadmapModules();
  const topics = modules.flatMap(module => module.topics);
  const checks = topics.flatMap(topic => topic.checklist);
  const interviewNumbers = new Set(
    checks.map(check => check.text.match(/^#(\d+)/)?.[1]).filter(Boolean).map(Number),
  );

  assert.equal(modules.length, 9);
  assert.equal(topics.length, 27);
  assert.equal(checks.length, 97);
  assert.ok(checks.every(check => check.done === false));
  assert.equal(new Set(checks.map(check => check.id)).size, checks.length);
  assert.deepEqual([...interviewNumbers].sort((a, b) => a - b), Array.from({ length: 20 }, (_, index) => index + 1));
  assert.deepEqual(Array.from(modules, module => module.difficulty), [25, 30, 45, 55, 60, 70, 65, 75, 80]);
});

test('API roadmap migration adds one roadmap without changing existing career data', () => {
  const { migrateApiDesignRoadmap } = loadApiRoadmapApi();
  const state = {
    roadmaps: [{ id: 'dsa', title: 'DSA Roadmap', modules: [{ id: 'keep-dsa' }] }],
    activityLog: [{ id: 'keep-history' }],
    meta: {},
  };

  assert.equal(migrateApiDesignRoadmap(state), true);
  assert.equal(state.roadmaps.length, 2);
  assert.equal(state.roadmaps[0].modules[0].id, 'keep-dsa');
  assert.equal(state.roadmaps[1].id, 'roadmap-api-design');
  assert.equal(state.roadmaps[1].modules.length, 9);
  assert.equal(state.activityLog[0].id, 'keep-history');
  assert.equal(migrateApiDesignRoadmap(state), false);
  assert.equal(state.roadmaps.length, 2);
});
