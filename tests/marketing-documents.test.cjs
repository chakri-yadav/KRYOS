const test=require('node:test'),assert=require('node:assert/strict'),D=require('../marketing-documents.js');
const role={id:'job',application:{attachments:[{id:'old',category:'Résumé',name:'resume.pdf',savedAt:'2026-10-18',resumeVersion:'v1'},{id:'new',category:'Résumé',name:'resume.pdf',savedAt:'2026-10-19',resumeVersion:'v2'}]}};
test('submitted resume is an explicit reference, never the latest upload or an inferred legacy label',()=>{
 const before=JSON.stringify(role),facts=[{jobId:'job',submissionId:'s',appliedDate:'2026-10-18',submittedDocumentIds:['old']}],m=D.project(role,facts);
 assert.equal(m.preferred.id,'old');assert.equal(m.documents[1].submitted,false);assert.equal(D.project(role,[]).preferred,null);assert.equal(D.project(role,[]).unconfirmed,true);assert.equal(JSON.stringify(role),before);
 const deleted=structuredClone(role);deleted.application.attachments[0].deletedAt='2026-10-19';assert.equal(D.project(deleted,facts).preferred,null);assert.equal(D.project({id:'job',application:{attachments:[]}},facts).missing[0],'old');
});
test('reapplication uses its explicit document; voided facts do not designate a resume',()=>{
 const facts=[{jobId:'job',submissionId:'s1',appliedDate:'2026-10-18',submittedDocumentIds:['old']},{jobId:'job',submissionId:'s2',appliedDate:'2026-10-19',submittedDocumentIds:['new']}];
 assert.equal(D.project(role,facts).preferred.id,'new');facts[1].voided=true;assert.equal(D.project(role,facts).preferred.id,'old');
});
test('concurrent metadata retains independent versions and rejects conflicting edits to the same version',()=>{
 const base=[{id:'a',name:'resume.pdf'}],local=[...base,{id:'b',name:'resume.pdf'}],remote=[...base,{id:'c',name:'resume.pdf'}];
 assert.deepEqual(D.merge(base,local,remote).map(d=>d.id),['a','c','b']);
 assert.throws(()=>D.merge(base,[{id:'a',name:'changed.pdf'}],[{id:'a',deletedAt:'today'}]),/changed in another window/);
 assert.deepEqual(D.merge(base,[],remote),remote);
});
