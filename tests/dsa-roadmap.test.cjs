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
    `${source.slice(start, end)}\nthis.api = { DSA_ROADMAP_VERSION, DSA_LEGACY_ROADMAP_GROUPS, DSA_NEETCODE_MODULES, buildDsaRoadmapModules, migrateDsaRoadmap };`,
    context,
  );
  return context.api;
}

test('DSA roadmap separates the exact NeetCode 150 from preserved extra practice', () => {
  const { buildDsaRoadmapModules } = loadDsaRoadmapApi();
  const modules = buildDsaRoadmapModules();
  const topics = modules.flatMap((module) => module.topics);
  const core = topics.filter((topic) => topic.lane === 'core').flatMap((topic) => topic.checklist);
  const extras = topics.filter((topic) => topic.lane === 'extra').flatMap((topic) => topic.checklist);

  assert.equal(modules.length, 18);
  assert.equal(topics.length, 36);
  assert.equal(core.length, 150);
  assert.equal(extras.length, 72);
  assert.ok([...core, ...extras].every((check) => check.done === false));
  assert.equal(new Set(core.map((check) => check.text)).size, 150);
  assert.equal(modules[0].title, 'Arrays & Hashing');
  assert.equal(modules.at(-1).title, 'Bit Manipulation');
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

test('DSA migration preserves completion through normalized problem names', () => {
  const { migrateDsaRoadmap } = loadDsaRoadmapApi();
  const state = {
    roadmaps: [{ id: 'dsa', title: 'DSA Roadmap', modules: [{ id: 'old', title: 'Old', topics: [{ id: 'old-topic', title: 'Trees / BST', checklist: [
      { id: 'done-one', text: 'LCA of BST', done: true },
      { id: 'done-two', text: 'Path Sum III', done: true },
    ] }] }] }],
    meta: { dsaRoadmapVersion: 1 },
  };
  assert.equal(migrateDsaRoadmap(state), true);
  const checks = state.roadmaps[0].modules.flatMap(module => module.topics.flatMap(topic => topic.checklist));
  assert.equal(checks.find(check => check.text === 'Lowest Common Ancestor of a Binary Search Tree').done, true);
  assert.equal(checks.find(check => check.text === 'Path Sum III').done, true);
});
