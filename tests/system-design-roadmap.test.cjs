const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadRoadmapApi() {
  const source = fs.readFileSync('app.js', 'utf8');
  const dataSource = fs.readFileSync('system-design-sde2-roadmap-data.js', 'utf8');
  const start = source.indexOf('const SYSTEM_DESIGN_ROADMAP_VERSION');
  const end = source.indexOf('const defaultCareer', start);
  assert.ok(start >= 0 && end > start, 'system design roadmap definitions are missing');
  const context = { structuredClone, Date, window: {} };
  vm.createContext(context);
  vm.runInContext(dataSource, context);
  vm.runInContext(
    `${source.slice(start, end)}\nthis.api = { SYSTEM_DESIGN_ROADMAP_VERSION, SYSTEM_DESIGN_ROADMAP_CLEANUP_VERSION, SYSTEM_DESIGN_MODULES, buildSystemDesignRoadmapModules, migrateSystemDesignRoadmap, migrateSystemDesignRoadmapCleanup };`,
    context,
  );
  return context.api;
}

test('imports the supplied SDE-2 HLD structure, depth levels, topics, practice, and final designs verbatim', () => {
  const { SYSTEM_DESIGN_MODULES, buildSystemDesignRoadmapModules } = loadRoadmapApi();
  const modules = buildSystemDesignRoadmapModules();
  const allChecks = modules.flatMap(module => module.topics.flatMap(topic => topic.checklist));

  assert.equal(modules.length, 16);
  assert.equal(SYSTEM_DESIGN_MODULES.filter(module => /^MODULE \d+/.test(module.title)).length, 14);
  assert.deepEqual(Array.from(SYSTEM_DESIGN_MODULES.slice(1, 15), module => module.title.match(/^MODULE (\d+)/)?.[1]),
    Array.from({ length: 14 }, (_, index) => String(index + 1)));
  assert.equal(modules[0].title, 'DEPTH LEVELS');
  assert.deepEqual(Array.from(modules[0].topics, topic => topic.title.match(/^L\d/)?.[0]), ['L4', 'L3', 'L2', 'L1', 'L0']);
  assert.equal(modules[1].title, 'MODULE 1 — SYSTEM DESIGN INTERVIEW FRAMEWORK');
  assert.equal(modules[2].title, 'MODULE 2 — URL SHORTENER');
  assert.equal(modules[14].title, 'MODULE 14 — SDE-2 PRODUCTION FOLLOW-UPS');
  assert.equal(modules[15].title, 'FINAL CLOSED-BOOK PRACTICE');
  assert.equal(modules.slice(1, 15).flatMap(module => module.topics.find(topic => topic.title === 'TOPICS').checklist).length, 392);
  assert.ok(allChecks.length >= 460);
  assert.ok(allChecks.every(check => check.done === false));
  assert.equal(new Set(allChecks.map(check => check.id)).size, allChecks.length);
  assert.deepEqual(Array.from(modules.slice(11, 14), module => module.pattern), [
    'OPTIONAL / STRETCH FOR CORE SDE-2', 'OPTIONAL / STRETCH', 'OPTIONAL / STRETCH',
  ]);
  assert.ok(modules[1].topics.find(topic => topic.title === 'PRACTICE').checklist.some(check => check.text.includes('4-step framework')));
  assert.ok(modules[14].topics.find(topic => topic.title === 'PRACTICE').checklist.some(check => check.text.includes('reconnect storm')));
  assert.deepEqual(Array.from(modules[15].topics, topic => topic.title), ['CORE', 'SHORT CONCEPT DESIGNS', 'OPTIONAL']);
  assert.match(modules[15].topics[0].checklist[0].text, /Chapter 8 — Design a URL Shortener/);
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
  assert.equal(state.roadmaps[1].title, 'System Design Roadmap');
  assert.equal(state.roadmaps[1].modules.length, 16);
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
    meta: { systemDesignRoadmapVersion: 3 },
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
  assert.equal(state.roadmaps[0].modules.length, 16);
  assert.equal(state.meta.systemDesignRoadmapVersion, 4);
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

test('versioned replacement preserves matching checks and updates the existing roadmap in place', () => {
  const { SYSTEM_DESIGN_ROADMAP_VERSION, SYSTEM_DESIGN_ROADMAP_CLEANUP_VERSION, migrateSystemDesignRoadmap, migrateSystemDesignRoadmapCleanup } = loadRoadmapApi();
  const state = { roadmaps: [{ id: 'roadmap-system-design-book', title: 'System Design Roadmap', modules: [] }], activityLog: [{ id: 'old-history' }], meta: { systemDesignRoadmapVersion: 2 } };
  state.roadmaps[0].modules = buildSystemDesignRoadmapModulesForTest();
  state.roadmaps[0].modules[1].topics.find(topic => topic.title === 'TOPICS').checklist[0].done = true;
  assert.equal(migrateSystemDesignRoadmap(state), true);
  assert.equal(migrateSystemDesignRoadmapCleanup(state), true);
  assert.equal(state.roadmaps.length, 1);
  assert.equal(state.roadmaps[0].title, 'System Design Roadmap');
  assert.equal(state.roadmaps[0].modules[1].topics.find(topic => topic.title === 'TOPICS').checklist[0].done, true);
  assert.equal(state.activityLog[0].id, 'old-history');
  assert.equal(state.meta.systemDesignRoadmapVersion, SYSTEM_DESIGN_ROADMAP_CLEANUP_VERSION);
  assert.ok(SYSTEM_DESIGN_ROADMAP_VERSION < SYSTEM_DESIGN_ROADMAP_CLEANUP_VERSION);
});
