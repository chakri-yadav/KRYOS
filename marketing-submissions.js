/* Pure legacy submission projection shared by browser views and count export. */
(function(root){
 const statuses=new Set(['Applied','Interview','Follow-up','Offer','Not selected','Rejected','Accepted','Archived']);
 const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
 const synthetic=(batch,role)=>!!(batch.demo||role.demo||role.is_test||String(role.id||'').startsWith('demo-')||/FICTIONAL SAMPLE|SYNTHETIC TEST/i.test(role.raw_description||''));
 const identity=role=>String(role.canonical_url||role.source_url||role.id||'').trim().toLowerCase();
 function projectLegacyOnly(state){
  const groups=new Map(),jobs=new Map(),jobIds=new Set(),diagnostics=[];
  const rank=r=>[String(r.updated_at||r.updatedAt||'0000'),String(r.id||''),JSON.stringify(r)].join('|');
  for(const batch of state?.batches||[])for(const role of batch.roles||[]){
   if(synthetic(batch,role))continue;
   const key=identity(role);if(!key){diagnostics.push({reason:'missing-identity'});continue;}
   if(role.id)jobIds.add(role.id);
   if(!jobs.has(key)||rank(role)>rank(jobs.get(key)))jobs.set(key,role);
   const date=role.application?.applied_date;
   if(!validDate(date)||!statuses.has(role.application?.status)){
    if(validDate(date))diagnostics.push({reason:'date-without-submission-status',jobId:role.id,date});
    continue;
   }
   const groupKey=date+'|'+key,old=groups.get(groupKey);
   if(!old)groups.set(groupKey,{date,identity:key,role,sourceIds:[role.id].filter(Boolean)});
   else {if(role.id&&!old.sourceIds.includes(role.id))old.sourceIds.push(role.id);if(rank(role)>rank(old.role))old.role=role;}
  }
  const records=[...groups.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.identity.localeCompare(b.identity));
  const byDate=new Map(),datesByIdentity=new Map();
  for(const r of records){byDate.set(r.date,(byDate.get(r.date)||0)+1);const dates=datesByIdentity.get(r.identity)||[];dates.push(r.date);datesByIdentity.set(r.identity,dates);}
  for(const [key,dates] of datesByIdentity)if(dates.length>1)diagnostics.push({reason:'multiple-legacy-dates',identity:key,dates});
  return {byDate,records,roles:[...jobs.values()],jobIds,diagnostics};
 }
 const countSubmissions=(p,from,through=from)=>p.records.filter(r=>r.date>=from&&r.date<=through).length;
 function projectLegacySubmissions(state){
  if(state?.submission_history?.version!==1)return projectLegacyOnly(state);
  const history=root.KryosSubmissionHistory||(typeof module==='object'&&module.exports?require('./marketing-submission-history.js'):null);
  if(!history)throw Error('Submission history reader unavailable.');
  return history.project(state);
 }
 const api={projectLegacySubmissions,projectLegacyOnly,countSubmissions,validDate,isSynthetic:synthetic};
 root.KryosSubmissions=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
