/* Explicit block-level conflict review, paired backup and guarded resolution. */
(function(root){
 const rows=value=>Array.isArray(value)?value:Object.values(value||{});
 const key=(entry,index)=>String(entry?.id||entry?.date||'row-'+index);
 const canonical=value=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
 const same=(left,right)=>canonical(left)===canonical(right);
 function compare(local={},remote={}){
  local=local||{};remote=remote||{};
  const a=local.life||local,b=remote.life||remote;
  const left=new Map(rows(a.entries).map((e,i)=>[key(e,i),e])),right=new Map(rows(b.entries).map((e,i)=>[key(e,i),e]));
  const changes=[];
  for(const id of new Set([...left.keys(),...right.keys()])){
   const l=left.get(id),r=right.get(id);
   if(same(l,r))continue;
   changes.push({id,date:l?.date||r?.date||'',kind:!r?'browser-only':!l?'cloud-only':'different',localCorrections:rows(l?.corrections).length,remoteCorrections:rows(r?.corrections).length});
  }
  const draftCount=x=>Object.values(x.drafts||{}).filter(t=>typeof t==='string'&&t.trim()).length+(typeof x.draft==='string'&&x.draft.trim()&&!Object.values(x.drafts||{}).includes(x.draft)?1:0);
  return {localEntries:left.size,remoteEntries:right.size,localDrafts:draftCount(a),remoteDrafts:draftCount(b),changedEntries:changes,recordsDiffer:!same(a.records||[],b.records||[]),draftsDiffer:!same([a.drafts||{},a.draft||''],[b.drafts||{},b.draft||''])};
 }
 async function resolve({area,direction,readLocal,readCloud,backup,writeCloud,writeLocal,checkOwner=()=>{}}){
  if(!area||!['tasks','journal'].includes(area.key)||!['browser','cloud'].includes(direction))throw Error('Choose a supported block and direction.');
  checkOwner();const remote=await readCloud(area.key);checkOwner();
  if(!remote||Number(remote.revision||0)!==area.cloudRevision||remote.payload_updated_at!==area.cloudUpdatedAt||!same(remote.payload,area.cloud))throw Error('Cloud copy changed. Compare again before choosing.');
  if(!same(readLocal(area.key),area.browser))throw Error('Browser copy changed. Compare again before choosing.');
  await backup(area);checkOwner();
  if(!same(readLocal(area.key),area.browser))throw Error('Browser copy changed while backing up. Compare again.');
  if(direction==='cloud'){
   const latest=await readCloud(area.key);checkOwner();
   if(!latest||Number(latest.revision||0)!==area.cloudRevision||latest.payload_updated_at!==area.cloudUpdatedAt||!same(latest.payload,area.cloud))throw Error('Cloud copy changed while backing up. Compare again.');
   if(!same(readLocal(area.key),area.browser))throw Error('Browser copy changed while verifying cloud. Compare again.');
   writeLocal(area.key,area.cloud);return {direction,key:area.key,revision:area.cloudRevision,updatedAt:area.cloudUpdatedAt,verified:true};
  }
  const receipt=await writeCloud(area);checkOwner();
  const verified=await readCloud(area.key);checkOwner();
  if(!verified||Number(verified.revision)!==receipt.revision||!same(verified.payload,area.browser))throw Error('Cloud write could not be verified or changed again. Both reviewed copies remain backed up. Compare again.');
  if(!same(readLocal(area.key),area.browser))throw Error('Cloud saved the reviewed browser copy, but new browser edits exist. They were preserved. Compare again.');
  return {direction,key:area.key,revision:Number(verified.revision),updatedAt:verified.payload_updated_at,verified:true};
 }
 root.KryosJournalConflict={compare,resolve,resolving:false};
 if(typeof module!=='undefined')module.exports={compare,resolve};
 if(typeof document==='undefined')return;
 let snapshot=null,snapshotOwner='',busy=false,notice='',choice=null,downloaded=false;
 const backupKey='kryos-journal-resolution-backup-v1';
 function recoveryBackup(){try{const value=JSON.parse(getModeStorageValue(backupKey)||'null');return value?.owner===syncState.userId?value:null;}catch{return null;}}
 function download(value,name){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function localBlock(key){const block=SYNC_BLOCKS.find(b=>b.key===key);return createSyncPayloadPreview().blocks[block?.payloadKey||key]?.value||{};}
 const original=renderSettingsView;
 function confirmationMarkup(){
  if(!choice)return '';
  const area=snapshot?.areas.find(a=>a.key===choice.key);if(!area)return '';
  return '<section class="journal-resolution-confirm"><h3>Confirm '+(choice.direction==='browser'?'browser → cloud':'cloud → browser')+'</h3><p><strong>'+(area.key==='tasks'?'This replaces the entire daily-records block, including Actions, Rhythm, Launch, Money and current journal records.':'This replaces the entire legacy journal block.')+'</strong> Other blocks, Marketing and Career are unchanged. No automatic merge.</p><p>'+(choice.direction==='browser'?'The reviewed browser copy will replace this block in cloud.':'The reviewed cloud copy will replace this block on this browser. Cloud is not changed.')+'</p><label><input type="checkbox" data-journal-resolution-ack> I downloaded both copies and understand which block will be replaced.</label><div class="journal-conflict-actions"><button type="button" class="primary-button" data-journal-conflict="confirm" '+(busy?'disabled':'')+'>Confirm this choice</button><button type="button" class="secondary-button" data-journal-conflict="cancel" '+(busy?'disabled':'')+'>Cancel</button></div></section>';
 }
 async function resolveChoice(){
  if(!choice||!snapshot||snapshotOwner!==syncState.userId)throw Error('Compare the current account copies first.');
  if(!downloaded||!document.querySelector('[data-journal-resolution-ack]')?.checked)throw Error('Download both copies, then acknowledge the replacement before confirming.');
  if(cloudFreshnessRunning||(typeof actionSyncRunning!=='undefined'&&actionSyncRunning))throw Error('A sync is running. Wait, then compare again.');
  const area=snapshot.areas.find(a=>a.key===choice.key),owner=snapshotOwner;
  busy=true;root.KryosJournalConflict.resolving=true;cloudFreshnessRunning=true;
  renderPanel();
  if(typeof actionSyncTimer!=='undefined')window.clearTimeout(actionSyncTimer);
  try{
   const session=await refreshSyncAuthState({silent:true});if(!session||isDemoMode()||session.user.id!==owner)throw Error('Account changed or signed out. Compare again.');
   const client=getSupabaseClient(),profile=await ensureSupabaseProfile(session);
   const readCloud=async key=>{const {data,error}=await client.from('kryos_sync_blocks').select('block_key,payload,revision,payload_updated_at,schema_version').eq('profile_id',profile).eq('block_key',key).maybeSingle();if(error)throw Error('Cloud read failed. Neither reviewed copy was discarded.');if(Number(data?.schema_version)>KRYOS_SYNC_SCHEMA_VERSION)throw Error('Cloud uses a newer data format. Update the app before resolving.');return data;};
   const receipt=await resolve({area,direction:choice.direction,readLocal:localBlock,readCloud,
    checkOwner:()=>{if(syncState.userId!==owner||isDemoMode())throw Error('Account changed. Stop and compare again.');},
    backup:async selected=>{const text=JSON.stringify({version:1,owner,createdAt:new Date().toISOString(),direction:choice.direction,area:selected});setModeStorageValue(backupKey,text);if(getModeStorageValue(backupKey)!==text)throw Error('Recovery backup could not be verified. No replacement was made.');},
    writeLocal:(key,payload)=>{applyRemoteBlock(key,JSON.parse(JSON.stringify(payload)));const block=SYNC_BLOCKS.find(b=>b.key===key);if(getModeStorageValue(block.storageKey)!==JSON.stringify(payload))throw Error('Browser save could not be verified. Recovery backup is preserved.');if(key==='tasks')taskState=loadTasks();else journalState=loadJournal();},
    writeCloud:async selected=>{
     const now=new Date().toISOString();let query=client.from('kryos_sync_blocks').update({payload:selected.browser,revision:selected.cloudRevision+1,schema_version:KRYOS_SYNC_SCHEMA_VERSION,payload_updated_at:now,client_updated_at:now,updated_at:now}).eq('profile_id',profile).eq('block_key',selected.key).eq('revision',selected.cloudRevision);
     query=selected.cloudUpdatedAt==null?query.is('payload_updated_at',null):query.eq('payload_updated_at',selected.cloudUpdatedAt);
     const {data,error}=await query.select('revision').maybeSingle();if(error||!data)throw Error('Cloud changed or the conditional write failed. No unguarded retry was made. Compare again.');
     return {revision:Number(data.revision)};
    }});
   syncState.remoteBlockVersions={...syncState.remoteBlockVersions,[receipt.key]:receipt.updatedAt};
   syncState.remoteBlockRevisions={...syncState.remoteBlockRevisions,[receipt.key]:receipt.revision};saveSyncState();
   if(receipt.key==='tasks'&&typeof actionSyncDirty!=='undefined'){actionSyncDirty=false;actionSyncState='synced';}
   notice='Selected block resolved: '+(receipt.direction==='browser'?'browser copy saved and cloud read-back verified.':'cloud copy loaded on this browser.')+' Both prior copies are in the recovery backup. Other blocks were not changed.';
   snapshot=null;choice=null;downloaded=false;
  }catch(error){if(area?.key==='tasks'&&typeof actionSyncState!=='undefined')actionSyncState='error';throw error;}
  finally{busy=false;root.KryosJournalConflict.resolving=false;cloudFreshnessRunning=false;}
 }
 function renderPanel(){
  if(!settingsView)return;
  if(snapshot&&snapshotOwner!==syncState.userId){snapshot=null;snapshotOwner='';choice=null;downloaded=false;notice='Account changed. Compare again to review the current copies.';}
  settingsView.querySelector('#journal-conflict-review')?.remove();
  const areas=snapshot?.areas||[];
  const details=areas.map(area=>{
   const s=area.summary;
   return '<article><h3>'+escapeHtml(area.label)+'</h3><p>Browser: '+s.localEntries+' entries, '+s.localDrafts+' drafts · Cloud: '+s.remoteEntries+' entries, '+s.remoteDrafts+' drafts</p><p>'+s.changedEntries.length+' entry differences · Linked records '+(s.recordsDiffer?'differ':'match')+' · Drafts '+(s.draftsDiffer?'differ':'match')+'</p>'+(s.changedEntries.length?'<details><summary>Dates with entry differences</summary><ul>'+s.changedEntries.map(e=>'<li>'+escapeHtml(e.date||'Undated')+' · '+escapeHtml(e.kind.replaceAll('-',' '))+' · correction versions '+e.localCorrections+' browser / '+e.remoteCorrections+' cloud</li>').join('')+'</ul></details>':'')+'<div class="journal-conflict-actions"><button type="button" class="secondary-button" data-journal-conflict="choose-browser" data-block="'+area.key+'" '+(busy?'disabled':'')+'>Keep browser copy</button><button type="button" class="secondary-button" data-journal-conflict="choose-cloud" data-block="'+area.key+'" '+(busy?'disabled':'')+'>Use cloud copy</button></div></article>';
  }).join('');
  settingsView.insertAdjacentHTML('beforeend','<section id="journal-conflict-review" class="journal-conflict-review"><p class="section-kicker">PRESERVE BOTH COPIES</p><h2>Review journal sync differences</h2><p>Compare browser and cloud journal data before choosing a direction. Comparison is read-only. Resolution requires a backup and explicit confirmation. Marketing and Career are excluded.</p><div class="journal-conflict-actions"><button type="button" class="secondary-button" data-journal-conflict="read" '+(busy?'disabled':'')+'>'+(busy?'Checking copies…':'Compare latest copies')+'</button>'+(snapshot?'<button type="button" class="secondary-button" data-journal-conflict="export">Download both copies</button>':'')+(recoveryBackup()?'<button type="button" class="secondary-button" data-journal-conflict="recovery-export">Download last recovery backup</button>':'')+'</div><p role="status">'+escapeHtml(notice)+'</p>'+details+confirmationMarkup()+(snapshot?'<p class="journal-conflict-note">Snapshot checked '+escapeHtml(snapshot.capturedAt)+'. Download contains private journal and task-block data. Keep it on your device. Copies can change after this check.</p>':'')+'</section>');
 }
 renderSettingsView=function(){original();renderPanel();};
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-journal-conflict]');if(!button)return;
  if(busy)return;
  if(button.dataset.journalConflict==='recovery-export'){const backup=recoveryBackup();if(backup)download(backup,'kryos-journal-recovery.json');return;}
  if(button.dataset.journalConflict==='cancel'){choice=null;renderPanel();return;}
  if(button.dataset.journalConflict.startsWith('choose-')){
   if(!snapshot||snapshotOwner!==syncState.userId)return;
   if(!downloaded){notice='Download both copies before choosing a direction.';renderPanel();return;}
   choice={key:button.dataset.block,direction:button.dataset.journalConflict==='choose-browser'?'browser':'cloud'};renderPanel();return;
  }
  if(button.dataset.journalConflict==='confirm'){try{await resolveChoice();}catch(error){notice=error.message;choice=null;}renderPanel();return;}
  if(button.dataset.journalConflict==='export'){
   if(!snapshot||snapshotOwner!==syncState.userId){snapshot=null;renderPanel();return;}
   download(snapshot,'kryos-journal-copies-'+new Date().toISOString().slice(0,10)+'.json');downloaded=true;notice='Both copies downloaded. Choose one block and direction to continue.';renderPanel();return;
  }
  if(busy)return;
  busy=true;snapshot=null;choice=null;downloaded=false;notice='Reading copies. No records will be changed.';renderPanel();
  try{
   if(isDemoMode())throw Error('Open your Personal profile to compare cloud data.');
   const session=await refreshSyncAuthState({silent:true});if(!session)throw Error('Sign in to Cloud first. Your browser copy is unchanged.');
   const client=getSupabaseClient(),profile=await ensureSupabaseProfile(session),local=createSyncPayloadPreview();
   const {data,error}=await client.from('kryos_sync_blocks').select('block_key,payload,revision,payload_updated_at').eq('profile_id',profile).in('block_key',['tasks','journal']);
   if(error)throw Error('Cloud copies could not be read. Neither copy was changed.');
   const areas=[];
   for(const row of data||[]){
    const block=SYNC_BLOCKS.find(b=>b.key===row.block_key);if(!block)continue;
    const browser=local.blocks[block.payloadKey||row.block_key];
    areas.push({key:row.block_key,label:row.block_key==='tasks'?'Journal entries and linked daily records':'Legacy journal workspace',browser:JSON.parse(JSON.stringify(browser?.value||{})),cloud:row.payload,cloudRevision:Number(row.revision)||0,cloudUpdatedAt:row.payload_updated_at,summary:compare(browser?.value,row.payload)});
   }
   if(session.user.id!==syncState.userId)throw Error('Account changed during comparison. Compare again.');
   snapshotOwner=session.user.id;snapshot={version:1,purpose:'read-only-journal-conflict-review',capturedAt:new Date().toISOString(),areas};
   notice=areas.length?'Comparison ready. Neither copy was changed. Download both, then use a block-specific choice below.':'No cloud journal blocks found. Your browser copy is unchanged.';
  }catch(error){notice=error.message||'Comparison unavailable. Neither copy was changed.';}
  finally{busy=false;renderPanel();}
 });
 if(currentPage==='settings')renderPanel();
})(globalThis);
