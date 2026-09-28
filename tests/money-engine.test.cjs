const assert = require('node:assert/strict');
const { test } = require('node:test');
const { position, suggestInterest, cycleWeights, forecast } = require('../money-engine.js');

const opening = { friendCardCents: 70000, ownCardCents: 30000, directCents: 10000 };

test('opening checkpoint is not replayed as another charge', () => {
  const state = position(opening, []);
  assert.equal(state.cardCents, 100000);
  assert.equal(state.directCents, 10000);
  assert.equal(state.postedInterestCents, 0);
});

test('owner-funded friend card payment transfers responsibility to direct reimbursement', () => {
  const state = position(opening, [{ id: '1', date: '2026-10-01', type: 'card-payment', owner: 'friend', funder: 'own', amountCents: 10000 }]);
  assert.equal(state.friendCardCents, 60000);
  assert.equal(state.directCents, 20000);
  assert.equal(state.friendCardCents + state.directCents, 80000);
});

test('friend payment and direct cash each reduce only their own bucket', () => {
  const state = position(opening, [
    { id: '1', date: '2026-10-01', type: 'card-payment', owner: 'friend', funder: 'friend', amountCents: 10000 },
    { id: '2', date: '2026-10-02', type: 'direct-reimbursement', amountCents: 5000 },
  ]);
  assert.equal(state.friendCardCents, 60000);
  assert.equal(state.directCents, 5000);
});

test('corrected events remain auditable but do not change balances', () => {
  const state = position(opening, [{ id: '1', date: '2026-10-01', type: 'card-payment', owner: 'friend', funder: 'friend', amountCents: 10000, voidedAt: '2026-10-02T00:00:00Z' }]);
  assert.equal(state.friendCardCents, 70000);
  assert.equal(state.history.length, 0);
});

test('statement interest is allocated exactly once and sums to issuer charge', () => {
  const split = suggestInterest(1234, 300000, 100000);
  assert.deepEqual(split, { friendCents: 926, ownCents: 308, unresolvedCents: 0 });
  const state = position(opening, [{ id: '1', date: '2026-10-24', type: 'statement-interest', amountCents: 1234, ...split }]);
  assert.equal(state.cardCents, 101234);
  assert.equal(state.postedInterestCents, 1234);
});

test('daily weights respond to a mid-cycle payment', () => {
  const weights = cycleWeights({ friendCardCents: 10000, ownCardCents: 10000 }, [{ id: '1', date: '2026-10-02', type: 'card-payment', owner: 'friend', funder: 'friend', amountCents: 5000 }], '2026-10-01', '2026-10-03');
  assert.deepEqual(weights, { days: 3, friendDailyCents: 20000, ownDailyCents: 30000 });
});

test('forecast is provisional and requires a valid dated APR', () => {
  assert.equal(forecast(position(opening, []), 2400, '', '2026-10-02'), null);
  const projection = forecast(position(opening, []), 2400, '2026-09-27', '2026-10-02');
  assert.equal(projection.days, 5);
  assert.equal(projection.estimated, true);
  assert.ok(projection.friendCents > projection.ownCents);
});
