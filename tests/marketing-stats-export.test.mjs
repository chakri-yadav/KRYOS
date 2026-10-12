import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('local statistics omit all job fields, attachments and demo rows',()=>{
 const dir=mkdtempSync(join(tmpdir(),'kryos-stats-test-'));
 try{
  const db=new DatabaseSync(join(dir,'marketing.sqlite'));db.exec('create table workspace(id integer,state_json text,revision integer)');
  const roles=[{id:'one',company:'Fixture company',raw_description:'Private description',source_url:'https://fixture.invalid/one',application:{status:'Applied',applied_date:'2026-10-11',contact_email:'private@example.invalid',attachments:[{path:'never-read.docx'}]}},{id:'duplicate',source_url:'https://fixture.invalid/one',application:{status:'Interview',applied_date:'2026-10-11'}},{id:'demo-fixture',application:{status:'Applied',applied_date:'2026-10-11'}},{id:'not-applied',application:{status:'Saved',applied_date:'2026-10-11'}}];
  db.prepare('insert into workspace values(1,?,7)').run(JSON.stringify({batches:[{roles}]}));db.close();
  const result=spawnSync(process.execPath,['scripts/kryos-marketing-reward-stats.mjs','--date','2026-10-11'],{encoding:'utf8',env:{...process.env,KRYOS_LOCAL_DATA_DIR:dir}});
  assert.equal(result.status,0,result.stderr);const request=JSON.parse(result.stdout),s=request.operations[0].summary;
  assert.equal(s.submittedCount,1);assert.equal(s.revision,7);assert.deepEqual(Object.keys(s).sort(),['date','revision','submittedCount','workspaceId']);
  assert.doesNotMatch(result.stdout,/Fixture company|Private description|private@example|never-read|fixture.invalid/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
