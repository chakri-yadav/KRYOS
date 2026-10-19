const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const api=require('../marketing-submissions.js');
test('statistics exporter uses the same projection and emits only aggregate fields',t=>{
 const {DatabaseSync}=require('node:sqlite'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kryos-count-parity-'));
 try{
 const db=new DatabaseSync(path.join(dir,'marketing.sqlite'));
 db.exec('CREATE TABLE workspace(id INTEGER PRIMARY KEY,state_json TEXT,revision INTEGER)');
 db.prepare('INSERT INTO workspace VALUES(1,?,7)').run(JSON.stringify(fixture));db.close();
 const result=JSON.parse(cp.execFileSync(process.execPath,['scripts/kryos-marketing-reward-stats.mjs','--date','2026-10-19'],{env:{...process.env,KRYOS_LOCAL_DATA_DIR:dir},encoding:'utf8',stdio:['ignore','pipe','ignore']}));
 const summary=result.operations[0].summary;
 assert.deepEqual(Object.keys(summary).sort(),['date','revision','submittedCount','workspaceId']);
 assert.equal(summary.submittedCount,api.countSubmissions(api.projectLegacySubmissions(fixture),'2026-10-19'));
 assert.throws(()=>cp.execFileSync(process.execPath,['scripts/kryos-marketing-reward-stats.mjs','--date','2026-02-30'],{env:{...process.env,KRYOS_LOCAL_DATA_DIR:dir},stdio:'ignore'}));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
const fixture={batches:[{roles:[
{id:'saved',application:{status:'Saved',applied_date:'2026-10-19'}},
{id:'demo-test',is_test:true,application:{status:'Applied',applied_date:'2026-10-19'}},
{id:'old',source_url:'https://example.invalid/a',application:{status:'Applied',applied_date:'2026-10-18'}},
{id:'new',canonical_url:'https://example.invalid/a',application:{status:'Interview',applied_date:'2026-10-19'}},
{id:'dupe',source_url:'https://example.invalid/a',application:{status:'Applied',applied_date:'2026-10-19'}},
{application:{status:'Applied',applied_date:'2026-10-19'}},
{id:'bad-date',application:{status:'Applied',applied_date:'2026-02-30'}}
]}]};
test('legacy projection keeps dated compatibility, excludes tests and reports ambiguity without mutation',()=>{
 const before=JSON.stringify(fixture),p=api.projectLegacySubmissions(fixture);
 assert.deepEqual([...p.byDate],[['2026-10-18',1],['2026-10-19',1]]);
 assert.equal(p.diagnostics.filter(d=>d.reason==='multiple-legacy-dates').length,1);
 assert.equal(p.diagnostics.filter(d=>d.reason==='date-without-submission-status').length,1);
 assert.equal(p.diagnostics.filter(d=>d.reason==='missing-identity').length,1);
 assert.equal(JSON.stringify(fixture),before);
 assert.equal(api.countSubmissions(p,'2026-10-20'),0);
});
test('projection is independent of duplicate record order and canonical identity wins',()=>{
 const a=api.projectLegacySubmissions(fixture),b=api.projectLegacySubmissions({batches:[{roles:[...fixture.batches[0].roles].reverse()}]});
 assert.deepEqual(a.records.map(r=>[r.date,r.role.id]),b.records.map(r=>[r.date,r.role.id]));
 assert.equal(a.records[1].sourceIds.length,2);
});
test('shared evidence agrees with projection and corrected zero',()=>{
 const c=vm.createContext({});vm.runInContext(fs.readFileSync('marketing-submissions.js','utf8')+fs.readFileSync('marketing-evidence.js','utf8'),c);
 assert.deepEqual(JSON.parse(JSON.stringify(c.marketingEvidenceLocalRows(fixture,9))).map(r=>[r.date,r.submittedCount]),[...api.projectLegacySubmissions(fixture).byDate]);
 assert.equal(c.marketingEvidenceLocalRows({batches:[]},10).length,0);
});
test('all synthetic markers and missing identities are excluded',()=>{
 const roles=[{id:'demo-a'},{id:'b',demo:true},{id:'c',is_test:true},{id:'d',raw_description:'SYNTHETIC TEST'},{id:'e',raw_description:'FICTIONAL SAMPLE'},{}].map(r=>({...r,application:{status:'Applied',applied_date:'2026-10-19'}}));
 assert.equal(api.projectLegacySubmissions({batches:[{roles}]}).records.length,0);
 assert.equal(api.validDate('2026-02-30'),false);
});
