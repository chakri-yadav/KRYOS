/* Document projection and three-way metadata merge; no file or record writes. */
(function(root){
 function metadata(d){return {id:d.id,localDocumentId:d.id,category:d.category,title:d.label,name:d.file_name,type:d.mime_type,size:d.size,savedAt:d.created_at,resumeVersion:d.version||'',sha256:d.sha256};}
 function merge(base=[],local=[],remote=[]){
  const prior=new Map(base.map(d=>[String(d.id),d])),result=new Map(remote.map(d=>[String(d.id),d]));
  for(const doc of local){const id=String(doc.id),old=prior.get(id),latest=result.get(id);if(JSON.stringify(doc)===JSON.stringify(old))continue;
   if(old&&JSON.stringify(latest)!==JSON.stringify(old)&&JSON.stringify(latest)!==JSON.stringify(doc))throw Error('Document metadata changed in another window. Refresh and review before saving.');
   result.set(id,doc);
  }
  // Removal is a revision-checked document operation, not array replacement.
  return [...result.values()];
 }
 function project(role,facts=[]){
  const app=role?.application||{},all=[...(app.resume_attachment?[{...app.resume_attachment,id:'legacy',category:'Résumé',legacy:true}]:[]),...(app.attachments||[])];
  const active=facts.filter(f=>!f.voided&&(String(f.jobId)===String(role.id)||(f.sourceIds||[]).includes(role.id))).sort((a,b)=>String(a.appliedDate).localeCompare(String(b.appliedDate))||String(a.recordedAt||'').localeCompare(String(b.recordedAt||''))||String(a.submissionId).localeCompare(String(b.submissionId)));
  const latest=active.at(-1),linked=new Set((latest?.submittedDocumentIds||[]).map(String));
  const documents=all.map(d=>({...d,submitted:linked.has(String(d.id))||linked.has(String(d.localDocumentId)),submittedDates:active.filter(f=>(f.submittedDocumentIds||[]).some(id=>String(id)===String(d.id)||String(id)===String(d.localDocumentId))).map(f=>f.appliedDate)}));
  const resumes=documents.filter(d=>['résumé','resume'].includes(String(d.category||'').toLowerCase())),confirmed=resumes.filter(d=>d.submitted&&!d.deletedAt);
  const missing=[...linked].filter(id=>!documents.some(d=>String(d.id)===id||String(d.localDocumentId)===id));
  return {documents,preferred:confirmed.length===1?confirmed[0]:null,unconfirmed:!linked.size,missing,latest};
 }
 const api={metadata,merge,project};root.KryosMarketingDocuments=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
