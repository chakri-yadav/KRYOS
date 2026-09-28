import assert from 'node:assert/strict';
import test from 'node:test';
import { projectRequest } from '../supabase/functions/kryos-ingest/projector.mjs';

const makeRequest = (operations, raw_text = 'I drank four litres of water and read Bhagavad Gita.') => ({
  schema_version: 1, idempotency_key: 'chat-message-123', local_date: '2026-09-26',
  timezone: 'America/Chicago', raw_text, operations,
});
const baseTasks = { meta: { updatedAt: '2026-09-25T00:00:00Z' }, life: { entries: [], records: [], actions: [] }, rhythm: { events: [], settings: {} } };
const baseCareer = { meta: { updatedAt: '2026-09-25T00:00:00Z' }, roadmaps: [], activityLog: [] };

test('one statement projects water, Gita, and a journal without mutating source blocks', () => {
  const request = makeRequest([
    { type: 'rhythm.measure', habit_key: 'water', value: 4, unit: 'L', evidence_quote: 'I drank four litres of water' },
    { type: 'rhythm.complete', habit_key: 'gita', evidence_quote: 'read Bhagavad Gita' },
    { type: 'journal.capture', text: 'I drank four litres of water and read Bhagavad Gita.', evidence_quote: 'I drank four litres of water and read Bhagavad Gita.' },
  ]);
  const result = projectRequest(request, baseTasks, baseCareer, '2026-09-26T21:00:00Z');
  assert.equal(result.tasks.rhythm.events.find(e => e.habitId === 'water').value, 4);
  assert.equal(result.tasks.rhythm.events.find(e => e.habitId === 'gita').value, 1);
  assert.equal(result.tasks.life.entries.length, 1);
  assert.equal(result.events.length, 3);
  assert.equal(baseTasks.life.entries.length, 0);
});

test('a missing action rejects the whole request and leaves inputs untouched', () => {
  const request = makeRequest([
    { type: 'rhythm.measure', habit_key: 'water', value: 4, unit: 'L', evidence_quote: 'I drank four litres of water' },
    { type: 'action.complete', action_id: 'absent', evidence_quote: 'read Bhagavad Gita' },
  ]);
  assert.throws(() => projectRequest(request, baseTasks, baseCareer), /Action ID/);
  assert.equal(baseTasks.rhythm.events.length, 0);
});

test('intention without a direct evidence excerpt is rejected', () => {
  const request = makeRequest([{ type: 'rhythm.complete', habit_key: 'gita', evidence_quote: 'read Bhagavad Gita' }], 'I should read Bhagavad Gita.');
  assert.throws(() => projectRequest(request, baseTasks, baseCareer), /intention or negation/);
});

test('career checklist completion uses a stable exact check ID', () => {
  const career = { roadmaps: [{ id: 'r', title: 'Career', modules: [{ id: 'm', title: 'DSA', topics: [{ id: 't', title: 'Arrays', checklist: [{ id: 'c', text: 'Problem 1', done: false }] }] }] }], activityLog: [] };
  const request = makeRequest([{ type: 'career.check.complete', check_id: 'c', evidence_quote: 'I finished problem 1' }], 'I finished problem 1.');
  const result = projectRequest(request, baseTasks, career);
  assert.equal(result.career.roadmaps[0].modules[0].topics[0].checklist[0].done, true);
  assert.equal(result.career.activityLog[0].checkId, 'c');
  assert.equal(career.roadmaps[0].modules[0].topics[0].checklist[0].done, false);
});

test('career checklist correction reopens only the exact completed item', () => {
  const career = { ...baseCareer, roadmaps: [{ id: 'roadmap', title: 'Career', modules: [{ id: 'module', title: 'Backend', topics: [{ id: 'topic', title: 'APIs', checklist: [{ id: 'exact-check', text: 'Explain idempotency', done: false }, { id: 'other-check', text: 'Explain caching', done: true }] }] }] }] };
  const completed = projectRequest(makeRequest([{ type: 'career.check.complete', check_id: 'exact-check', evidence_quote: 'read Bhagavad Gita' }]), baseTasks, career, '2026-09-26T20:00:00Z');
  const correction = { ...makeRequest([{ type: 'career.check.reopen', check_id: 'exact-check', evidence_quote: 'read Bhagavad Gita' }]), idempotency_key: 'chat-message-correction' };
  const reopened = projectRequest(correction, completed.tasks, completed.career, '2026-09-26T21:00:00Z');
  const checks = reopened.career.roadmaps[0].modules[0].topics[0].checklist;
  assert.equal(checks.find(item => item.id === 'exact-check').done, false);
  assert.equal(checks.find(item => item.id === 'other-check').done, true);
  assert.equal(reopened.career.activityLog.some(item => item.checkId === 'exact-check'), false);
});

test('water is set to a reported total rather than summed on a retry', () => {
  const request = makeRequest([{ type: 'rhythm.measure', habit_key: 'water', value: 3, unit: 'L', evidence_quote: 'three litres' }], 'I drank three litres.');
  const first = projectRequest(request, baseTasks, baseCareer);
  const second = projectRequest(request, first.tasks, baseCareer);
  assert.equal(second.tasks.rhythm.events.length, 1);
  assert.equal(second.tasks.rhythm.events[0].value, 3);
});

test('statement import stores structured facts once by private document fingerprint', () => {
  const raw = 'Statement cycle ending January 31 was reviewed.';
  const operation = { type: 'money.statement.import', cycle_start: '2026-01-01', cycle_close: '2026-01-31', payment_due_date: '2026-02-20', closing_balance_cents: 300000, minimum_due_cents: 10000, purchase_interest_cents: 50, promo_interest_cents: 7000, purchase_apr_basis_points: 2849, promo_apr_basis_points: 2849, balance_subject_to_interest_cents: 305000, source_statement_hash: 'a'.repeat(64), evidence_quote: raw };
  const first = projectRequest(makeRequest([operation], raw), baseTasks, baseCareer);
  const second = projectRequest({ ...makeRequest([operation], raw), idempotency_key: 'different-request' }, first.tasks, baseCareer);
  assert.equal(second.tasks.money.statementCycles.length, 1);
  assert.equal(second.tasks.money.statementCycles[0].promoInterestCents, 7000);
  assert.equal(second.effects[0].area, 'Money');
});
