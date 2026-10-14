/* Cloud presentation reads only dated aggregate receipts in the task block. */
function marketingSummaryRows(rows) {
  const byDate = new Map();
  for (const row of rows || []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date || '') || !Number.isInteger(row.submittedCount) || row.submittedCount < 0) continue;
    const old = byDate.get(row.date);
    if (!old || Number(row.revision) > Number(old.revision)) byDate.set(row.date, row);
  }
  return [...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
let marketingSummaryPeriod = 'week';
function marketingSummaryModel(rows, today, period) {
  const valid = marketingSummaryRows(rows), end = new Date(today+'T12:00:00Z');
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (period === 'month' ? 29 : period === 'all' ? 0 : 6));
  const from = period === 'all' ? valid[0]?.date || today : start.toISOString().slice(0,10);
  const selected = valid.filter(r=>r.date>=from&&r.date<=today);
  return {rows:valid,selected,from,total:selected.reduce((s,r)=>s+r.submittedCount,0),today:valid.find(r=>r.date===today),latest:valid.at(-1)};
}
renderMarketingView = function() {
  const target = document.getElementById('marketing-view');
  if (!target) return;
  const today = toDateKey(), m = marketingSummaryModel(lifeStore().marketingSummaries || [], today, marketingSummaryPeriod);
  const max = Math.max(1,...m.selected.map(r=>r.submittedCount));
  const latest = m.latest;
  target.innerHTML = `<div class="marketing-cloud"><header class="marketing-cloud-header"><div><p class="marketing-cloud-kicker">MARKETING · PROGRESS</p><h1>Your applications, in view.</h1><p>Completed work from your laptop, carried into KRYOS.</p></div><button type="button" class="secondary-button" data-page="launch">Return to Launch</button></header>
    <div class="marketing-cloud-receipt"><span class="marketing-cloud-dot"></span><div><strong>${latest ? 'Latest handoff: '+marketingEscape(latest.date) : 'Awaiting your first handoff'}</strong><p>${latest ? 'Source revision '+marketingEscape(latest.revision)+' · displayed from the saved cloud summary' : 'Ask your assistant to import local Marketing statistics.'}</p></div><span>Counts only</span></div>
    <section class="marketing-cloud-metrics" aria-label="Application progress"><article><small>TODAY · ${today}</small><strong>${m.today ? m.today.submittedCount : '—'}</strong><p>${m.today ? 'Submitted applications recorded' : 'No handoff recorded for this day'}</p></article><article><small>SELECTED PERIOD</small><strong>${m.total}</strong><p>Submitted applications · ${m.from} to ${today}</p></article><article><small>RECORDED DAYS</small><strong>${m.selected.length}</strong><p>Days with a saved snapshot</p></article></section>
    <section class="marketing-cloud-chart"><header><div><p class="marketing-cloud-kicker">EVIDENCE OF ACTION</p><h2>Application rhythm</h2><p>Missing snapshots remain unknown. A recorded zero is shown as zero.</p></div><div class="marketing-cloud-period" aria-label="Chart period">${[['week','7 days'],['month','30 days'],['all','All history']].map(([key,label])=>`<button type="button" data-marketing-summary-period="${key}" aria-pressed="${marketingSummaryPeriod===key}">${label}</button>`).join('')}</div></header>
    <div class="marketing-cloud-bars">${m.selected.map(r=>`<article><strong>${r.submittedCount}</strong><div class="marketing-cloud-bar-track"><span style="height:${Math.max(2,r.submittedCount/max*100)}%"></span></div><time datetime="${r.date}">${r.date.slice(5)}</time></article>`).join('') || '<p class="marketing-cloud-empty">Your next handoff will make this progress visible.</p>'}</div></section>
    <section class="marketing-cloud-next"><div><p class="marketing-cloud-kicker">CONTINUE WITH CLARITY</p><h2>Turn completed work into your next step.</h2><p>Application counts also feed the existing reward assessment. Job details and documents stay in your laptop workspace.</p></div><div><button class="primary-button" type="button" data-page="rewards">See reward evidence</button><button class="secondary-button" type="button" data-page="progress">Overall progress</button></div></section>
    <details class="marketing-cloud-history"><summary>Saved handoff history · ${m.rows.length} dates</summary>${m.rows.slice().reverse().map(r=>`<p><time>${marketingEscape(r.date)}</time><strong>${r.submittedCount} submitted</strong><span>Source revision ${marketingEscape(r.revision)}</span></p>`).join('')||'<p>No handoff has been saved.</p>'}</details></div>`;
};
document.addEventListener('click', event=>{
  const button=event.target.closest('[data-marketing-summary-period]');
  if (!button) return;
  marketingSummaryPeriod=button.dataset.marketingSummaryPeriod;
  renderMarketingView();
});
