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

test('roadmap focuses on spoken resume defense, evidence, follow-ups, and mock delivery', () => {
  const { RESUME_INTERVIEW_MODULES, buildResumeInterviewRoadmapModules } = loadRoadmapApi();
  const modules = buildResumeInterviewRoadmapModules();
  const checks = modules.flatMap(module => module.topics.flatMap(topic => topic.checklist));
  const content = JSON.stringify(RESUME_INTERVIEW_MODULES);
  assert.equal(modules.length, 5);
  assert.match(modules[0].title, /truth and ownership/i);
  assert.match(modules[1].title, /spoken story/i);
  assert.match(modules[2].title, /technical work/i);
  assert.match(modules[3].title, /follow-ups/i);
  assert.match(modules[4].title, /speaking practice/i);
  assert.ok(checks.every(check => check.done === false));
  assert.ok(checks.length >= 55);
  assert.equal(new Set(checks.map(check => check.id)).size, checks.length);
  assert.match(content, /private resume\/audit/i);
  assert.match(content, /assumptions/);
  assert.match(content, /30-second/);
  assert.doesNotMatch(content, /Amazon|Leadership Principles|on-call rotation|production RCA/i);
});

test('migration appends one roadmap while preserving all existing Career records', () => {
  const { migrateResumeInterviewRoadmap } = loadRoadmapApi();
  const state = {
    roadmaps: [{ id: 'existing-roadmap', title: 'System Design Roadmap', modules: [{ id: 'keep' }] }],
    activityLog: [{ id: 'prior-activity' }],
    meta: {},
  };
  assert.equal(migrateResumeInterviewRoadmap(state), true);
  assert.equal(state.roadmaps.length, 2);
  assert.equal(state.roadmaps[0].modules[0].id, 'keep');
  assert.equal(state.roadmaps[1].id, 'roadmap-resume-interview-speaking');
  assert.equal(state.roadmaps[1].modules.length, 5);
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

