/* Shared deterministic rules: browser preview and cloud calculation use this file. */
(function(root) {
  // One earning standard for every recorded KRYOS day. The original assessments
  // remain archived in the Personal task block for an auditable comparison.
  const start = '0001-01-01';
  const categories = {
    career:{title:'Career',cap:18}, launch:{title:'Launch',cap:18},
    foundation:{title:'Nourishment',cap:24}, care:{title:'Skincare',cap:6},
    spiritual:{title:'Spiritual practice',cap:10}, articulation:{title:'Articulation',cap:8},
    responsibility:{title:'Actions & Money',cap:16},
  };
  const catalog = [
    {id:'adhd-relief',title:'Two extra leisure sessions',cost:15,tier:'Small reward',cooldownDays:1,workToday:true,note:'After a meaningful work outcome. Ordinary rest and regulation breaks are always available.'},
    {id:'casual-time',title:'One hour of casual time with people',cost:45,tier:'Social reward',cooldownDays:7,qualifiedDaysInWindow:3,windowDays:7,note:'Three qualified days in the latest seven.'},
    {id:'movie',title:'Movie night',cost:90,tier:'Medium reward',cooldownDays:7,qualifiedDaysInWindow:5,windowDays:7,note:'One movie. Five qualified days in the latest seven.'},
    {id:'initiated-call',title:'One initiated call',cost:100,tier:'Weekly connection',cooldownDays:7,qualifiedDaysInWindow:5,windowDays:7,note:'Five qualified days in the latest seven. Incoming calls remain ordinary breaks.'},
  ];
  const shift=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
  const week=date=>shift(date,-((new Date(date+'T12:00:00Z').getUTCDay()+6)%7));
  const list=value=>Array.isArray(value)?value:[];
  const dayOf=e=>e.date||String(e.completedAt||'').slice(0,10);
  function dates(tasks,career,today) {
    const life=tasks.life||{};
    return [...new Set([
      ...list(tasks.rhythm?.events),...list(tasks.launch?.marketEvents),...list(tasks.launch?.mockSessions),
      ...list(tasks.money?.contacts),...list(tasks.money?.payments),...list(tasks.money?.ledgerEvents),
      ...list(life.actions),...list(life.records),...list(life.innerCommand?.containmentDays),
      ...list(life.dailyAssessments),...list(career.activityLog),
    ].map(dayOf).filter(d=>d>=start&&d<=today))].sort();
  }
  function evaluate(date,tasks={},career={}) {
    const life=tasks.life||{},rhythm=list(tasks.rhythm?.events);
    const records=list(life.records).filter(e=>e.date===date&&e.completed===true&&e.kind==='activity');
    const recordText=e=>String(e.title||'').toLowerCase();
    const named=(domain,pattern)=>records.some(e=>e.domain===domain&&pattern.test(recordText(e)));
    const buckets=Object.fromEntries(Object.keys(categories).map(k=>[k,[]]));
    const scores=Object.fromEntries(Object.keys(categories).map(k=>[k,0]));
    const seen=new Set();
    const add=(lane,id,title,source,points)=>{
      if(!id||seen.has(id))return;
      seen.add(id);
      const earned=Math.max(0,Math.min(points,categories[lane].cap-scores[lane]));
      if(!earned)return;
      scores[lane]+=earned;buckets[lane].push({id,title,source,points:earned});
    };
    const value=id=>Math.max(0,Number(rhythm.find(e=>e.date===date&&e.habitId===id)?.value)||0);
    const meals=['breakfast','lunch','dinner'].filter(id=>value(id)>0||named('Food',new RegExp('\\b'+id+'\\b'))).length;
    if(meals>=2)add('foundation','meals:'+date,'Two meals','Rhythm',6);
    if(value('protein')||named('Food',/protein\s*(shake|drink)/))add('foundation','protein:'+date,'Protein routine','Rhythm',6);
    if(value('supplements')||records.some(e=>e.domain==='Supplements'))add('foundation','supplements:'+date,'Supplement routine','Rhythm',4);
    const waterTarget=Math.max(.5,Number(tasks.rhythm?.settings?.waterTarget)||3);
    if(value('water')>=waterTarget)add('foundation','water:'+date,waterTarget+' L water','Rhythm',8);
    const skincarePatterns={'face-wash':/face\s*wash/,'moisturizer':/moisturiz|moisturis|\bcream\b/,'serum':/face\s*serum|(?<!eye\s)serum/,'eye-cream':/eye\s*(serum|cream)/,'sunscreen':/sun\s*screen|sunscreen/};
    const skincare=Object.keys(skincarePatterns).filter(id=>value(id)>0||named('Skincare',skincarePatterns[id])).length;
    if(skincare>=2)add('care','care:'+date,'Two skincare steps','Rhythm',6);
    const spiritPatterns={'pranayama':/pranayama|nadi\s*shodhana/,'meditation':/meditat/,'nama-japa':/nama\s*japa|naam\s*jap/,'gita':/bhagavad\s*gita|\bgita\b/,'aditya':/aditya\s*hridayam/,'chalisa':/hanuman\s*chalisa/};
    const spirits=Object.keys(spiritPatterns).filter(id=>{
      if(value(id)>=(['aditya','chalisa'].includes(id)?3:1))return true;
      return records.some(e=>e.domain==='Spiritual practice'&&spiritPatterns[id].test(recordText(e))&&(!['aditya','chalisa'].includes(id)||/\b(?:3|three)\s*(?:times|rounds|x)?\b/i.test(recordText(e))));
    }).length;
    if(spirits>=2)add('spiritual','spirit:'+date,spirits+' completed spiritual practices','Rhythm',spirits===2?6:spirits===3?8:10);

    // Only current completed checks count; repeated toggles and parent summaries cannot duplicate them.
    const checkMap=new Map();
    list(career.roadmaps).forEach(r=>list(r.modules).forEach(m=>list(m.topics).forEach(t=>list(t.checklist).forEach(c=>checkMap.set(`${r.id}:${c.id}`,c)))));
    const firstChecks=new Map();
    list(career.activityLog).slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>{
      if(!e.checkId||e.eventType==='module-complete'||e.eventType==='topic-complete')return;
      const key=`${e.roadmapId}:${e.checkId}`;
      if(!firstChecks.has(key))firstChecks.set(key,e);
    });
    const completedChecks=[...firstChecks].filter(([key,e])=>e.date===date&&checkMap.get(key)?.done===true);
    completedChecks.forEach(([key,e])=>add('career','career:'+key,e.checkText||'Completed supporting step','Career',6));
    const careerTitles=new Set(completedChecks.map(([,e])=>String(e.checkText||'').trim().toLowerCase()));
    records.filter(e=>e.domain==='Career'&&!e.actionRef&&!String(e.sourceRef||'').startsWith('career:')&&!/articulat|mock\s*interview|speaking\s*practice/i.test(recordText(e))).forEach(e=>{
      const title=recordText(e).trim();if(careerTitles.has(title))return;careerTitles.add(title);
      add('career',e.sourceRef||'career-record:'+e.id,e.title||'Completed Career evidence','Journal evidence',6);
    });
    const marketSeen=new Set();
    list(tasks.launch?.marketEvents).slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>{
      const note=String(e.note||'').trim();
      const identity=[e.type,e.company,e.role,e.person,e.url,note].map(v=>String(v||'').trim().toLowerCase()).join('|');
      if(marketSeen.has(identity))return;marketSeen.add(identity);
      if(e.date!==date||!note)return;
      const points=e.type==='application'&&e.company&&e.role?12:
        ['message','followup','referral','conversation'].includes(e.type)&&(e.person||e.company)?12:
        e.type==='post'&&e.status==='published'&&e.url?12:e.type==='connection'&&e.person?6:0;
      if(points)add('launch','launch:'+e.id,e.topic||e.note,'Launch',points);
    });
    const mocks=list(tasks.launch?.mockSessions).filter(e=>e.date===date&&(e.completed===true||Number(e.minutes)>0));
    const articulation=records.filter(e=>e.domain==='Career'&&/articulat|mock\s*interview|speaking\s*practice/i.test(recordText(e)));
    const level=mocks.some(e=>(e.level==='large'||e.serious===true)&&e.completed===true)||articulation.some(e=>/serious\s*mock|full\s*mock/i.test(recordText(e)))?'large':mocks.some(e=>Number(e.minutes)>=10||e.level==='medium'&&e.completed===true)||articulation.some(e=>Number(e.minutes)>=10)?'medium':mocks.length||articulation.length?'small':'';
    if(level)add('articulation','articulation:'+date,level+' articulation','Launch',{small:2,medium:5,large:8}[level]);

    const contacts=list(tasks.money?.contacts).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.createdAt).localeCompare(String(b.createdAt)));
    let previous=null,moneyQualified=false;
    for(const e of contacts){
      if(e.date>date)continue;
      const due=previous?.nextFollowUp|| (previous?shift(previous.date,Math.max(1,Number(tasks.money?.responsibility?.followUpDays)||2)):e.date);
      if(e.date===date&&e.date>=due&&['call','phone','message','text','email','in-person','in person','whatsapp'].includes(String(e.method||'').toLowerCase())&&e.outcome){
        add('responsibility','money-contact:'+e.id,'Due follow-up attempt','Money',6);
        if(String(e.note||'').trim()&&e.nextFollowUp){add('responsibility','money-result:'+e.id,'Outcome and next follow-up recorded','Money',2);moneyQualified=true;}
      }
      previous=e;
    }
    const payment=list(tasks.money?.ledgerEvents).find(e=>e.date===date&&e.type==='card-payment'&&e.funder==='own'&&Number(e.amountCents)>0&&!e.voidedAt);
    if(payment)add('responsibility','debt:'+date,'Recorded card payment completed','Money',4);
    const receipt=list(tasks.money?.payments).find(e=>e.date===date&&Number(e.amountCents)>0);
    if(receipt)add('responsibility','receipt:'+receipt.id,'Received payment reconciled','Money',2);
    const actions=list(life.actions).filter(e=>e.status==='done'&&dayOf(e)===date&&['important','critical'].includes(e.priority));
    let onTimeBonus=false;
    const actionTitles=new Set();
    actions.forEach(e=>{
      if(e.sourceRef?.startsWith('money:')||e.sourceRef?.startsWith('money-contact:'))return;
      const title=String(e.title||'').trim().toLowerCase();if(actionTitles.has(title))return;actionTitles.add(title);
      add('responsibility','action:'+(e.externalId||e.id),e.title,'Actions',e.priority==='critical'?3:2);
      if(!onTimeBonus&&e.deadline&&date<=e.deadline){add('responsibility','on-time:'+date,'On-time responsibility','Actions',1);onTimeBonus=true;}
    });
    list(life.records).filter(e=>e.date===date&&e.completed===true&&e.kind==='activity'&&['important','critical'].includes(e.importance)&&String(e.sourceRef||'').startsWith('evidence:')).forEach(e=>{
      if(e.actionRef||e.moneyRef)return;
      add('responsibility',e.sourceRef,e.title,'Journal evidence',e.importance==='critical'?3:2);
    });
    const containment=list(life.innerCommand?.containmentDays).find(e=>e.date===date);
    const boundaries=new Set([...(containment?.boundaries||[]),containment?.boundary].filter(Boolean));
    const deduction=Math.min(6,boundaries.size*2);
    const gross=Object.values(scores).reduce((a,b)=>a+b,0),total=Math.max(0,gross-deduction);
    const recovery=String(containment?.recoveryNote||'').trim();
    const gates={work:scores.career>=12||scores.launch>=12||moneyQualified,foundation:scores.foundation===24,care:skincare>=2,spiritual:spirits>=2,articulation:!!level,containment:!!containment&&(boundaries.size?!!recovery:containment.status==='kept')};
    const qualified=Object.values(gates).every(Boolean);
    return {date,ruleVersion:4,buckets,scores,gross,deduction,total,qualified,gates,credits:Math.floor(total/5),remainder:total%5,level,workspaces:[...new Set(Object.values(buckets).flat().map(e=>e.source))]};
  }
  function bonuses(assessments,tasks,today) {
    const rows=assessments.filter(a=>a.ruleVersion===4&&a.date<=today),awards=[];
    const weeks=[...new Set(rows.map(a=>week(a.date)))];
    for(const key of weeks){
      const period=rows.filter(a=>week(a.date)===key);
      if(period.filter(a=>a.scores.career>=12).length>=5)awards.push({id:'v4-career:'+key,amount:4});
      if(period.filter(a=>a.scores.launch>=12&&new Date(a.date+'T12:00:00Z').getUTCDay()%6!==0).length>=4)awards.push({id:'v4-launch:'+key,amount:4});
      if(period.filter(a=>a.scores.articulation>=5).length>=3&&period.some(a=>a.level==='large'))awards.push({id:'v4-articulation:'+key,amount:4});
    }
    const events=list(tasks.rhythm?.events).filter(e=>e.date<=today&&Number(e.value)>0).sort((a,b)=>a.date.localeCompare(b.date));
    for(const id of ['exercise','hair-care','groceries']){
      const accepted=[];
      for(const e of events.filter(e=>e.habitId===id)){
        if(accepted.includes(e.date))continue;
        const recent=accepted.filter(d=>d>=shift(e.date,-6));
        if(recent.length>=(id==='exercise'?2:1))continue;
        accepted.push(e.date);
        if(e.date>=start)awards.push({id:'v4-maintenance:'+id+':'+e.date,amount:id==='groceries'?3:2});
      }
    }
    return awards;
  }
  root.KryosRewardV4={start,categories,catalog,shift,week,dates,evaluate,bonuses};
})(globalThis);
