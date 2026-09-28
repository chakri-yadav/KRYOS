// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';
import '../../../reward-rules-v4.js';
const rules=globalThis.KryosRewardV4;
const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
const reply=(status,body)=>Response.json(body,{status,headers});
function legacyAwards(rows,today){
  const unique=[...new Map(rows.filter(a=>a.date<rules.start&&a.date<=today).map(a=>[a.date,a])).values()].sort((a,b)=>a.date.localeCompare(b.date));
  const awards=unique.map(a=>({id:'day:'+a.date,amount:!a.qualified?0:a.ruleVersion===3?Math.min(100,Math.max(0,Number(a.total)||0)):a.ruleVersion===2?(a.total>=9?3:a.total>=7?2:a.total>=5?1:0):(a.total>=9?2:a.total>=7?1:0)}));
  const old=new Map();
  unique.filter(a=>a.qualified&&a.ruleVersion!==3).forEach(a=>{const k=rules.week(a.date),r=old.get(k)||{days:0,modern:false};r.days++;r.modern ||= a.ruleVersion===2;old.set(k,r);});
  old.forEach((r,k)=>awards.push({id:'week:'+k,amount:r.modern?(r.days>=5?2:0):(r.days>=7?5:r.days===6?3:r.days===5?2:0)}));
  for(const [id,lane,target,credits,min] of [['career','career',5,8,1],['articulation','articulation',3,4,6]]){
    let pool=[];
    unique.filter(a=>a.qualified&&a.ruleVersion===3).forEach(a=>{pool=pool.filter(r=>r.date>=rules.shift(a.date,-6));if(Number(a.scores?.[lane])>=min)pool.push(a);if(pool.length>=target&&(id!=='articulation'||pool.some(r=>r.scores.articulation>=10))){awards.push({id:'week:'+id+':'+a.date,amount:credits});pool=[];}});
  }
  const launch=new Map();unique.filter(a=>a.qualified&&a.ruleVersion===3&&a.scores?.launch>0&&new Date(a.date+'T12:00:00Z').getUTCDay()%6!==0).forEach(a=>launch.set(rules.week(a.date),(launch.get(rules.week(a.date))||0)+1));
  launch.forEach((n,k)=>{if(n>=4)awards.push({id:'week:launch:'+k,amount:8});});
  return awards;
}
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{headers});
  if(req.method!=='POST')return reply(405,{error:'Use POST.'});
  try{
    const token=req.headers.get('authorization')?.replace(/^Bearer /,'');
    if(!token)return reply(401,{error:'Sign in to sync rewards.'});
    const body=await req.json();let profileId;
    if(token.startsWith('kryos_')){
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))].map(b=>b.toString(16).padStart(2,'0')).join('');
      const {data}=await admin.from('kryos_assistant_credentials').select('profile_id,revoked_at,expires_at').eq('token_hash',hash).maybeSingle();
      if(!data||data.revoked_at||data.expires_at&&data.expires_at<=new Date().toISOString())return reply(401,{error:'Assistant access unavailable.'});
      profileId=data.profile_id;
      if(body.request)return reply(403,{error:'Redeem from the signed-in app.'});
    }else{
      const {data,error}=await admin.auth.getUser(token);
      if(error||!data.user)return reply(401,{error:'Sign in to sync rewards.'});
      const {data:profile}=await admin.from('kryos_profiles').select('id').eq('id',body.profile).eq('user_id',data.user.id).maybeSingle();
      if(!profile)return reply(403,{error:'Profile unavailable.'});profileId=profile.id;
    }
    // Operating days begin at 07:00 in the owner's timezone, including DST.
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
    let today=`${parts.year}-${parts.month}-${parts.day}`;if(Number(parts.hour)<7)today=rules.shift(today,-1);
    if(body.request&&(!/^[A-Za-z0-9_-]{1,100}$/.test(body.request.id)||!rules.catalog.some(r=>r.id===body.request.rewardId)))return reply(400,{error:'Invalid reward request.'});
    for(let attempt=0;attempt<3;attempt++){
      const {data:blocks,error}=await admin.from('kryos_sync_blocks').select('block_key,payload,revision').eq('profile_id',profileId).in('block_key',['tasks','career']);
      if(error)throw error;
      const taskBlock=blocks.find(b=>b.block_key==='tasks'),careerBlock=blocks.find(b=>b.block_key==='career');
      if(!taskBlock||!careerBlock)return reply(409,{error:'Sync your app records first.'});
      const tasks=taskBlock.payload,career=careerBlock.payload;
      const assessments=rules.dates(tasks,career,today).map(date=>rules.evaluate(date,tasks,career));
      const awards=[...legacyAwards(tasks.life?.dailyAssessments||[],today),...assessments.map(a=>({id:'v4-day:'+a.date,amount:a.credits})),...rules.bonuses(assessments,tasks,today)];
      const reward=rules.catalog.find(r=>r.id===body.request?.rewardId);
      const qualified=assessments.filter(a=>a.qualified&&a.date>=rules.shift(today,-6)).length;
      const eligible=!reward||qualified>=(reward.qualifiedDaysInWindow||0)&&(!reward.workToday||rules.evaluate(today,tasks,career).gates.work);
      const {data:receipt,error:commitError}=await admin.rpc('kryos_commit_rewards_v4',{p_profile:profileId,p_tasks_revision:taskBlock.revision,p_career_revision:careerBlock.revision,p_awards:awards,p_request:body.request||null,p_eligible:eligible});
      if(commitError?.message?.includes('KRYOS_REWARD_SNAPSHOT_CHANGED'))continue;
      if(commitError)throw commitError;
      if(body.diagnostics)return reply(200,{accepted:true,ruleVersion:4,effectiveDate:rules.start,transactionVerified:true});
      return reply(200,{...receipt,ruleVersion:4,effectiveDate:rules.start,qualifiedDays:qualified});
    }
    return reply(409,{error:'Records changed during calculation. Please retry.'});
  }catch(error){console.error('Reward transaction failed',error?.code||'unknown');return reply(500,{error:'Reward calculation could not finish. Your records are safe; retry sync.'});}
});
