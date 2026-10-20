/* Projection owner: joins dated count evidence into existing page renderers. */
if(typeof KryosUI!=='undefined')KryosUI.claim('marketing.evidence','marketing-integration-ui.js',['marketing-integration-ui.css']);
const marketingEvidenceDisclosures=new Map();
function marketingEvidenceDisclosureKey(page,date,name){return page+'|'+date+'|'+name;}
function marketingEvidenceMarkup(page){
 const source=marketingEvidenceSource(),date=typeof kryosSelectedDate==='function'?kryosSelectedDate():toDateKey();
 const m=marketingEvidenceModel(date,source.rows,typeof launchStore==='function'?launchStore().marketEvents:[]),esc=escapeHtml;
 const known=!!(m.snapshot||m.direct||source.laptop&&source.connected&&source.ready!==false);
 const status=source.laptop
  ?source.dirty?'Local save pending':source.connected&&source.ready!==false?'Saved laptop source':source.ready===false?'Loading laptop source':'Recovery copy · service unavailable'
  :m.snapshot?(m.snapshot.receivedAt&&Number.isFinite(Date.parse(m.snapshot.receivedAt))?'Saved snapshot · '+m.snapshot.date:'Snapshot present · receipt unconfirmed'):'No snapshot for this date';
 const timestamp=value=>value&&!Number.isNaN(Date.parse(value))?new Date(value).toLocaleString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}):'receipt time unavailable';
 const open=name=>marketingEvidenceDisclosures.get(marketingEvidenceDisclosureKey(page,date,name))?' open':'';
 let earning='';if(page==='rewards'&&typeof rewardEvidence==='function'){const e=rewardEvidence(date);earning='<p class="marketing-evidence-note">Selected-day earned credits: '+esc(String(assessmentCredits(e)))+' across all categories. Applications contribute to the existing capped score. Current spendable wallet is separate.</p>';}
 return '<section class="marketing-integration" data-evidence-page="'+page+'" data-evidence-day="'+date+'" aria-label="Dated Marketing contribution"><header><div><p class="section-kicker">APPLICATION EVIDENCE</p><h2>'+(known?m.applications:'—')+' applications <span>· '+esc(date)+'</span></h2><p class="marketing-evidence-freshness">'+esc(status)+'</p></div><button type="button" class="secondary-button" data-page="marketing">View Marketing '+(source.laptop?'workspace':'analytics')+' →</button></header><details data-evidence-disclosure="source"'+open('source')+'><summary>Show count and source details</summary><div class="marketing-integration-metrics"><div><strong>'+(m.snapshot?m.snapshot.submittedCount:source.laptop&&source.connected&&source.ready!==false?0:'—')+'</strong><span>'+(source.laptop?'Laptop Marketing records':'Handed-off Marketing count')+'</span></div><div><strong>'+m.direct+'</strong><span>Distinct applications logged in Launch</span></div><div><strong>'+(known?m.applications:'—')+'</strong><span>Combined evidence · larger count, not sum</span></div></div><p class="marketing-evidence-note">Overlap uses the larger count to avoid counting the same effort twice. — means no source evidence; an explicit received 0 stays zero.</p><p class="marketing-evidence-note">'+(source.laptop?'Source revision '+(source.revision||0)+'. '+(source.dirty?'Changes await a confirmed laptop save. ':source.connected?'Reading saved laptop records. ':'Showing this browser’s recovery copy. ')+'Statistics reach hosted progress only through an approved handoff. Jobs, contacts, descriptions and files stay on this laptop.':m.snapshot?'Selected snapshot: '+esc(m.snapshot.date)+' · source revision '+m.snapshot.revision+' · '+esc(timestamp(m.snapshot.receivedAt))+'. This is a saved snapshot, not a live laptop connection.':'No Marketing handoff for this date. Request a statistics handoff after your local application work.')+'</p>'+(m.latest&&!source.laptop?'<p class="marketing-evidence-note">Latest received source: '+esc(m.latest.date)+' · revision '+m.latest.revision+' · '+esc(timestamp(m.latest.receivedAt))+'</p>':'')+earning+(page==='progress'?'<p class="marketing-evidence-note">Application volume is separate from the activity chart: a dated summary can be one evidence record.</p>':'')+'<details data-evidence-disclosure="dates"'+open('dates')+'><summary>Earlier Marketing dates · '+m.rows.length+'</summary><div class="marketing-integration-dates">'+m.rows.slice().reverse().map(r=>'<button type="button" class="secondary-button" data-marketing-evidence-date="'+r.date+'" aria-label="Review '+r.date+': '+r.submittedCount+' applications">'+r.date+' · '+r.submittedCount+'</button>').join('')+'</div></details></details></section>';
}
function marketingEvidenceAttach(page,root){
 if(!root)return;
 const previous=root.querySelector('.marketing-integration');
 if(previous?.contains(document.activeElement))return;
 if(previous)previous.querySelectorAll('[data-evidence-disclosure]').forEach(d=>marketingEvidenceDisclosures.set(marketingEvidenceDisclosureKey(page,previous.dataset.evidenceDay,d.dataset.evidenceDisclosure),d.open));
 const html=marketingEvidenceMarkup(page);
 if(previous&&previous.outerHTML===html)return;
 const anchor=root.querySelector(page==='launch'?'.launch-flow-focus':page==='rewards'?'.reward-hero':'.progress-title');
 if(!anchor)return;
 previous?.remove();anchor.insertAdjacentHTML('afterend',html);
}
document.addEventListener('toggle',event=>{
 const node=event.target;if(!node.matches?.('[data-evidence-disclosure]'))return;
 const section=node.closest('.marketing-integration');if(section)marketingEvidenceDisclosures.set(marketingEvidenceDisclosureKey(section.dataset.evidencePage,section.dataset.evidenceDay,node.dataset.evidenceDisclosure),node.open);
},true);
const marketingEvidenceLaunchRender=renderLaunchView;renderLaunchView=function(){marketingEvidenceProjection=marketingEvidenceReadSource();try{marketingEvidenceLaunchRender();marketingEvidenceAttach('launch',launchView);}finally{marketingEvidenceProjection=null;}};
const marketingEvidenceProgressRender=renderLifeProgress;renderLifeProgress=function(){marketingEvidenceProgressRender();marketingEvidenceAttach('progress',progressView);};
const marketingEvidenceRewardsRender=renderRewardV5;renderRewardV5=function(){marketingEvidenceRewardsRender();marketingEvidenceAttach('rewards',rewardsView);};
const marketingEvidenceJournalRewards=renderJournalRewards;renderJournalRewards=function(){marketingEvidenceJournalRewards();marketingEvidenceAttach('rewards',rewardsView);};
let marketingEvidenceLocalSignature='';
setInterval(()=>{if(document.body.dataset.kryosStorage!=='laptop'||!['launch','progress','rewards'].includes(currentPage))return;const signature=[typeof marketingLocalRevision==='number'?marketingLocalRevision:0,typeof marketingLocalConnected!=='undefined'&&marketingLocalConnected,typeof marketingLocalDirty!=='undefined'&&marketingLocalDirty].join('|');const root=currentPage==='launch'?launchView:currentPage==='progress'?progressView:rewardsView;if(signature===marketingEvidenceLocalSignature||document.querySelector('#launch-dialog[open]')||root?.contains(document.activeElement))return;marketingEvidenceLocalSignature=signature;if(currentPage==='launch')renderLaunchView();else marketingEvidenceAttach(currentPage,currentPage==='progress'?progressView:rewardsView);},1500);
document.addEventListener('click',event=>{const b=event.target.closest('[data-marketing-evidence-date]');if(!b)return;event.preventDefault();const date=b.dataset.marketingEvidenceDate;if(marketingEvidenceValidDate(date)&&typeof KryosDayContext!=='undefined')KryosDayContext.set(date);});
if(typeof currentPage!=='undefined'&&['launch','progress','rewards'].includes(currentPage))render();
