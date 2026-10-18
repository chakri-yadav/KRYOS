/* Hosted Marketing reads only aggregate receipts. Job records stay on the laptop. */
function marketingSummaryDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date;}
function marketingSummaryShift(date,n){return new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);}
function marketingSummaryRows(rows) {
 const byDate=new Map();
 for(const row of Array.isArray(rows)?rows:[]){
  if(!row||!marketingSummaryDate(row.date)||!Number.isSafeInteger(row.submittedCount)||row.submittedCount<0||!Number.isSafeInteger(row.revision)||row.revision<0||(row.workspaceId&&row.workspaceId!=='marketing-onedrive'))continue;
  const old=byDate.get(row.date);
  if(!old||row.revision>old.revision)byDate.set(row.date,row);
 }
 return [...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
let marketingSummaryPeriod='week',marketingSummaryRange=null,marketingSummaryNotice='';
function marketingSummaryModel(rows,today,period='week'){
 if(!marketingSummaryDate(today))throw Error('A valid operating date is required.');
 const valid=marketingSummaryRows(rows).filter(r=>r.date<=today);
 const custom=period&&typeof period==='object';
 const from=custom?period.from:period==='today'?today:period==='all'?(valid[0]?.date||today):marketingSummaryShift(today,period==='month'?-29:-6),to=custom?period.to:today;
 if(!marketingSummaryDate(from)||!marketingSummaryDate(to)||from>to||to>today||(custom&&(Date.parse(to)-Date.parse(from))/86400000>365))throw Error('Choose dates through today, up to one year at a time.');
 const span=Math.round((Date.parse(to)-Date.parse(from))/86400000)+1,selected=valid.filter(r=>r.date>=from&&r.date<=to),total=selected.reduce((sum,r)=>sum+r.submittedCount,0);
 const step=span>31?Math.ceil(span/31):1,chart=[];
 for(let offset=0;offset<span;offset+=step){
  const date=marketingSummaryShift(from,offset),end=marketingSummaryShift(from,Math.min(span-1,offset+step-1)),known=selected.filter(r=>r.date>=date&&r.date<=end);
  chart.push({date,to:end,days:Math.min(step,span-offset),knownDays:known.length,count:known.length?known.reduce((sum,r)=>sum+r.submittedCount,0):null});
 }
 const best=selected.reduce((best,row)=>!best||row.submittedCount>best.submittedCount?row:best,null);
 const previousFrom=marketingSummaryShift(from,-span),previousTo=marketingSummaryShift(from,-1),previous=valid.filter(r=>r.date>=previousFrom&&r.date<=previousTo);
 return {rows:valid,selected,from,to,span,chart,total,average:selected.length?total/selected.length:null,best,today:valid.find(r=>r.date===today),latest:valid.at(-1),previous:{from:previousFrom,to:previousTo,total:previous.reduce((sum,r)=>sum+r.submittedCount,0),recordedDays:previous.length}};
}
function marketingSummaryTimestamp(value){const d=new Date(value);return value&&!Number.isNaN(d.getTime())?d.toLocaleString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}):'time not recorded';}
renderMarketingView=function(){
 const target=document.getElementById('marketing-view');if(!target)return '';
 const today=toDateKey(),m=marketingSummaryModel(lifeStore().marketingSummaries||[],today,marketingSummaryRange||marketingSummaryPeriod),esc=marketingEscape,max=Math.max(1,...m.chart.map(d=>d.count||0)),latest=m.latest;
 return `<div class="marketing-cloud"><header class="marketing-cloud-header"><div><p class="marketing-cloud-kicker">MARKETING · LAPTOP EFFORT, SHARED PROGRESS</p><h1>Your work. A clearer picture.</h1><p>One focused overview. Job records and documents stay on your laptop.</p></div><button type="button" class="secondary-button" data-page="launch">Return to Launch</button></header>
 <section class="marketing-cloud-receipt" aria-label="Summary handoff freshness"><span class="marketing-cloud-dot ${latest?'':'is-unknown'}"></span><div><strong>${latest?'Latest saved date: '+esc(latest.date):'No handoff recorded yet'}</strong><p>${latest?'Received '+esc(marketingSummaryTimestamp(latest.receivedAt))+' · laptop source revision '+esc(latest.revision):'Ask for a local Marketing statistics handoff when ready.'}</p><small>The workspace save badge shows cloud connection and confirmation. This panel describes the saved snapshot, not a live laptop connection.</small></div><span>Counts only</span></section>
 <section class="marketing-cloud-chart"><header><div><p class="marketing-cloud-kicker">CHOOSE YOUR VIEW</p><h2>Application progress</h2><p>By application date · independent of the personal-page viewing date.</p></div><div class="marketing-cloud-period" aria-label="Analytics period">${[['today','Today'],['week','7 days'],['month','30 days'],['all','All history']].map(([key,label])=>`<button type="button" data-marketing-summary-period="${key}" aria-pressed="${!marketingSummaryRange&&marketingSummaryPeriod===key}">${label}</button>`).join('')}</div></header>
 <form data-marketing-summary-range class="marketing-cloud-range"><label>From<input type="date" name="from" value="${m.from}" max="${today}" required></label><label>Through<input type="date" name="to" value="${m.to}" max="${today}" required></label><button type="submit" class="secondary-button">Show dates</button></form><p role="status">${esc(marketingSummaryNotice)}</p>
 <div class="marketing-cloud-metrics" aria-label="Selected-period analytics"><article><small>APPLIED · SELECTED PERIOD</small><strong>${m.selected.length?m.total:'—'}</strong><p>${m.from} – ${m.to}</p></article><article><small>AVERAGE · RECORDED DAYS</small><strong>${m.average===null?'—':m.average.toFixed(1)}</strong><p>Unknown dates are not treated as zero.</p></article><article><small>SNAPSHOT COVERAGE</small><strong>${m.selected.length}<em> / ${m.span}</em></strong><p>Dates with a saved handoff · includes recorded zeroes</p></article></div>
 <div class="marketing-cloud-bars" role="group" aria-label="Applications by date">${m.chart.map(d=>`<button type="button" class="marketing-cloud-day ${d.knownDays?'':'is-unknown'}" data-marketing-summary-from="${d.date}" data-marketing-summary-to="${d.to}" aria-label="${d.date}${d.to!==d.date?' through '+d.to:''}: ${d.count===null?'no snapshot':d.count+' submitted; '+d.knownDays+' of '+d.days+' dates recorded'}"><strong>${d.count===null?'—':d.count}</strong><span class="marketing-cloud-bar-track"><span style="height:${(d.count||0)/max*100}%"></span></span><time datetime="${d.date}">${d.date.slice(5)}${d.to!==d.date?'–'+d.to.slice(5):''}</time></button>`).join('')}</div>
 <p class="marketing-cloud-legend">— No snapshot · 0 Confirmed zero · Select a bar to focus its dates. Long periods are grouped; grouped totals include only recorded dates.</p>
 <div class="marketing-cloud-insights"><div><small>BEST RECORDED DAY IN VIEW</small><strong>${m.best?m.best.submittedCount+' applications':'—'}</strong><span>${m.best?esc(m.best.date):'No snapshot in this period'}</span></div><div><small>TODAY · ${today}</small><strong>${m.today?m.today.submittedCount+' recorded':'Not handed off'}</strong><span>${m.today?'Saved application count, not a live count':'Request a handoff after your local work'}</span></div><div><small>PREVIOUS EQUAL-LENGTH PERIOD</small><strong>${m.previous.recordedDays?m.previous.total+' recorded':'No snapshots'}</strong><span>${m.previous.recordedDays} of ${m.span} dates have snapshots; not a complete performance comparison.</span></div></div></section>
 <section class="marketing-cloud-next"><div><p class="marketing-cloud-kicker">CONNECTED, NOT DUPLICATED</p><h2>One effort record. Connected progress.</h2><p>These dated counts feed progress and reward evidence. Overlapping Launch and Marketing counts use the larger count, not their sum. Interviews, follow-ups, resumes and job details remain in the laptop workspace.</p></div><div><button type="button" class="primary-button" data-page="rewards">Reward evidence</button><button type="button" class="secondary-button" data-page="progress">Overall progress</button></div></section>
 <details class="marketing-cloud-history"><summary>Saved handoffs · ${m.rows.length} dates</summary>${m.rows.slice().reverse().map(r=>`<article><button type="button" data-marketing-summary-from="${r.date}" data-marketing-summary-to="${r.date}"><time>${esc(r.date)}</time><strong>${r.submittedCount} submitted</strong></button><span>Source revision ${esc(r.revision)} · ${esc(marketingSummaryTimestamp(r.receivedAt))}</span></article>`).join('')||'<p>No handoff has been saved.</p>'}</details></div>`;
};
function marketingSummaryRefresh(){const target=document.getElementById('marketing-view');if(target)target.innerHTML=renderMarketingView();}
document.addEventListener('click',event=>{
 const preset=event.target.closest('[data-marketing-summary-period]'),day=event.target.closest('[data-marketing-summary-from]');
 if(preset){marketingSummaryPeriod=preset.dataset.marketingSummaryPeriod;marketingSummaryRange=null;marketingSummaryNotice='';marketingSummaryRefresh();}
 if(day){marketingSummaryRange={from:day.dataset.marketingSummaryFrom,to:day.dataset.marketingSummaryTo};marketingSummaryNotice='Showing the selected application dates.';marketingSummaryRefresh();}
});
document.addEventListener('submit',event=>{
 const form=event.target.closest('[data-marketing-summary-range]');if(!form)return;event.preventDefault();
 const range={from:form.elements.from.value,to:form.elements.to.value};
 try{marketingSummaryModel(lifeStore().marketingSummaries||[],toDateKey(),range);marketingSummaryRange=range;marketingSummaryNotice='Date range updated.';marketingSummaryRefresh();}
 catch(error){marketingSummaryNotice=error.message;const status=document.querySelector('.marketing-cloud [role="status"]');if(status)status.textContent=marketingSummaryNotice;}
});
