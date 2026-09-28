/* A private allocation ledger. Issuer statements remain authoritative; forecasts never post transactions. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KryosMoneyEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const cents = value => Number.isInteger(value) ? value : 0;
  const day = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : '';
  const roundShare = (total, numerator, denominator) => denominator > 0 ? Math.round(total * numerator / denominator) : 0;
  function position(settlement, events = []) {
    const state = { friendCardCents: cents(settlement?.friendCardCents), ownCardCents: cents(settlement?.ownCardCents), directCents: cents(settlement?.directCents), unresolvedCents: 0, postedInterestCents: 0, history: [] };
    const ordered = [...events].filter(e => !e.voidedAt && day(e.date) && Number.isInteger(e.amountCents) && e.amountCents > 0).sort((a,b) => a.date.localeCompare(b.date) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || String(a.id || '').localeCompare(String(b.id || '')));
    for (const event of ordered) {
      const amount = event.amountCents, owner = event.owner;
      if (event.type === 'card-payment') {
        const key = owner === 'friend' ? 'friendCardCents' : owner === 'own' ? 'ownCardCents' : null;
        if (!key || (event.funder !== 'friend' && event.funder !== 'own') || amount > state[key]) continue;
        state[key] -= amount;
        if (owner === 'friend' && event.funder === 'own') state.directCents += amount;
      } else if (event.type === 'direct-reimbursement') {
        if (amount > state.directCents) continue;
        state.directCents -= amount;
      } else if (event.type === 'statement-interest') {
        if (!Number.isInteger(event.friendCents) || !Number.isInteger(event.ownCents) || !Number.isInteger(event.unresolvedCents) || event.friendCents < 0 || event.ownCents < 0 || event.unresolvedCents < 0 || event.friendCents + event.ownCents + event.unresolvedCents !== amount) continue;
        state.friendCardCents += event.friendCents;
        state.ownCardCents += event.ownCents;
        state.unresolvedCents += event.unresolvedCents;
        state.postedInterestCents += amount;
      } else if (event.type === 'fee') {
        const key = owner === 'friend' ? 'friendCardCents' : owner === 'own' ? 'ownCardCents' : 'unresolvedCents';
        state[key] += amount;
      } else continue;
      state.history.push(event);
    }
    state.cardCents = state.friendCardCents + state.ownCardCents + state.unresolvedCents;
    return state;
  }
  function suggestInterest(amountCents, friendDailyCents, ownDailyCents) {
    const total = cents(friendDailyCents) + cents(ownDailyCents);
    if (amountCents <= 0 || total <= 0) return { friendCents: 0, ownCents: 0, unresolvedCents: amountCents };
    const friendCents = roundShare(amountCents, friendDailyCents, total);
    return { friendCents, ownCents: amountCents - friendCents, unresolvedCents: 0 };
  }
  function cycleWeights(settlement, events, startDate, closeDate) {
    if (!day(startDate) || !day(closeDate)) return null;
    const start = Date.parse(startDate + 'T00:00:00Z'), close = Date.parse(closeDate + 'T00:00:00Z');
    const days = Math.round((close - start) / 86400000) + 1;
    if (days < 1 || days > 45) return null;
    let friendDailyCents = 0, ownDailyCents = 0;
    for (let offset = 0; offset < days; offset++) {
      const date = new Date(start + offset * 86400000).toISOString().slice(0,10);
      const posted = position(settlement, events.filter(event => event.date <= date && !(event.type === 'statement-interest' && event.date === closeDate)));
      friendDailyCents += posted.friendCardCents;
      ownDailyCents += posted.ownCardCents;
    }
    return { days, friendDailyCents, ownDailyCents };
  }
  function forecast(positionValue, aprBasisPoints, fromDate, toDate) {
    if (!day(fromDate) || !day(toDate) || !Number.isInteger(aprBasisPoints) || aprBasisPoints < 0 || aprBasisPoints > 10000) return null;
    const days = Math.round((Date.parse(toDate + 'T00:00:00Z') - Date.parse(fromDate + 'T00:00:00Z')) / 86400000);
    if (days < 0 || days > 366) return null;
    const rate = aprBasisPoints / 10000 / 365;
    const estimate = balance => Math.round(balance * (Math.pow(1 + rate, days) - 1));
    const friendCents = estimate(positionValue.friendCardCents), ownCents = estimate(positionValue.ownCardCents);
    return { days, friendCents, ownCents, totalCents: friendCents + ownCents, estimated: true };
  }
  return { position, suggestInterest, cycleWeights, forecast };
});
