/* Read-only Progress presentation. Existing records and metric functions remain the owners. */
if(typeof KryosUI!=='undefined')KryosUI.claim('progress.view','progress-flow-ui.js',["progress-flow-ui.css"]);
function progressFlowSummaryMarkup(momentum,streak){
 return '<section class="progress-flow-summary" aria-label="Recorded effort over the last seven days"><div><p class="section-kicker">LAST SEVEN DAYS</p><h2>'+momentum.actions+' completed records</h2><p>'+momentum.activeDays+' of 7 days with recorded activity. A quiet date means no completed record here—not proof that you did nothing.</p></div><div class="progress-flow-days"><strong>'+momentum.activeDays+'<small> / 7 days</small></strong><progress max="7" value="'+momentum.activeDays+'" aria-label="Days with recorded activity"></progress><span>Journal rhythm: '+streak.current+' consecutive days · best '+streak.best+'</span></div></section>';
}
const progressFlowOriginalRenderer=renderLifeProgress;
function progressFlowWeekOffset(date){return (new Date(date+'T12:00:00').getDay()+6)%7;}
function progressFlowEvidenceMarkup(date,records,context){
 const rows=items=>items.map(r=>'<p><strong>'+escapeHtml(r.domain)+'</strong><span>'+escapeHtml(r.title)+'</span></p>').join('');
 return '<div class="progress-eyebrow"><strong>'+escapeHtml(progressShortDate(date,{weekday:'long',month:'short',day:'numeric'}))+'</strong><span>'+records.length+' completed records in this measure</span></div>'+ (records.length?rows(records):'<p><span>No completed records in this measure.</span></p>')+(context.length?'<details class="progress-flow-context"><summary>Context notes · not counted as completion ('+context.length+')</summary>'+rows(context)+'</details>':'');
}
renderLifeProgress=function(){
 const expanded=new Map([...progressView.querySelectorAll('.progress-flow-details')].map(d=>[d.querySelector('summary')?.textContent,d.open]));
 progressFlowOriginalRenderer();
 if(!progressView)return;
 const momentum=progressView.querySelector('.momentum-command');
 if(momentum)momentum.outerHTML=progressFlowSummaryMarkup(momentumStats(toDateKey()),journalProgressStreak());
 const intro=progressView.querySelector('.progress-title>div>p:last-child');if(intro)intro.textContent='Recorded activity, learning and follow-through. No extra tracking needed here.';
 const records=progressView.querySelector('.progress-records');
 if(records){
 const historic=records.querySelector('div:last-child');if(historic){historic.querySelector('span').textContent='Historical assessed days';historic.querySelector('small').textContent='Existing assessments; separate from the new Commitment battle.';}
 records.outerHTML='<details class="progress-flow-details"><summary>Personal records and historical assessments</summary>'+records.outerHTML+'</details>';
 }
 const deadlines=progressView.querySelector('.deadline-progress-panel');
 if(deadlines)deadlines.outerHTML='<details class="progress-flow-details"><summary>Career deadlines and delivery details</summary>'+deadlines.outerHTML+'</details>';
 const pulse=progressView.querySelector('.pulse-chart svg');
 if(pulse){const total=progressView.querySelector('.pulse-chart>div strong')?.textContent||'';pulse.setAttribute('aria-label','Four-week recorded activity trend. '+total);}
 const legend=progressView.querySelector('.heatmap-legend');
 const map=progressView.querySelector('.life-heatmap'),cells=map?.querySelectorAll('.life-cell');
 if(map&&cells?.length){const offset=progressFlowWeekOffset(cells[0].dataset.date);map.insertAdjacentHTML('afterbegin','<span aria-hidden="true" class="progress-flow-spacer"></span>'.repeat(offset));map.style.setProperty('--weeks',String(Math.ceil((cells.length+offset)/7)));}
 if(legend){legend.querySelector('span:first-child').textContent='No completed records';legend.querySelector('span:last-child').textContent='More completed records';}
 const evidence=progressView.querySelector('.life-evidence'),date=lifeSelectedDate||toDateKey();
 if(evidence){const records=progressRecords(date),context=lifeDay(date).records.filter(r=>!r.completed&&(progressMetric==='all'||r.domain===progressMetric));evidence.innerHTML=progressFlowEvidenceMarkup(date,records,context);}
 progressView.querySelectorAll('.progress-flow-details').forEach(d=>{const key=d.querySelector('summary')?.textContent;if(expanded.has(key))d.open=expanded.get(key);});
};
if(typeof progressView!=='undefined'&&progressView&&!progressView.classList.contains('is-hidden'))renderLifeProgress();
if(typeof setInterval==='function'&&typeof KryosCommitment!=='undefined'){
 let progressFlowDay=KryosCommitment.today();
 setInterval(()=>{const day=KryosCommitment.today();if(day!==progressFlowDay){progressFlowDay=day;if(typeof currentPage!=='undefined'&&currentPage==='progress')renderLifeProgress();}},30000);
}
