/* Read-only journal conflict inspection. No automatic resolution or cloud writes. */
(function(root){
 const rows=value=>Array.isArray(value)?value:Object.values(value||{});
 const key=(entry,index)=>String(entry?.id||entry?.date||'row-'+index);
 function compare(local={},remote={}){
  local=local||{};remote=remote||{};
  const a=local.life||local,b=remote.life||remote;
  const left=new Map(rows(a.entries).map((e,i)=>[key(e,i),e])),right=new Map(rows(b.entries).map((e,i)=>[key(e,i),e]));
  const changes=[];
  for(const id of new Set([...left.keys(),...right.keys()])){
   const l=left.get(id),r=right.get(id);
   if(JSON.stringify(l)===JSON.stringify(r))continue;
   changes.push({id,date:l?.date||r?.date||'',kind:!r?'browser-only':!l?'cloud-only':'different',localCorrections:rows(l?.corrections).length,remoteCorrections:rows(r?.corrections).length});
  }
  const draftCount=x=>Object.values(x.drafts||{}).filter(t=>typeof t==='string'&&t.trim()).length+(typeof x.draft==='string'&&x.draft.trim()&&!Object.values(x.drafts||{}).includes(x.draft)?1:0);
  return {localEntries:left.size,remoteEntries:right.size,localDrafts:draftCount(a),remoteDrafts:draftCount(b),changedEntries:changes,recordsDiffer:JSON.stringify(a.records||[])!==JSON.stringify(b.records||[]),draftsDiffer:JSON.stringify([a.drafts||{},a.draft||''])!==JSON.stringify([b.drafts||{},b.draft||''])};
 }
 root.KryosJournalConflict={compare};
 if(typeof module!=='undefined')module.exports={compare};
 if(typeof document==='undefined')return;
 let snapshot=null,snapshotOwner='',busy=false,notice='';
 const original=renderSettingsView;
 function renderPanel(){
  if(!settingsView)return;
  if(snapshot&&snapshotOwner!==syncState.userId){snapshot=null;snapshotOwner='';notice='Account changed. Compare again to review the current copies.';}
  settingsView.querySelector('#journal-conflict-review')?.remove();
  const areas=snapshot?.areas||[];
  const details=areas.map(area=>{
   const s=area.summary;
   return '<article><h3>'+escapeHtml(area.label)+'</h3><p>Browser: '+s.localEntries+' entries, '+s.localDrafts+' drafts · Cloud: '+s.remoteEntries+' entries, '+s.remoteDrafts+' drafts</p><p>'+s.changedEntries.length+' entry differences · Linked records '+(s.recordsDiffer?'differ':'match')+' · Drafts '+(s.draftsDiffer?'differ':'match')+'</p>'+(s.changedEntries.length?'<details><summary>Dates with entry differences</summary><ul>'+s.changedEntries.map(e=>'<li>'+escapeHtml(e.date||'Undated')+' · '+escapeHtml(e.kind.replaceAll('-',' '))+' · correction versions '+e.localCorrections+' browser / '+e.remoteCorrections+' cloud</li>').join('')+'</ul></details>':'')+'</article>';
  }).join('');
  settingsView.insertAdjacentHTML('beforeend','<section id="journal-conflict-review" class="journal-conflict-review"><p class="section-kicker">PRESERVE BOTH COPIES</p><h2>Review journal sync differences</h2><p>Compare browser and cloud journal data before choosing a direction. This review does not save, merge or replace records. Marketing and Career are excluded.</p><div class="journal-conflict-actions"><button type="button" class="secondary-button" data-journal-conflict="read" '+(busy?'disabled':'')+'>'+(busy?'Checking copies…':'Compare latest copies')+'</button>'+(snapshot?'<button type="button" class="secondary-button" data-journal-conflict="export">Download both copies</button>':'')+'</div><p role="status">'+escapeHtml(notice)+'</p>'+details+(snapshot?'<p class="journal-conflict-note">Snapshot checked '+escapeHtml(snapshot.capturedAt)+'. Download contains private journal and task-block data. Keep it on your device. Copies can change after this check.</p>':'')+'</section>');
 }
 renderSettingsView=function(){original();renderPanel();};
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-journal-conflict]');if(!button)return;
  if(button.dataset.journalConflict==='export'){
   if(!snapshot||snapshotOwner!==syncState.userId){snapshot=null;renderPanel();return;}
   const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
   link.href=url;link.download='kryos-journal-copies-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
  }
  if(busy)return;
  busy=true;snapshot=null;notice='Reading copies. No records will be changed.';renderPanel();
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
   notice=areas.length?'Comparison ready. Neither copy was changed. Download both before using existing Push or Pull controls.':'No cloud journal blocks found. Your browser copy is unchanged.';
  }catch(error){notice=error.message||'Comparison unavailable. Neither copy was changed.';}
  finally{busy=false;renderPanel();}
 });
 if(currentPage==='settings')renderPanel();
})(globalThis);
