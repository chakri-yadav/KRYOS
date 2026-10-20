import {existsSync,readFileSync,lstatSync,readdirSync,mkdtempSync,cpSync,renameSync,rmSync} from 'node:fs';
import {resolve,join,dirname,sep,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';
const within=(parent,child)=>{if(process.platform==='win32'){parent=parent.toLowerCase();child=child.toLowerCase();}return child===parent||child.startsWith(parent+sep);};
function regularTree(root){for(const name of readdirSync(root)){const p=join(root,name),s=lstatSync(p);if(s.isSymbolicLink())throw Error('Backup contains a symbolic link.');if(s.isDirectory())regularTree(p);else if(!s.isFile())throw Error('Backup contains an unsupported file.');}}
export function verifyLocalBackup(source){
 const root=resolve(source);if(!existsSync(root)||lstatSync(root).isSymbolicLink())throw Error('Choose a regular backup directory.');regularTree(root);
 const manifest=JSON.parse(readFileSync(join(root,'manifest.json'),'utf8'));
 if(manifest.schemaVersion!==2||manifest.database!=='marketing.sqlite'||!Number.isSafeInteger(manifest.revision))throw Error('Unsupported or incomplete backup manifest.');
 if(manifest.files&&!existsSync(join(root,'files')))throw Error('Backup files directory is missing.');
 const db=new DatabaseSync(join(root,'marketing.sqlite'),{readOnly:true});
 try{
  if(db.prepare('PRAGMA quick_check').get().quick_check!=='ok')throw Error('Backup database integrity check failed.');
  const workspace=db.prepare('SELECT revision,state_json FROM workspace WHERE id=1').get();
  if(!workspace||workspace.revision!==manifest.revision)throw Error('Backup revision does not match its manifest.');
  const state=JSON.parse(workspace.state_json);if(!Array.isArray(state.batches))throw Error('Backup workspace structure is incomplete.');const roles=state.batches.flatMap(b=>b.roles||[]);let documentsVerified=0,deletedReferences=0;
  for(const doc of db.prepare('SELECT * FROM documents').all()){
   const file=resolve(root,'files',doc.relative_path);if(!within(resolve(root,'files'),file))throw Error('Document path escapes the backup.');
   if(!existsSync(file)){const role=roles.find(r=>String(r.id)===String(doc.job_id)),attachment=role?.application?.attachments?.find(a=>a.id===doc.id||a.localDocumentId===doc.id);if(!role&&!db.prepare('SELECT id FROM jobs WHERE id=?').get(doc.job_id)||attachment?.deletedAt){deletedReferences++;continue;}throw Error('A live document is missing from the backup.');}
   const bytes=readFileSync(file);if(bytes.length!==doc.size||createHash('sha256').update(bytes).digest('hex')!==doc.sha256)throw Error('A document failed size/hash verification.');documentsVerified++;
  }
  return {revision:manifest.revision,documentsVerified,deletedReferences};
 }finally{db.close();}
}
export function restoreLocalBackup({source,destination}){
 const origin=resolve(source),target=resolve(destination),parent=dirname(target),live=resolve(process.env.KRYOS_LOCAL_DATA_DIR||join(process.env.LOCALAPPDATA||process.cwd(),'KRYOS','Marketing-OneDrive'));
 if(within(live,target)||within(target,live)||within(origin,target)||within(target,origin)||target===parent)throw Error('Restore must use a separate new directory, never the active data location or backup tree.');
 if(existsSync(target))throw Error('Restore destination already exists. Nothing was overwritten.');
 const receipt=verifyLocalBackup(origin);let staging;
 try{
  staging=mkdtempSync(join(parent,'.kryos-restore-'));cpSync(origin,staging,{recursive:true,errorOnExist:true,force:false});verifyLocalBackup(staging);
  if(existsSync(target))throw Error('Restore destination appeared during verification. Nothing was overwritten.');
  renameSync(staging,target);staging=null;
  return {accepted:true,destination:target,...receipt};
 }finally{if(staging&&dirname(resolve(staging))===parent&&basename(staging).startsWith('.kryos-restore-'))rmSync(staging,{recursive:true,force:true});}
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 try{const args=process.argv.slice(2);if(args.length!==4||args[0]!=='--source'||args[2]!=='--destination')throw Error('Use --source backup-directory --destination new-directory.');console.log(JSON.stringify(restoreLocalBackup({source:args[1],destination:args[3]})));}catch(error){console.error(error.message);process.exitCode=1;}
}
