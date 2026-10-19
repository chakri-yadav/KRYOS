import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const app=read('app.js'),version=app.match(/const APP_VERSION = "([0-9]+\.[0-9]+\.[0-9]+)"/)?.[1];
if(!version)throw Error('Application version missing.');
const failures=[];
const policy=read('VERSION.md').match(/Canonical current version:\s*```text\s*([0-9.]+)\s*```/)?.[1];
if(policy!==version)failures.push('VERSION.md differs from app.js');
if(!read('README.md').includes('**'+version+'**'))failures.push('README.md omits current version');
if(!new RegExp('^## '+version.replaceAll('.','\\.')+'(?: |$)','m').test(read('CHANGELOG.md')))failures.push('CHANGELOG.md omits current release');
if(!existsSync('docs/releases/'+version+'.md'))failures.push('Current release note missing');
if(/currently\s+`v[0-9.]+`/.test(read('VERSION.md')))failures.push('Hardcoded current tag example is stale-prone');
const pages=['Inner Command','Career','Actions','Rhythm','Launch','Marketing','Money','Progress','Rewards','Settings'];
const ownership=read('docs/design/page-ownership.md');
for(const page of pages)if(!ownership.includes('| '+page))failures.push('Page owner missing: '+page);
if(!existsSync('docs/architecture/current-runtime.md'))failures.push('Current runtime contract missing');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log('Release contract passed for '+version+': version references, release note and current page ownership.');
