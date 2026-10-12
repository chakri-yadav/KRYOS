/* One deterministic earning standard for browser, laptop and cloud. */
(function(root){
 const start='2026-10-11',version=5;
 const list=x=>Array.isArray(x)?x:[];
 const shift=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
 const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&shift(d,0)===d;
 const categories={purpose:{title:'Employment-building',cap:50,page:'launch'},foundation:{title:'Foundations',cap:25,page:'rhythm'},responsibility:{title:'Responsibility',cap:15,page:'money'},articulation:{title:'Articulation',cap:5,page:'launch'},bonus:{title:'Consistency',cap:5,page:'journal'}};
 const catalog=[{id:'bounded-video',title:'Chosen videos or news',cost:5,cooldownDays:1,note:'One chosen 30-minute session. No prohibited content.'},{id:'friend-call',title:'Intentional friend call',cost:25,cooldownDays:7,note:'One optional call, up to an hour. Support is always available.'},{id:'movie',title:'Movie night',cost:90,cooldownDays:7,note:'One movie. Your work stays credited after spending.'},{id:'initiated-call',title:'Your intentional personal call',cost:100,cooldownDays:7,qualifiedDaysInWindow:5,note:'Five qualified days in the previous seven. Incoming and support calls are unrestricted.'}];
 const kinds={'application-start':5,'career-start':5,concept:15,practice:10,mock:25,'articulation-small':2,'articulation-medium':5,shift:3};
 function dayOf(e){if(valid(e.date||e.completedDate))return e.date||e.completedDate;if(!e.completedAt)return '';const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date(e.completedAt)).map(x=>[x.type,x.value]));const d=p.year+'-'+p.month+'-'+p.day;return Number(p.hour)<7?shift(d,-1):d;}
 const identity=e=>String(e.sourceRef||e.sourceId||e.id||'');
 function dates(tasks={},career={},today){const life=tasks.life||{};return [...new Set([...list(tasks.rhythm?.events),...list(tasks.launch?.marketEvents),...list(tasks.launch?.mockSessions),...list(tasks.money?.contacts),...list(tasks.money?.payments),...list(tasks.money?.ledgerEvents),...list(life.actions),...list(life.records),...list(life.rewardEvents),...list(life.marketingSummaries),...list(life.dailyAssessments),...list(career.activityLog)].map(dayOf).filter(d=>valid(d)&&d>=start&&d<=today))].sort();}
 function maintenance(tasks,through){const out=[],events=list(tasks.rhythm?.events).filter(e=>valid(e.date)&&e.date<=through&&Number(e.value)>0).sort((a,b)=>a.date.localeCompare(b.date));
  for(const kind of ['exercise','hair-care','groceries']){let last='';let pool=[];for(const e of events.filter(x=>x.habitId===kind)){if(kind==='exercise'){pool=pool.filter(d=>d>=shift(e.date,-6));if(!pool.includes(e.date))pool.push(e.date);if(pool.length<2)continue;}if(last&&e.date<shift(last,7))continue;last=e.date;if(kind==='exercise')pool=[];if(e.date>=start)out.push({date:e.date,id:'maintenance:'+kind+':'+e.date,title:kind==='exercise'?'Two exercise days in seven days':kind==='hair-care'?'Weekly hair care':'Grocery purchase',points:kind==='exercise'?3:kind==='groceries'?3:1});}}
  return out;}
 function base(date,tasks={},career={}){
  const life=tasks.life||{},buckets=Object.fromEntries(Object.keys(categories).map(k=>[k,[]])),scores=Object.fromEntries(Object.keys(categories).map(k=>[k,0])),seen=new Set();
  const add=(lane,id,title,source,points)=>{if(!id||seen.has(id)||!Number.isFinite(points)||points<=0)return;seen.add(id);const n=Math.max(0,Math.min(points,categories[lane].cap-scores[lane]));if(n){scores[lane]+=n;buckets[lane].push({id,title,source,points:n});}};
  const value=id=>Math.max(0,...list(tasks.rhythm?.events).filter(e=>e.date===date&&e.habitId===id).map(e=>Number(e.value)||0));
  const meals=['breakfast','lunch','dinner'].filter(id=>value(id)>0).length;
  if(meals>=2)add('foundation','meals:'+date,'Two meals','Rhythm',4);
  for(const [id,target,points,title] of [['protein',1,2,'Protein routine'],['supplements',1,1,'Agreed supplements'],['water',3,3,'3 L water']])if(value(id)>=target)add('foundation',id+':'+date,title,'Rhythm',points);
  if(['face-wash','moisturizer','serum','eye-cream','sunscreen'].filter(id=>value(id)>0).length>=2)add('foundation','skincare:'+date,'Two skincare steps','Rhythm',3);
  if(['pranayama','meditation','nama-japa','gita','aditya','chalisa'].filter(id=>value(id)>=(['aditya','chalisa'].includes(id)?3:1)).length>=2)add('foundation','spirit:'+date,'Two completed spiritual practices','Rhythm',5);
  maintenance(tasks,date).filter(e=>e.date===date).forEach(e=>add('foundation',e.id,e.title,'Rhythm',e.points));
  const typed=list(life.rewardEvents).filter(e=>e.date===date&&e.completed===true&&!e.voidedAt&&kinds[e.kind]);
  const uniqueTyped=[...new Map(typed.map(e=>[identity(e),e])).values()];
  let appStart=uniqueTyped.find(e=>e.kind==='application-start'),careerStart=uniqueTyped.find(e=>e.kind==='career-start');
  const appRows=[],appSeen=new Set();
  list(tasks.launch?.marketEvents).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(e=>{if(e.type!=='application'||!e.company||!e.role||e.voidedAt)return;const key=String(e.sourceRef||e.jobId||e.url||[e.company,e.role].join('|')).trim().toLowerCase();if(appSeen.has(key))return;appSeen.add(key);if(e.date===date)appRows.push({...e,key});});
  const snapshots=list(life.marketingSummaries).filter(s=>s.date===date);
  const importedCount=Math.max(0,...snapshots.map(s=>Number(s.submittedCount)||0));
  // Aggregate overlap is unknowable: take the larger total, never add it twice.
  const applicationCount=Math.max(appRows.length,importedCount);
  let applicationScore=appStart||applicationCount?5:0;const increments=[10,8,6,4,3,1,1,1,1];
  applicationScore+=appRows.reduce((n,e,i)=>n+(increments[i]||0),0);
  if(appStart||applicationCount)add('purpose','application-start:'+date,'Meaningful application preparation','Launch',5);
  appRows.forEach((e,i)=>add('purpose','application:'+e.key,e.company+' · '+e.role,'Launch',increments[i]||0));
  const importedPoints=increments.slice(appRows.length,Math.min(applicationCount,9)).reduce((n,p)=>n+p,0);
  if(importedPoints)add('purpose','marketing-stats:'+date,'Laptop Marketing · '+importedCount+' submitted applications','Marketing stats',importedPoints);
  const checks=new Map();list(career.roadmaps).forEach(r=>list(r.modules).forEach(m=>list(m.topics).forEach(t=>list(t.checklist).forEach(c=>checks.set(r.id+':'+c.id,c.done)))));
  const first=new Map();list(career.activityLog).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(e=>{if(e.checkId&&!['module-complete','topic-complete'].includes(e.eventType)){const k=e.roadmapId+':'+e.checkId;if(!first.has(k))first.set(k,e);}});
  const learning=[...first].filter(([k,e])=>e.date===date&&checks.get(k)===true).map(([k,e])=>({id:'career:'+k,title:e.checkText||'Completed roadmap step',points:15}));
  uniqueTyped.filter(e=>['concept','practice','mock'].includes(e.kind)).forEach(e=>learning.push({id:identity(e),title:e.title,points:kinds[e.kind]}));
  list(tasks.launch?.mockSessions).filter(e=>e.date===date&&e.completed===true&&(e.serious===true||e.level==='large')&&e.note?.trim()).forEach(e=>learning.push({id:e.sourceRef||'mock:'+e.id,title:e.focus||'Completed serious mock',points:25}));
  let learningScore=0;if(careerStart||learning.length){learningScore=5;add('purpose','career-start:'+date,'Meaningful learning start','Career',5);}
  const learned=new Set();for(const e of learning){if(learned.has(e.id))continue;learned.add(e.id);const n=Math.min(e.points,40-learningScore);learningScore+=n;add('purpose',e.id,e.title,'Career',n);}
  for(const e of uniqueTyped.filter(e=>e.kind.startsWith('articulation-'))){if(learned.has(identity(e)))continue;add('articulation',identity(e),e.title,'Launch',kinds[e.kind]);}
  let contactAwarded=false;list(tasks.money?.contacts).filter(e=>e.date===date&&!e.voidedAt).forEach(e=>{if(contactAwarded||!['call','phone','message','text','email','in-person','in person','whatsapp'].includes(String(e.method).toLowerCase())||!e.outcome?.trim())return;contactAwarded=true;add('responsibility',e.sourceRef||'money-contact:'+e.id,'Follow-up attempt · '+e.outcome,'Money',8);if(e.note?.trim()||e.nextFollowUp)add('responsibility','money-closure:'+e.id,'Outcome or next step recorded','Money',2);});
  const payment=list(tasks.money?.ledgerEvents).find(e=>e.date===date&&e.type==='card-payment'&&e.funder==='own'&&Number(e.amountCents)>0&&!e.voidedAt);
  if(payment)add('responsibility','payment:'+payment.id,'Payment obligation completed','Money',5);
  uniqueTyped.filter(e=>e.kind==='shift').slice(0,1).forEach(e=>add('responsibility',identity(e),e.title,'Work',3));
  list(life.actions).filter(e=>e.status==='done'&&dayOf(e)===date&&['important','critical'].includes(e.priority)).forEach(e=>{if(/^(money|career|launch|application|mock)[:\-]/.test(e.sourceRef||'')||list(tasks.money?.contacts).some(c=>c.actionId===e.id)||list(tasks.money?.ledgerEvents).some(c=>c.actionId===e.id))return;add('responsibility',e.sourceRef||'action:'+(e.externalId||e.id),e.title,'Actions',e.priority==='critical'?5:3);});
  const gross=Object.values(scores).reduce((a,b)=>a+b,0),work=applicationCount>0||learning.length>0;
  const qualified=work&&scores.purpose>=15&&scores.foundation>=8&&gross>=30;
  return {date,ruleVersion:version,buckets,scores,total:gross,gross,qualified,work,gates:{work,foundation:scores.foundation>=8,threshold:gross>=30},credits:Math.floor(gross/5),remainder:gross%5,deduction:0,workspaces:[...new Set(Object.values(buckets).flat().map(e=>e.source))]};
 }
 function evaluate(date,tasks={},career={}){const a=base(date,tasks,career);if(date<start)return a;if(a.qualified){let points=3;if(base(shift(date,-1),tasks,career).qualified&&base(shift(date,-2),tasks,career).qualified)points+=2;a.scores.bonus=points;a.buckets.bonus.push({id:'consistency:'+date,title:points===5?'Qualified day · third consecutive day or later':'Qualified day',source:'Rewards',points});a.total+=points;}a.credits=Math.floor(a.total/5);a.remainder=a.total%5;return a;}
 function eligibility(reward,assessments,redemptions,today){const recent=new Set(Array.from({length:7},(_,i)=>shift(today,-i)));const count=new Set(assessments.filter(a=>a.ruleVersion===version&&a.qualified&&recent.has(a.date)).map(a=>a.date)).size;const latest=list(redemptions).filter(r=>r.rewardId===reward.id&&!['cancelled','rejected'].includes(r.status)).map(r=>r.date).sort().at(-1);const remaining=latest?Math.max(0,reward.cooldownDays-Math.round((Date.parse(today)-Date.parse(latest))/86400000)):0;const missing=Math.max(0,(reward.qualifiedDaysInWindow||0)-count);return {allowed:!remaining&&!missing,missingCooldown:remaining,missingDays:missing,qualifiedDays:count};}
 function wallet(assessments,redemptions,reservation={}){const daily=[...new Map(list(assessments).map(a=>[a.date,a])).values()].reduce((n,a)=>n+Number(a.credits||0),0);const spent=list(redemptions).filter(r=>!['rejected','cancelled'].includes(r.status)).reduce((n,r)=>n+Number(r.cost||0),0);const balance=Math.max(0,daily-spent),reserved=Math.min(balance,Math.max(0,Math.floor(Number(reservation.amount)||0)));return {earned:daily,spent,balance,reserved,available:balance-reserved,adjustmentDue:Math.max(0,spent-daily)};}
 root.KryosRewardV5={start,version,categories,catalog,kinds,shift,valid,dayOf,dates,base,evaluate,eligibility,wallet,maintenance};
})(globalThis);
