let launchDialog = '';

function launchStore() {
  taskState.launch ||= {
    version: 1,
    targets: { marketWeekdays: 5, mockMinimum: 3, mockStretch: 6 },
    platforms: [{id:'linkedin',name:'LinkedIn'},{id:'builtin',name:'Built In'},{id:'glassdoor',name:'Glassdoor'},{id:'indeed',name:'Indeed'},{id:'company-sites',name:'Company sites'}],
    marketEvents: [],
    mockSessions: [],
  };
  taskState.launch.marketEvents ||= [];
  taskState.launch.mockSessions ||= [];
  taskState.launch.platforms ||= [];
  return taskState.launch;
}
function launchWeekStart(date = new Date()) {
  const copy = new Date(date); copy.setHours(12,0,0,0);
  const day = copy.getDay(); copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1));
  return toDateKey(copy);
}
function launchWeekDates(offset = 0) {
  const monday = addDays(getDateFromKey(launchWeekStart()), offset * 7);
  return Array.from({length:7},(_,index)=>toDateKey(addDays(monday,index)));
}
function launchEventsOn(date) { return launchStore().marketEvents.filter(item=>item.date===date && (item.type!=='post' || item.status==='published')); }
function launchMocksOn(date) { return launchStore().mockSessions.filter(item=>item.date===date); }
function launchCurrentWeek() {
  const dates=launchWeekDates(),weekdays=dates.slice(0,5);
  const marketDays=weekdays.filter(date=>launchEventsOn(date).length).length;
  const mocks=launchStore().mockSessions.filter(item=>dates.includes(item.date));
  return { dates, weekdays, marketDays, mocks, marketEvents:launchStore().marketEvents.filter(item=>dates.includes(item.date)) };
}
function launchWeekdayStreak() {
  let date=getDateFromKey(toDateKey()),streak=0;
  for(let i=0;i<120;i+=1){
    const key=toDateKey(date),day=date.getDay();
    if(day===0||day===6){date=addDays(date,-1);continue;}
    if(launchEventsOn(key).length)streak+=1;else if(key!==toDateKey())break;
    date=addDays(date,-1);
  }
  return streak;
}
function launchIcon(name) { return typeof rhythmIcon==='function'?rhythmIcon(name):''; }
function launchOpenDialog(type){launchDialog=type;renderLaunchView();setTimeout(()=>document.querySelector('#launch-dialog')?.showModal(),0);}
function launchCloseDialog(){document.querySelector('#launch-dialog')?.close();launchDialog='';renderLaunchView();}
function launchMarketLabel(type){return ({application:'Application',connection:'Connection request',message:'Direct message',comment:'Meaningful comment',referral:'Referral ask',conversation:'Career conversation',followup:'Follow-up',visibility:'Profile / visibility',post:'LinkedIn post',platform:'Platform review'})[type]||type;}
function launchPlatformCircuit() {
  const store=launchStore(),today=toDateKey();
  return `<div class="launch-platforms">${store.platforms.map(platform=>{const checked=store.marketEvents.some(item=>item.date===today&&item.type==='platform'&&item.platformId===platform.id);return `<button type="button" class="${checked?'checked':''}" data-launch-platform="${escapeHtml(platform.id)}"><span>${checked?launchIcon('check'):launchIcon('search')}</span><strong>${escapeHtml(platform.name)}</strong><small>${checked?'Processed today':'Review today'}</small></button>`}).join('')}<button type="button" class="add" data-launch-open="platform"><span>${launchIcon('plus')}</span><strong>Add platform</strong><small>Custom source</small></button></div>`;
}
function launchNetworkVisibility() {
  const week=launchCurrentWeek(),events=week.marketEvents;
  const network=events.filter(item=>['connection','message','comment','referral','conversation','followup'].includes(item.type));
  const posts=events.filter(item=>item.type==='post');
  const published=posts.filter(item=>item.status==='published');
  const postPct=Math.min(100,Math.round(published.length/2*100));
  const networkDays=new Set(network.map(item=>item.date)).size;
  return `<div class="launch-network-grid"><article><header><span>${launchIcon('users')}</span><div><p>CONNECTION USE</p><h3>Turn the network into conversations.</h3></div></header><strong>${network.length}<small> meaningful actions</small></strong><div class="launch-network-types"><span>${network.filter(item=>item.type==='connection').length} requests</span><span>${network.filter(item=>['message','followup'].includes(item.type)).length} messages</span><span>${network.filter(item=>['comment','conversation','referral'].includes(item.type)).length} conversations</span></div><p>${networkDays} active networking day${networkDays===1?'':'s'} this week. Quality actions count; browsing connections does not.</p><button class="primary-button" data-launch-open="network">Log connection action</button></article><article class="posts"><header><span>${launchIcon('notebook-pen')}</span><div><p>VISIBLE THINKING</p><h3>Publish at least twice each week.</h3></div></header><strong>${published.length}<small> / 2 posts published</small></strong><div class="launch-post-track"><i style="width:${postPct}%"></i></div><div class="launch-post-days">${launchWeekDates().map(date=>`<i class="${published.some(item=>item.date===date)?'published':''}" title="${formatDateKey(date)}"><span>${getDateFromKey(date).toLocaleDateString(undefined,{weekday:'short'}).slice(0,1)}</span></i>`).join('')}</div><p>${posts.filter(item=>item.status==='draft').length} draft${posts.filter(item=>item.status==='draft').length===1?'':'s'} recorded. Only published posts satisfy the weekly target.</p><button class="primary-button" data-launch-open="post">Log post</button></article></div>`;
}

function launchExposureGrid() {
  const end=getDateFromKey(toDateKey()),start=addDays(end,-83);
  const dates=Array.from({length:84},(_,index)=>toDateKey(addDays(start,index)));
  return `<div class="launch-heatmap">${dates.map(date=>{const market=launchEventsOn(date).length,mocks=launchMocksOn(date).length,level=Math.min(4,market+mocks);return `<i class="level-${level}" title="${formatDateKey(date)}: ${market} market, ${mocks} rehearsal"><span>${new Date(`${date}T12:00:00`).getDate()}</span></i>`}).join('')}</div><div class="launch-heat-legend"><span>12 weeks ago</span><div><i></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i></div><span>Today</span></div>`;
}
function launchWeekPulse() {
  const week=launchCurrentWeek();
  return `<div class="launch-week-pulse">${week.dates.map(date=>{const market=launchEventsOn(date).length,mocks=launchMocksOn(date).length,isWeekday=[1,2,3,4,5].includes(getDateFromKey(date).getDay());return `<article class="${date===toDateKey()?'today':''}"><span>${getDateFromKey(date).toLocaleDateString(undefined,{weekday:'short'}).slice(0,2)}</span><strong>${market+mocks}</strong><div><i class="market ${market?'active':''}"></i><i class="mock ${mocks?'active':''}"></i></div><small>${isWeekday?'market day':'recovery'}</small></article>`}).join('')}</div>`;
}
function launchMarketPipeline() {
  const store=launchStore();
  const applications=store.marketEvents.filter(item=>item.type==='application');
  const stages=['applied','response','interview','offer'];
  const counts=stages.map(stage=>applications.filter(item=>item.stage===stage || (stage==='applied'&&item.stage==='')).length);
  return `<div class="launch-pipeline">${stages.map((stage,index)=>`<div><span>${stage}</span><strong>${counts[index]}</strong><i style="--pipeline:${applications.length?Math.max(8,counts[index]/applications.length*100):0}%"></i></div>`).join('')}</div>`;
}
function launchTimeline() {
  const rows=[...launchStore().marketEvents.map(item=>({date:item.date,type:'market',title:launchMarketLabel(item.type),subject:[item.company,item.role,item.person,item.topic].filter(Boolean).join(' · ')||'Market action',detail:item.note||item.stage||item.status||item.channel||'Recorded exposure'})),...launchStore().mockSessions.map(item=>({date:item.date,type:'mock',title:item.mode==='self'?'Self mock · AirPods':'AI mock interview',subject:item.focus||'Interview rehearsal',detail:`${item.minutes} min${item.confidenceAfter?` · confidence ${item.confidenceBefore||'—'} → ${item.confidenceAfter}`:''}${item.note?` · ${item.note}`:''}`}))].sort((a,b)=>b.date.localeCompare(a.date));
  return rows.length?rows.slice(0,12).map(item=>`<article class="launch-log-row"><span class="${item.type}">${launchIcon(item.type==='market'?'send':'mic-2')}</span><div><time>${formatDateKey(item.date)}</time><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.subject)}</p></div><em>${escapeHtml(item.detail)}</em></article>`).join(''):`<div class="launch-empty"><strong>No exposure evidence yet.</strong><p>The first small market action changes this page immediately.</p></div>`;
}
function renderLaunchView() {
  if(!launchView)return;
  const week=launchCurrentWeek(),streak=launchWeekdayStreak(),marketPct=Math.min(100,Math.round(week.marketDays/5*100)),mockPct=Math.min(100,Math.round(week.mocks.length/6*100));
  launchView.innerHTML=`<header class="launch-command"><div><p class="section-kicker">KRYOS / CAREER LAUNCH</p><h1>Enter the market before you feel ready.</h1><p>Skill-building, visibility, applications, and rehearsal move in parallel. Preparation does not get to postpone exposure.</p><div class="launch-actions"><button data-launch-open="market">Log market action</button><button data-launch-open="mock">Log rehearsal</button></div></div><div class="launch-command-stat"><span>Weekday exposure</span><strong>${week.marketDays}<em>/5</em></strong><small>${marketPct}% of this week</small></div><div class="launch-command-stat"><span>Interview reps</span><strong>${week.mocks.length}<em>/3–6</em></strong><small>${week.mocks.length>=3?'Minimum secured':'Minimum still open'}</small></div><div class="launch-command-stat"><span>Exposure streak</span><strong>${streak}<em> days</em></strong><small>Weekdays with market evidence</small></div></header>
    <section class="launch-parallel"><div><span>01</span><strong>BUILD CAPABILITY</strong><small>Career Skills continues.</small></div><i></i><div><span>02</span><strong>ENTER THE MARKET</strong><small>Applications and real people.</small></div><i></i><div><span>03</span><strong>REHEARSE OUT LOUD</strong><small>Self and AI mocks.</small></div><b>All three move together</b></section>
    <div class="launch-grid"><main><section class="launch-surface"><div class="launch-head"><div><p class="section-kicker">THIS WEEK</p><h2>Seven-day exposure pulse</h2></div><div class="launch-key"><span><i class="market"></i>Market</span><span><i class="mock"></i>Rehearsal</span></div></div>${launchWeekPulse()}<div class="launch-minimum"><div><span>WHEN RESISTANCE IS HIGH</span><strong>Minimum viable rep</strong><p>One thoughtful application or one genuine professional message. Then answer one interview question aloud for five minutes.</p></div><button data-launch-open="market">Start with one</button></div></section>
      <section class="launch-surface"><div class="launch-head"><div><p class="section-kicker">WEEKDAY PLATFORM CIRCUIT</p><h2>Search broadly without losing the trail.</h2><p>Check a source only after reviewing and processing relevant roles.</p></div><button class="secondary-button" data-launch-open="platform">Add source</button></div>${launchPlatformCircuit()}</section><section class="launch-surface"><div class="launch-head"><div><p class="section-kicker">NETWORK & VISIBILITY</p><h2>Relationships and public proof.</h2></div><span>Two different forms of market presence</span></div>${launchNetworkVisibility()}</section><section class="launch-surface"><div class="launch-head"><div><p class="section-kicker">CONSISTENCY FIELD</p><h2>Visible proof across 12 weeks</h2></div><span>${launchStore().marketEvents.length+launchStore().mockSessions.length} total reps</span></div>${launchExposureGrid()}</section>
      <section class="launch-surface"><div class="launch-head"><div><p class="section-kicker">EVIDENCE LOG</p><h2>Exposure, not intention.</h2></div></div><div class="launch-timeline">${launchTimeline()}</div></section></main>
      <aside><section class="launch-surface launch-lane market"><div class="launch-lane-title"><span>${launchIcon('send')}</span><div><p>MARKET</p><h2>Be findable. Apply. Contact.</h2></div></div><div class="launch-ring" style="--launch-angle:${marketPct*3.6}deg"><div><strong>${week.marketDays}</strong><span>of 5 weekdays</span></div></div><div class="launch-metrics"><div><strong>${week.marketEvents.filter(item=>item.type==='application').length}</strong><span>applications</span></div><div><strong>${week.marketEvents.filter(item=>['connection','message','followup'].includes(item.type)).length}</strong><span>people actions</span></div></div><button class="primary-button" data-launch-open="market">Add market evidence</button></section>
      <section class="launch-surface launch-lane mock"><div class="launch-lane-title"><span>${launchIcon('mic-2')}</span><div><p>REHEARSE</p><h2>Make speaking familiar.</h2></div></div><div class="launch-ring" style="--launch-angle:${mockPct*3.6}deg"><div><strong>${week.mocks.length}</strong><span>of 3–6 reps</span></div></div><div class="launch-metrics"><div><strong>${week.mocks.filter(item=>item.mode==='self').length}</strong><span>self / AirPods</span></div><div><strong>${week.mocks.filter(item=>item.mode==='ai').length}</strong><span>AI mocks</span></div></div><button class="primary-button" data-launch-open="mock">Add rehearsal</button></section>
      <section class="launch-surface"><div class="launch-head"><div><p class="section-kicker">APPLICATION SIGNAL</p><h2>Pipeline movement</h2></div></div>${launchMarketPipeline()}<p class="launch-footnote">Pipeline outcomes matter, but daily exposure remains the behavior KRYOS measures.</p></section></aside></div>${renderLaunchDialog()}`;
  if(window.lucide)lucide.createIcons({attrs:{width:16,height:16,'stroke-width':2}});
}

function renderLaunchDialog(){
  if(!launchDialog)return '';
  const market=`<input type="hidden" name="type" value="market"><label>Date<input name="date" type="date" value="${toDateKey()}" required></label><label>Action<select name="action"><option value="application">Application</option><option value="connection">LinkedIn connection</option><option value="message">Direct message</option><option value="followup">Follow-up</option><option value="visibility">Profile / visibility</option></select></label><label>Company<input name="company" maxlength="120"></label><label>Role<input name="role" maxlength="120"></label><label>Person<input name="person" maxlength="120"></label><label>Channel<select name="channel"><option>LinkedIn</option><option>Company site</option><option>Email</option><option>Referral</option><option>Other</option></select></label><label>Stage<select name="stage"><option value="">Not applicable</option><option value="applied">Applied</option><option value="response">Response</option><option value="interview">Interview</option><option value="offer">Offer</option></select></label><label class="wide">Evidence note<textarea name="note" maxlength="500" placeholder="What was actually sent or completed?"></textarea></label>`;
  const mock=`<input type="hidden" name="type" value="mock"><label>Date<input name="date" type="date" value="${toDateKey()}" required></label><label>Mode<select name="mode"><option value="self">Self mock with AirPods</option><option value="ai">AI mock interview</option></select></label><label>Minutes<input name="minutes" type="number" min="1" max="240" value="15" required></label><label>Focus<input name="focus" maxlength="160" placeholder="Behavioral, system design, introduction..."></label><label>Confidence before<input name="confidenceBefore" type="number" min="1" max="5"></label><label>Confidence after<input name="confidenceAfter" type="number" min="1" max="5"></label><label class="wide">What improved?<textarea name="note" maxlength="500"></textarea></label>`;
  const platform=`<input type="hidden" name="type" value="platform"><label class="wide">Platform name<input name="name" maxlength="80" placeholder="Dice, Wellfound, Handshake..." required></label>`;
  const network=`<input type="hidden" name="type" value="network"><label>Date<input name="date" type="date" value="${toDateKey()}" required></label><label>Action<select name="action"><option value="connection">Connection request</option><option value="message">Direct message</option><option value="comment">Meaningful comment</option><option value="followup">Follow-up</option><option value="referral">Referral ask</option><option value="conversation">Career conversation</option></select></label><label>Person<input name="person" maxlength="120" required></label><label>Company<input name="company" maxlength="120"></label><label class="wide">What did you actually do?<textarea name="note" maxlength="500" required></textarea></label>`;
  const post=`<input type="hidden" name="type" value="post"><label>Date<input name="date" type="date" value="${toDateKey()}" required></label><label>Status<select name="status"><option value="published">Published</option><option value="draft">Draft only</option></select></label><label class="wide">Topic or headline<input name="topic" maxlength="180" required></label><label class="wide">Post link<input name="url" type="url" maxlength="500" placeholder="https://linkedin.com/posts/..."></label><label class="wide">Evidence note<textarea name="note" maxlength="500"></textarea></label>`;
  const isMarket=launchDialog==='market',isPlatform=launchDialog==='platform',isNetwork=launchDialog==='network',isPost=launchDialog==='post';
  const form=isMarket?market:isPlatform?platform:isNetwork?network:isPost?post:mock;
  const title=isMarket?'Record real-world exposure':isPlatform?'Add a search source':isNetwork?'Record meaningful connection use':isPost?'Record visible work':'Record an interview repetition';
  return `<dialog id="launch-dialog" class="money-dialog launch-dialog"><form id="launch-form"><header><div><p class="section-kicker">CAREER LAUNCH / ${launchDialog.toUpperCase()}</p><h2>${title}</h2></div><button type="button" data-launch-close aria-label="Close">×</button></header><div class="money-form-grid">${form}</div><footer><button type="button" class="secondary-button" data-launch-close>Cancel</button><button class="primary-button">Save evidence</button></footer></form></dialog>`;
}

document.addEventListener('click',event=>{const platform=event.target.closest('[data-launch-platform]');if(platform){const store=launchStore(),date=toDateKey(),platformId=platform.dataset.launchPlatform,index=store.marketEvents.findIndex(item=>item.date===date&&item.type==='platform'&&item.platformId===platformId);if(index>=0)store.marketEvents.splice(index,1);else{const source=store.platforms.find(item=>item.id===platformId);store.marketEvents.push({id:createId(),date,type:'platform',platformId,channel:source?.name||'Platform',note:'Relevant roles reviewed and processed.',createdAt:new Date().toISOString()});}saveTasks();renderLaunchView();return;}const open=event.target.closest('[data-launch-open]');if(open){launchOpenDialog(open.dataset.launchOpen);return;}if(event.target.closest('[data-launch-close]'))launchCloseDialog();});
document.addEventListener('submit',event=>{if(event.target.id!=='launch-form')return;event.preventDefault();const f=new FormData(event.target),store=launchStore(),now=new Date().toISOString(),type=f.get('type');if(type==='market')store.marketEvents.push({id:createId(),date:f.get('date'),type:f.get('action'),company:String(f.get('company')||'').trim(),role:String(f.get('role')||'').trim(),person:String(f.get('person')||'').trim(),channel:f.get('channel'),stage:f.get('stage'),note:String(f.get('note')||'').trim(),createdAt:now});else if(type==='platform'){const name=String(f.get('name')||'').trim();if(name&&!store.platforms.some(item=>item.name.toLowerCase()===name.toLowerCase()))store.platforms.push({id:`platform-${createId()}`,name});}else if(type==='network')store.marketEvents.push({id:createId(),date:f.get('date'),type:f.get('action'),person:String(f.get('person')||'').trim(),company:String(f.get('company')||'').trim(),note:String(f.get('note')||'').trim(),createdAt:now});else if(type==='post')store.marketEvents.push({id:createId(),date:f.get('date'),type:'post',status:f.get('status'),topic:String(f.get('topic')||'').trim(),url:String(f.get('url')||'').trim(),note:String(f.get('note')||'').trim(),createdAt:now});else store.mockSessions.push({id:createId(),date:f.get('date'),mode:f.get('mode'),minutes:Number(f.get('minutes'))||0,focus:String(f.get('focus')||'').trim(),confidenceBefore:Number(f.get('confidenceBefore'))||null,confidenceAfter:Number(f.get('confidenceAfter'))||null,note:String(f.get('note')||'').trim(),createdAt:now});saveTasks();launchDialog='';renderLaunchView();});
