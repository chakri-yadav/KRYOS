import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const prohibitedBrand=String.fromCharCode(99,111,100,101,120);
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function checkText(text,extraTerms=[]){
 const rules=[
  ['tooling-brand',new RegExp('\\b'+escape(prohibitedBrand)+'\\b','i')],
  ['user-home-path',/[a-z]:[\\/]Users[\\/]|[\\/]Users[\\/][a-z][a-z0-9._-]+[\\/]|[\\/]home[\\/][a-z][a-z0-9._-]+[\\/]/i],
  ...extraTerms.map(term=>['private-vocabulary',new RegExp('\\b'+escape(term)+'\\b','i')])
 ];
 return rules.filter(([,pattern])=>pattern.test(text)).map(([category])=>category);
}
export function scanPublicFiles({cwd=process.cwd(),terms=[]}={}){
 const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd,encoding:'utf8'}).split('\0').filter(Boolean);
 const findings=[];
 for(const file of [...new Set(files)]){
  let bytes;try{bytes=readFileSync(resolve(cwd,file));}catch(error){if(error.code==='ENOENT')continue;throw error;}
  const categories=new Set(checkText(file,terms));
  if(!bytes.includes(0))for(const category of checkText(bytes.toString('utf8'),terms))categories.add(category);
  if(categories.size)findings.push({file,categories:[...categories]});
 }
 return findings;
}
function main(){
 const policy=process.env.PUBLICATION_POLICY_FILE;
 const config=policy?JSON.parse(readFileSync(policy,'utf8')):{terms:[]};
 if(!Array.isArray(config.terms)||config.terms.some(v=>typeof v!=='string'||!v.trim()))throw Error('Publication policy terms must be nonempty strings.');
 const findings=scanPublicFiles({terms:config.terms});
 if(process.argv.includes('--metadata')){
  const metadata=execFileSync('git',['log','-1','--format=%B%n%an%n%ae%n%cn%n%ce'],{encoding:'utf8'});
  const branch=execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim();
  const categories=checkText(metadata+'\n'+branch,config.terms);
  if(categories.length)findings.push({file:'latest revision metadata',categories});
 }
 if(findings.length){console.error(JSON.stringify({status:'blocked',findings},null,2));process.exitCode=1;}
 else console.log('Public surface check passed. No prohibited branding or machine paths'+(policy?' or configured private vocabulary':'')+'.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{main();}catch(error){console.error('Public surface check failed: '+error.message);process.exitCode=1;}}
