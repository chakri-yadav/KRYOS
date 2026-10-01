const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadRoadmapApi() {
  const source = fs.readFileSync('app.js', 'utf8');
  const start = source.indexOf('const SYSTEM_DESIGN_ROADMAP_VERSION');
  const end = source.indexOf('const defaultCareer', start);
  assert.ok(start >= 0 && end > start, 'system design roadmap definitions are missing');
  const context = { structuredClone, Date };
  vm.createContext(context);
  vm.runInContext(
    `${source.slice(start, end)}\nthis.api = { SYSTEM_DESIGN_ROADMAP_VERSION, SYSTEM_DESIGN_MODULES, buildSystemDesignRoadmapModules, migrateSystemDesignRoadmap, migrateSystemDesignRoadmapCleanup };`,
    context,
  );
  return context.api;
}

test('book-based SDE roadmap covers Chapters 1–15 plus operations and synthesis', () => {
  const { SYSTEM_DESIGN_MODULES, buildSystemDesignRoadmapModules } = loadRoadmapApi();
  const modules = buildSystemDesignRoadmapModules();
  const allChecks = modules.flatMap(module => module.topics.flatMap(topic => topic.checklist));

  assert.equal(modules.length, 17);
  assert.deepEqual(Array.from(SYSTEM_DESIGN_MODULES.slice(0, 15), module => module[2].match(/Chapter (\d+)/)?.[1]),
    Array.from({ length: 15 }, (_, index) => String(index + 1)));
  assert.ok(modules.every(module => module.topics.some(topic => topic.title === 'Practice')));
  assert.ok(allChecks.length >= 120);
  assert.ok(allChecks.every(check => check.done === false));
  assert.equal(new Set(allChecks.map(check => check.id)).size, allChecks.length);
  assert.match(modules[16].goal, /Consolidation/);
  assert.ok(modules[8].pattern.includes('stretch'));
  assert.ok(modules[13].pattern.includes('stretch'));
  assert.ok(modules[14].pattern.includes('stretch'));
});

test('migration adds roadmap once and preserves existing career history and same-title roadmap', () => {
  const { migrateSystemDesignRoadmap } = loadRoadmapApi();
  const state = {
    roadmaps: [{ id: 'legacy-system', title: 'System Design Roadmap', modules: [{ id: 'keep-me' }] }],
    activityLog: [{ id: 'history' }],
    meta: {},
  };

  assert.equal(migrateSystemDesignRoadmap(state), true);
  assert.equal(state.roadmaps.length, 2);
  assert.equal(state.roadmaps[0].modules[0].id, 'keep-me');
  assert.equal(state.roadmaps[1].id, 'roadmap-system-design-book');
  assert.equal(state.roadmaps[1].title, 'System Design Roadmap (Book-Based)');
  assert.equal(state.roadmaps[1].modules.length, 17);
  assert.equal(state.activityLog[0].id, 'history');
  assert.equal(migrateSystemDesignRoadmap(state), false);
  assert.equal(state.roadmaps.length, 2);
});

test('cleanup keeps the book roadmap, removes only same-purpose duplicates, and retains progress/history', () => {
  const { migrateSystemDesignRoadmap, migrateSystemDesignRoadmapCleanup } = loadRoadmapApi();
  const state = {
    roadmaps: [
      { id: 'legacy-system-design', title: 'System Design Roadmap', modules: [{ id: 'legacy' }] },
      { id: 'roadmap-system-design-book', title: 'System Design Roadmap (Book-Based)', modules: [] },
      { id: 'other-path', title: 'Distributed Systems Reading', modules: [{ id: 'keep-other' }] },
    ],
    activityLog: [{ id: 'historical-completion', roadmapId: 'legacy-system-design' }],
    meta: { systemDesignRoadmapVersion: 1 },
  };

  assert.equal(migrateSystemDesignRoadmap(state), false);
  const keeper = state.roadmaps.find(item => item.id === 'roadmap-system-design-book');
  keeper.modules = buildSystemDesignRoadmapModulesForTest();
  const first = keeper.modules[0].topics[0].checklist[0];
  first.done = true;
  assert.equal(migrateSystemDesignRoadmapCleanup(state), true);
  assert.equal(state.roadmaps.length, 2);
  assert.equal(state.roadmaps[0].id, 'roadmap-system-design-book');
  assert.equal(state.roadmaps[0].title, 'System Design Roadmap');
  assert.equal(state.roadmaps[0].modules[0].topics[0].checklist[0].done, true);
  assert.equal(state.roadmaps[1].id, 'other-path');
  assert.equal(state.activityLog[0].id, 'historical-completion');
  assert.equal(migrateSystemDesignRoadmapCleanup(state), false);
});

function buildSystemDesignRoadmapModulesForTest() {
  return loadRoadmapApi().buildSystemDesignRoadmapModules();
}

test('cleanup imports first when the prior roadmap migration has not run yet', () => {
  const { migrateSystemDesignRoadmapCleanup } = loadRoadmapApi();
  const state = { roadmaps: [], activityLog: [], meta: {} };
  assert.equal(migrateSystemDesignRoadmapCleanup(state), true);
  assert.equal(state.roadmaps.length, 1);
  assert.equal(state.roadmaps[0].title, 'System Design Roadmap');
  assert.equal(state.roadmaps[0].modules.length, 17);
  assert.equal(state.meta.systemDesignRoadmapVersion, 2);
});

test('cleanup retains completed checklist evidence when reconciling the book roadmap', () => {
  const { migrateSystemDesignRoadmap } = loadRoadmapApi();
  const state = { roadmaps: [{ id: 'roadmap-system-design-book', title: 'System Design Roadmap', modules: [] }], meta: {} };
  assert.equal(migrateSystemDesignRoadmap(state), true);
  const first = state.roadmaps[0].modules[0].topics[0].checklist[0];
  first.done = true;
  delete state.meta.systemDesignRoadmapVersion;
  assert.equal(migrateSystemDesignRoadmap(state), true);
  assert.equal(state.roadmaps[0].modules[0].topics[0].checklist[0].done, true);
});
