let moneyDialog = '';
let moneyFocus = 'overview';

function moneyStore() {
  taskState.money ||= {
    version: 1,
    responsibility: { title: 'Friend Credit Responsibility', friendName: '', originalCents: 0, baselineOwedCents: 0, followUpDays: 2, createdAt: new Date().toISOString() },
    contacts: [], payments: [], adjustments: [], cardSnapshots: [],
  };
  taskState.money.contacts ||= [];
  taskState.money.payments ||= [];
  taskState.money.adjustments ||= [];
  taskState.money.cardSnapshots ||= [];
  return taskState.money;
}

function moneyCents(value) { return Math.round((Number(value) || 0) * 100); }
function moneyAmount(cents) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format((Number(cents) || 0) / 100); }
function moneyCurrentOwed() {
  const store = moneyStore();
  const paid = store.payments.reduce((sum, item) => sum + item.amountCents, 0);
  const adjustments = store.adjustments.reduce((sum, item) => sum + item.amountCents, 0);
  return Math.max(0, store.responsibility.baselineOwedCents + adjustments - paid);
}
function moneySettlement() {
  const settlement = moneyStore().settlement;
  if (!settlement || !settlement.verifiedDate) return null;
  const cardCents = Number(settlement.cardCents) || 0;
  const friendCardCents = Number(settlement.friendCardCents) || 0;
  const ownCardCents = Number(settlement.ownCardCents) || 0;
  const directCents = Number(settlement.directCents) || 0;
  const requestCents = Number(settlement.requestCents) || directCents;
  return { ...settlement, cardCents, friendCardCents, ownCardCents, directCents, requestCents,
    differenceCents: cardCents - friendCardCents - ownCardCents,
    combinedCents: friendCardCents + directCents };
}
function moneyLastVerified() {
  return moneySettlement()?.verifiedDate || '';
}
function moneyRecovered() { return moneyStore().payments.reduce((sum, item) => sum + item.amountCents, 0); }
function moneyLatestCard() { return [...moneyStore().cardSnapshots].sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0] || null; }
function moneyLatestContact() { return [...moneyStore().contacts].sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0] || null; }
function moneyActivePromise() { return [...moneyStore().contacts].filter(item => item.promisedCents > 0 && item.promiseDate).sort((a,b) => b.promiseDate.localeCompare(a.promiseDate))[0] || null; }
function moneyNextFollowUp() {
  const contact = moneyLatestContact();
  if (contact?.nextFollowUp) return contact.nextFollowUp;
  if (!contact) return toDateKey();
  return toDateKey(addDays(getDateFromKey(contact.date), moneyStore().responsibility.followUpDays || 2));
}
function moneyDayDistance(dateKey) { return Math.round((getDateFromKey(dateKey) - getDateFromKey(toDateKey())) / 86400000); }
function moneyDateLabel(dateKey) { return dateKey ? formatDateKey(dateKey) : 'Not recorded'; }
function moneyContactStatus() {
  const date = moneyNextFollowUp(), days = moneyDayDistance(date);
  if (days < 0) return { tone: 'danger', label: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`, action: 'Follow up today' };
  if (days === 0) return { tone: 'due', label: 'Due today', action: 'Contact him today' };
  if (days === 1) return { tone: 'waiting', label: 'Due tomorrow', action: 'Prepare the follow-up' };
  return { tone: 'calm', label: `Due in ${days} days`, action: 'Waiting for next follow-up' };
}
function moneyPromiseStatus(promise) {
  if (!promise) return { label: 'No promise recorded', tone: 'calm' };
  const paidAfter = moneyStore().payments.filter(item => item.date >= promise.date).reduce((sum,item) => sum + item.amountCents,0);
  if (paidAfter >= promise.promisedCents) return { label: 'Fulfilled', tone: 'success' };
  if (paidAfter > 0) return { label: 'Partially fulfilled', tone: 'waiting' };
  if (moneyDayDistance(promise.promiseDate) < 0) return { label: 'Missed', tone: 'danger' };
  return { label: 'Waiting', tone: 'waiting' };
}

function moneySave() { saveTasks(); }
function moneyIcon(name) { return typeof rhythmIcon === 'function' ? rhythmIcon(name) : ''; }

function moneyOpenDialog(type) { moneyDialog = type; renderMoneyView(); setTimeout(() => document.querySelector('#money-dialog')?.showModal(), 0); }
function moneyCloseDialog() { document.querySelector('#money-dialog')?.close(); moneyDialog = ''; renderMoneyView(); }

function moneyResolutionRing() {
  const store = moneyStore(), owed = moneyCurrentOwed(), recovered = moneyRecovered();
  const base = Math.max(1, store.responsibility.baselineOwedCents + store.adjustments.reduce((sum,item) => sum + Math.max(0,item.amountCents),0));
  const percent = Math.min(100, Math.round(recovered / base * 100));
  const interest = store.adjustments.filter(item => item.kind === 'interest').reduce((sum,item) => sum + item.amountCents,0);
  return `<div class="money-orbit" style="--recovered:${percent * 3.6}deg"><div><span>Remaining</span><strong>${moneyAmount(owed)}</strong><em>${percent}% resolved</em></div></div><div class="money-orbit-legend"><span><i class="recovered"></i>Recovered ${moneyAmount(recovered)}</span><span><i></i>Remaining ${moneyAmount(owed)}</span><span><i class="interest"></i>Interest/fees ${moneyAmount(interest)}</span></div>`;
}

function moneyBalanceChart() {
  const store = moneyStore();
  const events = [
    { date: store.responsibility.createdAt.slice(0,10), delta: store.responsibility.baselineOwedCents, type: 'baseline' },
    ...store.adjustments.map(item => ({ date:item.date, delta:item.amountCents, type:item.kind })),
    ...store.payments.map(item => ({ date:item.date, delta:-item.amountCents, type:'payment' })),
  ].sort((a,b) => a.date.localeCompare(b.date));
  if (!events.length || !store.responsibility.baselineOwedCents) return `<div class="money-chart-empty">Set the verified owed balance to begin the movement graph.</div>`;
  let balance = 0;
  const points = events.map((event,index) => { balance = Math.max(0,balance + event.delta); return { ...event, balance, x: events.length === 1 ? 50 : 6 + index * (88/(events.length-1)) }; });
  const max = Math.max(...points.map(point => point.balance),1);
  const svgPoints = points.map(point => `${point.x},${88-(point.balance/max)*70}`).join(' ');
  return `<svg class="money-balance-chart" viewBox="0 0 100 100" role="img" aria-label="Friend owed balance movement"><line x1="6" y1="88" x2="94" y2="88"></line><polyline points="${svgPoints}"></polyline>${points.map(point => `<circle cx="${point.x}" cy="${88-(point.balance/max)*70}" r="2.2" class="${point.type}"><title>${point.date}: ${moneyAmount(point.balance)} after ${point.type}</title></circle>`).join('')}</svg><div class="money-chart-axis"><span>${moneyDateLabel(points[0].date)}</span><strong>${moneyAmount(moneyCurrentOwed())} now</strong><span>${moneyDateLabel(points.at(-1).date)}</span></div>`;
}

function moneyContactRhythm() {
  const today = getDateFromKey(toDateKey()), contacts = moneyStore().contacts;
  const days = Array.from({length:30},(_,index) => toDateKey(addDays(today,index-29)));
  return `<div class="money-contact-grid">${days.map(date => { const entries=contacts.filter(item=>item.date===date); const payment=moneyStore().payments.some(item=>item.date===date); const cls=payment?'payment':entries.length?entries.some(item=>item.outcome==='no-answer')?'attempt':'contact':''; return `<i class="${cls}" title="${date}: ${payment?'payment received':entries.length?`${entries.length} contact event${entries.length===1?'':'s'}`:'no recorded event'}"></i>`; }).join('')}</div><div class="money-contact-legend"><span><i class="contact"></i>Contact</span><span><i class="attempt"></i>No answer</span><span><i class="payment"></i>Payment</span></div>`;
}

function moneyAccountability() {
  const contacts = moneyStore().contacts;
  const completed = contacts.length;
  const promises = contacts.filter(item => item.promisedCents > 0);
  const kept = promises.filter(item => moneyPromiseStatus(item).label === 'Fulfilled').length;
  const original = Math.max(moneyStore().responsibility.baselineOwedCents,1), recovered = moneyRecovered();
  return `<div class="money-dual-progress"><div><span><b>Your accountability</b><em>${completed} contacts logged</em></span><i><u style="width:${Math.min(100,completed*10)}%"></u></i><small>Follow-up evidence, independent of payment</small></div><div><span><b>Financial recovery</b><em>${Math.min(100,Math.round(recovered/original*100))}%</em></span><i><u class="finance" style="width:${Math.min(100,Math.round(recovered/original*100))}%"></u></i><small>${moneyAmount(recovered)} recovered</small></div><div><span><b>Promise outcomes</b><em>${kept}/${promises.length} fulfilled</em></span><i><u class="promise" style="width:${promises.length?Math.round(kept/promises.length*100):0}%"></u></i><small>Only recorded promises are counted</small></div></div>`;
}

function moneyTimeline() {
  const store=moneyStore();
  const rows=[
    ...store.contacts.map(item=>({id:item.id,date:item.date,type:'contact',title:`${item.method} · ${item.outcome.replace('-',' ')}`,detail:item.note||'Contact logged',effect:item.promisedCents?`Promised ${moneyAmount(item.promisedCents)} by ${moneyDateLabel(item.promiseDate)}`:'No financial promise'})),
    ...store.payments.map(item=>({id:item.id,date:item.date,type:'payment',title:`Payment received · ${moneyAmount(item.amountCents)}`,detail:item.note||'Payment recorded',effect:`Remaining ${moneyAmount(moneyCurrentOwed())}`})),
    ...store.adjustments.map(item=>({id:item.id,date:item.date,type:'adjustment',title:`${item.kind==='interest'?'Interest/fee':'Balance correction'} · ${moneyAmount(item.amountCents)}`,detail:item.note||'Verified adjustment',effect:'Added to responsibility'})),
    ...store.cardSnapshots.map(item=>({id:item.id,date:item.date,type:'card',title:'Card position updated',detail:`Statement ${moneyAmount(item.statementCents)} · Available ${moneyAmount(item.availableCents)}`,effect:item.dueDate?`Due ${moneyDateLabel(item.dueDate)}`:'No due date'})),
  ].sort((a,b)=>b.date.localeCompare(a.date));
  return rows.length?rows.map(item=>`<article class="money-timeline-row ${item.type}"><span class="money-timeline-icon">${moneyIcon(item.type==='contact'?'phone':item.type==='payment'?'circle-dollar-sign':item.type==='card'?'credit-card':'badge-dollar-sign')}</span><div><time>${moneyDateLabel(item.date)}</time><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></div><em>${escapeHtml(item.effect)}</em></article>`).join(''):`<div class="money-empty"><strong>No history yet.</strong><p>Set the verified balance, then log the first contact.</p></div>`;
}

function renderMoneyLegacyView() {
  if (!moneyView) return;
  const store=moneyStore(), owed=moneyCurrentOwed(), recovered=moneyRecovered(), card=moneyLatestCard(), contact=moneyLatestContact(), promise=moneyActivePromise(), promiseState=moneyPromiseStatus(promise), follow=moneyContactStatus();
  moneyView.innerHTML=`<header class="money-command"><div class="money-command-copy"><p class="section-kicker">KRYOS / MONEY</p><h1>${follow.action}</h1><p>${promise?`Latest promise: ${moneyAmount(promise.promisedCents)} by ${moneyDateLabel(promise.promiseDate)}`:'Keep the responsibility visible until the balance is resolved.'}</p><span class="money-status ${follow.tone}"><i></i>${follow.label} · Last contact ${contact?moneyDateLabel(contact.date):'not recorded'}</span><div class="money-primary-actions"><button data-money-open="contact">Log contact</button><button data-money-open="payment">Record payment</button><button data-money-open="card">Update card</button></div></div><div class="money-command-stat"><span>Amount owed</span><strong>${moneyAmount(owed)}</strong><em>Friend responsibility</em></div><div class="money-command-stat"><span>Recovered</span><strong>${moneyAmount(recovered)}</strong><em>Verified payments</em></div><div class="money-command-stat"><span>Available credit</span><strong>${card?moneyAmount(card.availableCents):'—'}</strong><em>${card?`Verified ${moneyDateLabel(card.date)}`:'Not recorded'}</em></div></header>
    ${!store.responsibility.baselineOwedCents?`<section class="money-setup-callout"><div><p class="section-kicker">START WITH VERIFIED FACTS</p><h2>Set the responsibility baseline.</h2><p>Enter only amounts you can verify. Card position and friend balance remain separate.</p></div><button class="primary-button" data-money-open="setup">Set baseline</button></section>`:''}
    <div class="money-dashboard"><main class="money-main"><section class="money-surface"><div class="money-head"><div><p class="section-kicker">RESOLUTION</p><h2>Responsibility movement</h2></div><button class="icon-button" data-money-open="setup" aria-label="Edit responsibility" title="Edit responsibility">${moneyIcon('edit-3')}</button></div><div class="money-resolution-grid"><div>${moneyResolutionRing()}</div><div class="money-chart-wrap"><h3>Balance movement</h3>${moneyBalanceChart()}</div></div></section>
      <section class="money-surface"><div class="money-head"><div><p class="section-kicker">CONTACT RHYTHM</p><h2>Thirty days of accountability</h2></div><span>${store.contacts.length} contacts logged</span></div>${moneyContactRhythm()}${moneyAccountability()}</section>
      <section class="money-surface"><div class="money-head"><div><p class="section-kicker">ACTIVITY TIMELINE</p><h2>Every contact, promise, and dollar.</h2></div><button class="secondary-button" data-money-open="adjustment">Add adjustment</button></div><div class="money-timeline">${moneyTimeline()}</div></section></main>
      <aside class="money-side"><section class="money-surface money-promise ${promiseState.tone}"><p class="section-kicker">CURRENT PROMISE</p>${promise?`<strong>${moneyAmount(promise.promisedCents)}</strong><h2>Due ${moneyDateLabel(promise.promiseDate)}</h2><span>${promiseState.label}</span><p>${escapeHtml(promise.note||'No additional note.')}</p>`:`<h2>No promise recorded.</h2><p>Log the next conversation and record exactly what was promised.</p>`}<button class="primary-button" data-money-open="contact">${promiseState.label==='Missed'?'Follow up now':'Log contact'}</button></section>
      <section class="money-surface"><div class="money-head"><div><p class="section-kicker">CARD POSITION</p><h2>Verified snapshot</h2></div></div>${card?`<div class="money-card-position"><div><span>Credit limit</span><strong>${moneyAmount(card.limitCents)}</strong></div><div><span>Statement balance</span><strong>${moneyAmount(card.statementCents)}</strong></div><div><span>Available credit</span><strong>${moneyAmount(card.availableCents)}</strong></div><div><span>Minimum due</span><strong>${moneyAmount(card.minimumCents)}</strong></div><div><span>Payment due</span><strong>${moneyDateLabel(card.dueDate)}</strong></div><div><span>Last verified</span><strong>${moneyDateLabel(card.date)}</strong></div><div class="money-credit-track"><i style="width:${card.limitCents?Math.min(100,card.availableCents/card.limitCents*100):0}%"></i></div></div>`:`<div class="money-empty"><p>No card snapshot recorded.</p><button class="secondary-button" data-money-open="card">Update card</button></div>`}</section>
      <section class="money-surface money-principle"><p class="section-kicker">SEPARATE THE TRUTHS</p><h2>Your action is follow-up. His action is payment.</h2><p>KRYOS measures both, but never confuses them.</p></section></aside></div>${renderMoneyDialog()}`;
  if(window.lucide)lucide.createIcons({attrs:{width:16,height:16,'stroke-width':2}});
}

function moneySplitVisual(settlement) {
  if (!settlement) return `<div class="money-no-split"><strong>Card split not entered yet</strong><p>The existing friend balance and card snapshot remain available. Add a reconciled checkpoint when the statement split is ready.</p><button class="secondary-button" type="button" data-money-open="settlement">Add reconciled split</button></div>`;
  const friendWidth = settlement.cardCents ? Math.max(0, Math.min(100, settlement.friendCardCents / settlement.cardCents * 100)) : 0;
  const ownWidth = settlement.cardCents ? Math.max(0, Math.min(100 - friendWidth, settlement.ownCardCents / settlement.cardCents * 100)) : 0;
  return `<div class="money-split-total"><span>Amex statement balance</span><strong>${moneyAmount(settlement.cardCents)}</strong><small>Verified ${moneyDateLabel(settlement.verifiedDate)}</small></div>
    <div class="money-split-track" role="img" aria-label="Friend card share ${moneyAmount(settlement.friendCardCents)}, your card share ${moneyAmount(settlement.ownCardCents)}"><i class="friend" style="width:${friendWidth}%"></i><i class="own" style="width:${ownWidth}%"></i></div>
    <div class="money-split-key"><span><i class="friend"></i>His card share <b>${moneyAmount(settlement.friendCardCents)}</b></span><span><i class="own"></i>Your card share <b>${moneyAmount(settlement.ownCardCents)}</b></span></div>
    <div class="money-reconcile ${settlement.differenceCents ? 'needs-work' : 'matched'}">${settlement.differenceCents ? `Unallocated difference ${moneyAmount(settlement.differenceCents)} · review the statement split` : 'Statement split matches to the cent'}</div>`;
}

function moneyCallFocus(settlement) {
  const contact = moneyLatestContact(), promise = moneyActivePromise(), follow = moneyContactStatus();
  const directText = settlement ? moneyAmount(settlement.directCents) : '—';
  const requestText = settlement ? moneyAmount(settlement.requestCents) : '—';
  return `<section class="money-call-focus" aria-label="Call preparation"><div class="money-focus-top"><button type="button" class="secondary-button" data-money-focus="overview">← Overview</button><span>${moneyLastVerified() ? `Financial checkpoint ${moneyDateLabel(moneyLastVerified())}` : 'Financial checkpoint not entered'}</span></div>
    <div class="money-focus-grid"><div class="money-focus-primary"><p class="section-kicker">ONE CALM CONVERSATION</p><h1>Know the number. Make the call.</h1><p class="money-focus-lead">Use the exact amount and the agreed request openly. Record the outcome after the conversation.</p>
      <div class="money-focus-amount"><span>Direct reimbursement</span><strong>${directText}</strong><small>${settlement ? `Informal request: ${requestText}` : 'Enter a reconciled split to prepare a financial brief.'}</small></div>
      <div class="money-focus-actions"><button type="button" class="primary-button" data-money-open="contact">Log call outcome</button><button type="button" class="secondary-button" data-money-open="payment">Record money received</button></div></div>
      <aside class="money-focus-brief"><p class="section-kicker">FACTUAL BRIEF</p><h2>Keep these visible</h2><ol><li><strong>What he owes you directly</strong><span>${directText}${settlement?.frontedCents ? ` from ${moneyAmount(settlement.frontedCents)} you covered` : ''}${settlement?.reimbursedCents ? `, less ${moneyAmount(settlement.reimbursedCents)} he repaid` : ''}.</span></li><li><strong>What remains on Amex</strong><span>${settlement ? `${moneyAmount(settlement.friendCardCents)} is assigned to his card share at this checkpoint.` : 'Add a reconciled card split to show this amount.'}</span></li><li><strong>What happens next</strong><span>${follow.label}. ${contact ? `Last contact ${moneyDateLabel(contact.date)}.` : 'No contact recorded yet.'}</span></li></ol>${promise ? `<div class="money-focus-promise">Recorded promise: ${moneyAmount(promise.promisedCents)} by ${moneyDateLabel(promise.promiseDate)} · ${moneyPromiseStatus(promise).label}</div>` : ''}</aside></div></section>`;
}

function renderMoneyView() {
  if (!moneyView) return;
  const settlement = moneySettlement(), card = moneyLatestCard(), follow = moneyContactStatus(), contact = moneyLatestContact(), promise = moneyActivePromise();
  if (moneyFocus === 'call') {
    moneyView.innerHTML = moneyCallFocus(settlement) + renderMoneyDialog();
  } else {
    moneyView.innerHTML = `<div class="money-premium"><header class="money-premium-heading"><div><p class="section-kicker">KRYOS / MONEY</p><h1>Know the number.<br>Make the next move.</h1><p>One clear view of responsibility, recovery, and the next conversation.</p></div><div class="money-verified">${moneyLastVerified() ? `Financial checkpoint · ${moneyDateLabel(moneyLastVerified())}` : 'Financial checkpoint not entered'}</div></header>
      <section class="money-next-action"><div><p class="section-kicker">NEXT ACTION</p><h2>${follow.action}</h2><p>${promise ? `Recorded promise: ${moneyAmount(promise.promisedCents)} by ${moneyDateLabel(promise.promiseDate)}.` : 'Review the amount, then record what happens in the conversation.'} ${contact ? `Last contact ${moneyDateLabel(contact.date)}.` : ''}</p><span class="money-status ${follow.tone}"><i></i>${follow.label}</span></div><div class="money-next-buttons"><button type="button" class="primary-button" data-money-focus="call">Open call brief</button><button type="button" class="secondary-button" data-money-open="contact">Log contact</button><button type="button" class="secondary-button" data-money-open="payment">Record payment</button></div></section>
      ${!moneyStore().responsibility.baselineOwedCents ? `<section class="money-setup-callout"><div><p class="section-kicker">EXISTING FRIEND BALANCE</p><h2>Start with the verified balance.</h2><p>This is separate from the statement split and direct reimbursement.</p></div><button class="primary-button" data-money-open="setup">Set baseline</button></section>` : ''}
      <div class="money-premium-metrics"><article class="money-metric friend"><span>His share on Amex</span><strong>${settlement ? moneyAmount(settlement.friendCardCents) : '—'}</strong><small>${settlement ? 'At the verified checkpoint' : 'Add a reconciled card split'}</small></article><article class="money-metric own"><span>Your share on Amex</span><strong>${settlement ? moneyAmount(settlement.ownCardCents) : '—'}</strong><small>${settlement ? 'At the verified checkpoint' : 'Add a reconciled card split'}</small></article><article class="money-metric direct"><span>He owes you directly</span><strong>${settlement ? moneyAmount(settlement.directCents) : '—'}</strong><small>${settlement ? `Informal request ${moneyAmount(settlement.requestCents)}` : 'Track reimbursement separately'}</small></article></div>
      ${!settlement && moneyStore().responsibility.baselineOwedCents ? `<div class="money-legacy-note">Existing tracked friend balance: <strong>${moneyAmount(moneyCurrentOwed())}</strong>. This record is preserved and is not treated as a reconciled card split.</div>` : ''}
      <div class="money-premium-columns"><main class="money-premium-main"><section class="money-surface"><div class="money-head"><div><p class="section-kicker">CARD POSITION</p><h2>Where the balance sits</h2></div><button type="button" class="secondary-button" data-money-open="settlement">${settlement ? 'Update checkpoint' : 'Add split'}</button></div>${moneySplitVisual(settlement)}${settlement ? `<div class="money-combined">His combined responsibility at this checkpoint <strong>${moneyAmount(settlement.combinedCents)}</strong><small>Card share + exact direct reimbursement</small></div>` : ''}</section>
        <section class="money-surface"><div class="money-head"><div><p class="section-kicker">MOVEMENT</p><h2>Friend balance history</h2></div><button type="button" class="secondary-button" data-money-open="setup">Edit existing balance</button></div><p class="money-section-intro">Existing tracked balance and recorded payments. The reconciled card split above is a dated checkpoint.</p>${moneyBalanceChart()}</section>
        <section class="money-surface"><div class="money-head"><div><p class="section-kicker">ACTIVITY</p><h2>Every contact and dollar</h2></div><button type="button" class="secondary-button" data-money-open="adjustment">Add adjustment</button></div><div class="money-timeline">${moneyTimeline()}</div></section></main>
        <aside class="money-premium-aside"><section class="money-surface money-sequence"><p class="section-kicker">BEFORE YOU CONTACT HIM</p><h2>Three small steps</h2><ol><li><b>Read the verified amount</b><span>See the card share and direct reimbursement.</span></li><li><b>Make the call</b><span>Use the factual brief, without searching the ledger.</span></li><li><b>Record the outcome</b><span>A contact, promise, and payment stay distinct.</span></li></ol><button type="button" class="primary-button" data-money-focus="call">Open call brief</button></section>
        <section class="money-surface"><p class="section-kicker">CARD SNAPSHOT</p><h2>Latest recorded statement</h2>${card ? `<div class="money-card-position"><div><span>Balance</span><strong>${moneyAmount(card.statementCents)}</strong></div><div><span>Minimum due</span><strong>${moneyAmount(card.minimumCents)}</strong></div><div><span>Due</span><strong>${moneyDateLabel(card.dueDate)}</strong></div><div><span>Recorded</span><strong>${moneyDateLabel(card.date)}</strong></div></div>` : '<p class="money-section-intro">No card snapshot recorded.</p>'}<button type="button" class="secondary-button" data-money-open="card">Update card</button></section>
        <section class="money-surface"><p class="section-kicker">FOLLOW-UP RECORD</p><h2>Action and recovery</h2>${moneyContactRhythm()}${moneyAccountability()}</section></aside></div></div>${renderMoneyDialog()}`;
  }
  if (window.lucide) lucide.createIcons({attrs:{width:16,height:16,'stroke-width':2}});
}

function renderMoneyDialog(){
  if(!moneyDialog)return '';
  const s=moneyStore(),card=moneyLatestCard(),settlement=moneySettlement();
  const forms={
    settlement:`<input type="hidden" name="type" value="settlement"><label>Statement date<input name="verifiedDate" type="date" value="${settlement?.verifiedDate||''}" required></label><label>Amex statement balance<input name="card" type="number" step=".01" min="0" value="${settlement?settlement.cardCents/100:''}" required></label><label>His share on Amex<input name="friendCard" type="number" step=".01" min="0" value="${settlement?settlement.friendCardCents/100:''}" required></label><label>Your share on Amex<input name="ownCard" type="number" step=".01" min="0" value="${settlement?settlement.ownCardCents/100:''}" required></label><label>He owes you directly, exact<input name="direct" type="number" step=".01" min="0" value="${settlement?settlement.directCents/100:''}" required></label><label>Informal amount to request<input name="request" type="number" step=".01" min="0" value="${settlement?settlement.requestCents/100:''}" required></label><label>Minimum payments you covered<input name="fronted" type="number" step=".01" min="0" value="${settlement?.frontedCents?settlement.frontedCents/100:''}"></label><label>Cash reimbursed to you<input name="reimbursed" type="number" step=".01" min="0" value="${settlement?.reimbursedCents?settlement.reimbursedCents/100:''}"></label><label class="wide">Evidence note<input name="evidenceNote" maxlength="300" value="${escapeHtml(settlement?.evidenceNote||'')}" placeholder="Statement or reconciliation reference"></label><p class="money-form-error wide" role="alert" hidden></p>`,
    setup:`<input type="hidden" name="type" value="setup"><label>Friend name<input name="friendName" value="${escapeHtml(s.responsibility.friendName)}"></label><label>Original amount used<input name="original" type="number" step=".01" min="0" value="${(s.responsibility.originalCents/100)||''}"></label><label>Verified amount currently owed<input name="owed" type="number" step=".01" min="0" required value="${(s.responsibility.baselineOwedCents/100)||''}"></label><label>Follow up every<input name="followUpDays" type="number" min="1" max="30" value="${s.responsibility.followUpDays||2}"><span>days</span></label>`,
    contact:`<input type="hidden" name="type" value="contact"><label>Date<input name="date" type="date" value="${toDateKey()}" required></label><label>Method<select name="method"><option>Call</option><option>Message</option><option>In person</option></select></label><label>Outcome<select name="outcome"><option value="answered">Answered</option><option value="no-answer">No answer</option><option value="message-sent">Message sent</option><option value="promised-payment">Promised payment</option><option value="avoided-commitment">Avoided commitment</option><option value="disputed-amount">Disputed amount</option></select></label><label>Promised amount<input name="promised" type="number" step=".01" min="0"></label><label>Promise date<input name="promiseDate" type="date"></label><label>Next follow-up<input name="nextFollowUp" type="date" value="${toDateKey(addDays(new Date(),s.responsibility.followUpDays||2))}"></label><label class="wide">What he said<textarea name="note" maxlength="600"></textarea></label>`,
    payment:`<input type="hidden" name="type" value="payment"><label>Date received<input name="date" type="date" value="${toDateKey()}" required></label><label>Amount received<input name="amount" type="number" step=".01" min=".01" required></label><label>Method<select name="method"><option>Bank transfer</option><option>Cash</option><option>Payment app</option><option>Other</option></select></label><label class="wide">Note<textarea name="note" maxlength="400"></textarea></label>`,
    card:`<input type="hidden" name="type" value="card"><label>Verified date<input name="date" type="date" value="${toDateKey()}" required></label><label>Credit limit<input name="limit" type="number" step=".01" min="0" value="${card?card.limitCents/100:''}"></label><label>Statement balance<input name="statement" type="number" step=".01" min="0" value="${card?card.statementCents/100:''}"></label><label>Available credit<input name="available" type="number" step=".01" min="0" value="${card?card.availableCents/100:''}"></label><label>Minimum due<input name="minimum" type="number" step=".01" min="0" value="${card?card.minimumCents/100:''}"></label><label>Payment due<input name="dueDate" type="date" value="${card?.dueDate||''}"></label>`,
    adjustment:`<input type="hidden" name="type" value="adjustment"><label>Date<input name="date" type="date" value="${toDateKey()}" required></label><label>Type<select name="kind"><option value="interest">Interest or fee</option><option value="correction">Balance correction</option></select></label><label>Amount added<input name="amount" type="number" step=".01" required></label><label class="wide">Verification note<textarea name="note" maxlength="400" required></textarea></label>`,
  };
  return `<dialog id="money-dialog" class="money-dialog"><form id="money-form"><header><div><p class="section-kicker">MONEY / ${moneyDialog.toUpperCase()}</p><h2>${moneyDialog==='settlement'?'Reconciled statement checkpoint':moneyDialog==='setup'?'Verified responsibility':moneyDialog==='contact'?'Log the conversation':moneyDialog==='payment'?'Record received money':moneyDialog==='card'?'Update card position':'Verified adjustment'}</h2></div><button type="button" data-money-close aria-label="Close">×</button></header><div class="money-form-grid">${forms[moneyDialog]}</div><footer><button type="button" class="secondary-button" data-money-close>Cancel</button><button class="primary-button">Save record</button></footer></form></dialog>`;
}

document.addEventListener('click',event=>{
  const focus=event.target.closest('[data-money-focus]');if(focus){moneyFocus=focus.dataset.moneyFocus;renderMoneyView();return;}
  const open=event.target.closest('[data-money-open]');if(open){moneyOpenDialog(open.dataset.moneyOpen);return;}
  if(event.target.closest('[data-money-close]'))moneyCloseDialog();
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='money-form')return;event.preventDefault();const f=new FormData(event.target),type=f.get('type'),s=moneyStore(),now=new Date().toISOString();
  if(type==='settlement'){
    const cardCents=moneyCents(f.get('card')),friendCardCents=moneyCents(f.get('friendCard')),ownCardCents=moneyCents(f.get('ownCard'));
    const directCents=moneyCents(f.get('direct')),frontedCents=moneyCents(f.get('fronted')),reimbursedCents=moneyCents(f.get('reimbursed'));
    const error=event.target.querySelector('.money-form-error');
    let message='';
    if(cardCents!==friendCardCents+ownCardCents)message='His share plus your share must equal the Amex statement balance exactly.';
    else if((frontedCents||reimbursedCents)&&directCents!==frontedCents-reimbursedCents)message='The direct amount must equal what you covered minus what he reimbursed.';
    if(message){error.textContent=message;error.hidden=false;return;}
    s.settlement={verifiedDate:String(f.get('verifiedDate')),cardCents,friendCardCents,ownCardCents,directCents,requestCents:moneyCents(f.get('request')),frontedCents,reimbursedCents,evidenceNote:String(f.get('evidenceNote')||'').trim(),updatedAt:now};
  }
  if(type==='setup'){s.responsibility={...s.responsibility,friendName:String(f.get('friendName')||'').trim(),originalCents:moneyCents(f.get('original')),baselineOwedCents:moneyCents(f.get('owed')),followUpDays:Number(f.get('followUpDays'))||2,updatedAt:now};}
  if(type==='contact')s.contacts.push({id:createId(),date:f.get('date'),method:f.get('method'),outcome:f.get('outcome'),promisedCents:moneyCents(f.get('promised')),promiseDate:f.get('promiseDate')||'',nextFollowUp:f.get('nextFollowUp')||'',note:String(f.get('note')||'').trim(),createdAt:now});
  if(type==='payment')s.payments.push({id:createId(),date:f.get('date'),amountCents:moneyCents(f.get('amount')),method:f.get('method'),note:String(f.get('note')||'').trim(),createdAt:now});
  if(type==='card')s.cardSnapshots.push({id:createId(),date:f.get('date'),limitCents:moneyCents(f.get('limit')),statementCents:moneyCents(f.get('statement')),availableCents:moneyCents(f.get('available')),minimumCents:moneyCents(f.get('minimum')),dueDate:f.get('dueDate')||'',createdAt:now});
  if(type==='adjustment')s.adjustments.push({id:createId(),date:f.get('date'),kind:f.get('kind'),amountCents:moneyCents(f.get('amount')),note:String(f.get('note')||'').trim(),createdAt:now});
  moneySave();moneyDialog='';renderMoneyView();
});
