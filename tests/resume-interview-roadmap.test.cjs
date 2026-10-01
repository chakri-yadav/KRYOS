const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadRoadmapApi() {
  const source = fs.readFileSync('app.js', 'utf8');
  const start = source.indexOf('const RESUME_INTERVIEW_ROADMAP_VERSION');
  const end = source.indexOf('const defaultCareer', start);
  assert.ok(start >= 0 && end > start, 'resume interview roadmap definitions are missing');
  const context = { structuredClone, Date };
  vm.createContext(context);
  vm.runInContext(
    `${source.slice(start, end)}\nthis.api = { RESUME_INTERVIEW_ROADMAP_VERSION, RESUME_INTERVIEW_MODULES, buildResumeInterviewRoadmapModules, migrateResumeInterviewRoadmap };`,
    context,
  );
  return context.api;
}

test('roadmap implements the five-layer resume interview mastery curriculum', () => {
  const { RESUME_INTERVIEW_ROADMAP_VERSION, RESUME_INTERVIEW_MODULES, buildResumeInterviewRoadmapModules } = loadRoadmapApi();
  const modules = buildResumeInterviewRoadmapModules();
  const checks = modules.flatMap(module => module.topics.flatMap(topic => topic.checklist));
  const content = JSON.stringify(RESUME_INTERVIEW_MODULES);
  assert.equal(RESUME_INTERVIEW_ROADMAP_VERSION, 3);
  assert.equal(modules.length, 20);
  assert.equal(new Set(modules.map(module => module.pattern)).size, 5);
  assert.match(modules[0].pattern, /Layer 1/);
  assert.match(modules[2].pattern, /Layer 2/);
  assert.match(modules[13].pattern, /Layer 3/);
  assert.match(modules[14].pattern, /Layer 4/);
  assert.match(modules[19].pattern, /Layer 5/);
  assert.ok(checks.every(check => check.done === false));
  assert.ok(checks.length >= 150);
  assert.equal(new Set(checks.map(check => check.id)).size, checks.length);
  assert.match(content, /private resume/i);
  for (const expected of ['Must Speak', 'Must Understand', 'Awareness Only', 'Do Not Study', '12-field bullet card', '10-second', '30-second', '90-second', 'five highest-probability', 'Role A bullet 1', 'Role B bullet 5', 'Pass 5:', 'interrupted', 'BOLA', 'p95', 'Docker']) {
    assert.match(content, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `missing ${expected}`);
  }
  assert.doesNotMatch(content, /Amazon|Leadership Principles|on-call rotation|production RCA/i);
  const card = modules[13].topics[0].checklist;
  assert.equal(card.length, 12);
  assert.match(card[0].text, /exact resume claim/i);
  assert.match(card[11].text, /five highest-probability/i);
});

test('migration upgrades in place while preserving all other Career records', () => {
  const { migrateResumeInterviewRoadmap } = loadRoadmapApi();
  const state = {
    roadmaps: [
      { id: 'existing-roadmap', title: 'System Design Roadmap', modules: [{ id: 'keep' }] },
      { id: 'roadmap-resume-interview-speaking', title: 'Resume Interview Speaking Roadmap', modules: [] },
    ],
    activityLog: [{ id: 'prior-activity' }],
    meta: {},
  };
  assert.equal(migrateResumeInterviewRoadmap(state), true);
  assert.equal(state.roadmaps.length, 2);
  assert.equal(state.roadmaps[0].modules[0].id, 'keep');
  assert.equal(state.roadmaps[1].id, 'roadmap-resume-interview-speaking');
  assert.equal(state.roadmaps[1].title, 'Resume Interview Mastery System');
  assert.equal(state.roadmaps[1].modules.length, 20);
  assert.equal(state.activityLog[0].id, 'prior-activity');
  assert.equal(migrateResumeInterviewRoadmap(state), false);
  assert.equal(state.roadmaps.length, 2);
});

test('migration preserves completed interview checklist evidence on reconciliation', () => {
  const { migrateResumeInterviewRoadmap } = loadRoadmapApi();
  const state = { roadmaps: [{ id: 'roadmap-resume-interview-speaking', title: 'Resume Interview Speaking Roadmap', modules: [] }], meta: {} };
  assert.equal(migrateResumeInterviewRoadmap(state), true);
  state.roadmaps[0].modules[0].topics[0].checklist[0].done = true;
  delete state.meta.resumeInterviewRoadmapVersion;
  assert.equal(migrateResumeInterviewRoadmap(state), true);
  assert.equal(state.roadmaps[0].modules[0].topics[0].checklist[0].done, true);
});

test('migration retains checklist completion by exact text and does not guess from similar wording', () => {
  const { migrateResumeInterviewRoadmap } = loadRoadmapApi();
  const state = {
    roadmaps: [{ id: 'roadmap-resume-interview-speaking', title: 'Resume Interview Speaking Roadmap', modules: [{ topics: [{ checklist: [
      { text: 'Record the exact claim from the private resume', done: true },
      { text: 'State a similar claim from memory', done: true },
    ] }] }] }],
    meta: {},
  };
  migrateResumeInterviewRoadmap(state);
  const checks = state.roadmaps[0].modules.flatMap(module => module.topics.flatMap(topic => topic.checklist));
  assert.equal(checks.find(check => check.text === 'Record the exact claim from the private resume').done, true);
  assert.equal(checks.every(check => check.text !== 'State a similar claim from memory'), true);
});
