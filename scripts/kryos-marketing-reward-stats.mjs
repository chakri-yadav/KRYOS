/* Read-only local export. This program cannot send resumes or job descriptions. */
import {DatabaseSync} from 'node:sqlite';
import {join} from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import submissions from '../marketing-submissions.js';
const args=process.argv.slice(2),arg=k=>args[args.indexOf(k)+1];
if(!args.includes('--date')||!submissions.validDate(arg('--date')))throw Error('Use --date YYYY-MM-DD for the behavior day.');
const date=arg('--date');
const db=new DatabaseSync(join(process.env.KRYOS_LOCAL_DATA_DIR||join(process.env.LOCALAPPDATA,'KRYOS','Marketing-OneDrive'),'marketing.sqlite'),{readOnly:true});
const row=db.prepare('select state_json,revision from workspace where id=1').get();if(!row)throw Error('Local Marketing workspace unavailable.');
const state=JSON.parse(row.state_json);
const submittedCount=submissions.countSubmissions(submissions.projectLegacySubmissions(state),date);
db.close();
const summary={date,workspaceId:'marketing-onedrive',revision:Number(row.revision),submittedCount};
const hash=createHash('sha256').update(JSON.stringify(summary)).digest('hex').slice(0,24);
const raw='Local Marketing snapshot for '+date+': '+submittedCount+' submitted applications, source revision '+row.revision+'.';
const request={schema_version:1,idempotency_key:'marketing-stats-'+hash,local_date:date,timezone:'America/Chicago',raw_text:raw,operations:[{type:'marketing.stats.import',summary,evidence_quote:raw}]};
const output=args.includes('--output-dir')?arg('--output-dir'):null;
if(output){if(!/(^|[\\/])\.private([\\/]|$)/.test(output))throw Error('Output must be in an ignored .private directory.');mkdirSync(output,{recursive:true});writeFileSync(join(output,'marketing-stats-request.json'),JSON.stringify(request,null,2));const payload=JSON.stringify(summary).replaceAll("'","''");writeFileSync(join(output,'marketing-stats-import.sql'),"select public.kryos_import_marketing_stats((select id from public.kryos_profiles where profile_type='personal'),'"+request.idempotency_key+"','"+payload+"'::jsonb);\n");}
console.log(JSON.stringify(request));
