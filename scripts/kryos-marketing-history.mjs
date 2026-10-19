/* Preview reads metadata only; migration requires explicit revision and request ID. */
import {DatabaseSync} from 'node:sqlite';
import {join} from 'node:path';
import counts from '../marketing-submissions.js';
import history from '../marketing-submission-history.js';
const args=process.argv.slice(2),arg=k=>args[args.indexOf(k)+1];
if(args.includes('--migrate')){
 const revision=Number(arg('--expected-revision')),requestId=arg('--idempotency-key');
 if(!args.includes('--expected-revision')||!Number.isSafeInteger(revision)||revision<0||!args.includes('--idempotency-key')||!requestId)throw Error('Migration requires --expected-revision and --idempotency-key.');
 const response=await fetch((process.env.KRYOS_LOCAL_URL||'http://127.0.0.1:4173')+'/api/marketing/submissions/migrate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idempotency_key:requestId,expectedRevision:revision})});
 const result=await response.json();if(!response.ok||!result.accepted)throw Error(result.error||'Migration not accepted.');
 console.log(JSON.stringify(result));
}else{
 const db=new DatabaseSync(join(process.env.KRYOS_LOCAL_DATA_DIR||join(process.env.LOCALAPPDATA,'KRYOS','Marketing-OneDrive'),'marketing.sqlite'),{readOnly:true});
 const row=db.prepare('SELECT state_json,revision FROM workspace WHERE id=1').get();db.close();if(!row)throw Error('Workspace unavailable.');
 const state=JSON.parse(row.state_json),preview=history.preview(state),before=[...counts.projectLegacySubmissions(state).byDate],copy=structuredClone(state);
 history.migrate(copy,new Date().toISOString());const after=[...counts.projectLegacySubmissions(copy).byDate];
 console.log(JSON.stringify({revision:row.revision,enabled:preview.alreadyEnabled,candidateCount:preview.candidates.length,reviewGroupCount:preview.ambiguous.length,before,after,unchangedCounts:JSON.stringify(before)===JSON.stringify(after)}));
}
