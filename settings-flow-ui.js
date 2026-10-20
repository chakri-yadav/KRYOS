/* Settings presentation; domain owners provide confirmation and backup receipts. */
if(typeof KryosUI!=='undefined')KryosUI.claim('settings.view','settings-flow-ui.js',["settings-flow-ui.css"]);
function settingsFlowEscape(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');}
function settingsFlowTime(value){return value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString('en-US',{timeZone:'America/Chicago',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}):'Not recorded';}
function settingsFlowModel(input){
 const phaseStatus=value=>typeof KryosVisualFoundation!=='undefined'?KryosVisualFoundation.status({...value,demo:input.demo}):{state:'local',label:'Save state not recorded',detail:''};
 const personal=phaseStatus({phase:input.actionPhase,dirty:input.actionDirty,connected:input.connected});
 const career=phaseStatus(input.laptop?{storage:'laptop',phase:input.careerPhase==='error'?'error':input.careerPhase==='saving'||input.careerDirty?'saving':input.careerReady?'connected':'checking'}:{phase:input.careerPhase,dirty:input.careerDirty,connected:input.connected});
 const marketing=input.laptop?phaseStatus({storage:'laptop',phase:input.marketingPhase==='error'||!input.marketingConnected&&input.marketingReady?'error':!input.marketingReady?'checking':input.marketingPhase,dirty:input.marketingDirty}):personal;
 return [
 {area:'Actions, Rhythm, daily review and Money',destination:'Browser copy'+(input.laptop?' · optional Personal Cloud':' · signed-in Personal Cloud'),...personal,receipt:personal.state==='synced'&&input.connected?input.confirmations?.tasks:null},
 {area:'Foundation and legacy Journal',destination:'Separate browser/cloud blocks',state:'local',label:'Separate confirmation not tracked here',detail:'These blocks use their existing sync controls. A tasks-block receipt does not confirm them.',receipt:null},
 {area:'Career',destination:input.laptop?'Laptop local service':'Browser copy · separate Personal Cloud Career',...career,receipt:!input.laptop&&career.state==='synced'&&input.connected?input.confirmations?.career:null},
 {area:'Marketing',destination:input.laptop?'Laptop database and document files':'Approved dated aggregate snapshots only',...marketing,receipt:!input.laptop&&marketing.state==='synced'&&input.connected?input.confirmations?.tasks:null,revision:input.laptop&&marketing.state==='synced'?input.marketingRevision:null}
 ].map(row=>input.demo?{...row,destination:'Demo browser only',state:'local',label:'Demo · browser only',detail:'Separate demo profile; no Personal Cloud confirmation.',receipt:null,revision:null}:row);
}
function settingsFlowSnapshot(){
 const laptop=document.body.dataset.kryosStorage==='laptop',sync=typeof syncState==='undefined'?{}:syncState,mode=typeof accountMode==='string'?accountMode:'personal';
 return {laptop,mode,demo:typeof isDemoMode==='function'&&isDemoMode(),connected:sync.status==='connected'&&!!sync.userId,
 actionPhase:typeof actionSyncState==='string'?actionSyncState:'local',actionDirty:typeof actionSyncDirty!=='undefined'&&actionSyncDirty,
 careerPhase:typeof careerSyncState==='string'?careerSyncState:'local',careerDirty:typeof careerSyncDirty!=='undefined'&&careerSyncDirty,careerReady:typeof careerLocalReady!=='undefined'&&careerLocalReady,
 marketingPhase:typeof marketingLocalStatus==='string'?marketingLocalStatus:'checking',marketingConnected:typeof marketingLocalConnected!=='undefined'&&marketingLocalConnected,marketingDirty:typeof marketingLocalDirty!=='undefined'&&marketingLocalDirty,marketingReady:typeof marketingLocalReady!=='undefined'&&marketingLocalReady,marketingRevision:typeof marketingLocalRevision==='number'?marketingLocalRevision:null,
 confirmations:{tasks:typeof KryosVisualFoundation!=='undefined'?KryosVisualFoundation.confirmationFor?.('tasks',sync.userId,mode)||null:null,career:typeof KryosVisualFoundation!=='undefined'?KryosVisualFoundation.confirmationFor?.('career',sync.userId,mode)||null:null},
 backup:typeof marketingLocalBackupReceipt!=='undefined'?marketingLocalBackupReceipt:null,backupState:typeof marketingLocalBackupStatus==='string'?marketingLocalBackupStatus:'idle',
 download:globalThis.kryosBackupDownloadReceipt?.accountMode===mode?globalThis.kryosBackupDownloadReceipt:null,
 appVersion:typeof APP_VERSION==='string'?APP_VERSION:'Not recorded',formatVersion:typeof KRYOS_BACKUP_VERSION!=='undefined'?KRYOS_BACKUP_VERSION:'Not recorded'};
}
function settingsFlowStateMarkup(input){
 const esc=settingsFlowEscape,rows=settingsFlowModel(input);
 return '<div class="settings-storage-table-wrap"><table class="settings-storage-table"><caption>Storage and save confirmation by workspace</caption><thead><tr><th scope="col">Workspace</th><th scope="col">Destination</th><th scope="col">Save state</th></tr></thead><tbody>'+rows.map(r=>'<tr><th scope="row">'+esc(r.area)+'</th><td>'+esc(r.destination)+'</td><td data-settings-save-state="'+r.state+'"><strong>'+esc(r.label)+'</strong><span>'+esc(r.detail)+'</span><small>'+(r.state==='synced'?(r.receipt?'Confirmed '+esc(settingsFlowTime(r.receipt)):Number.isSafeInteger(r.revision)?'Saved source revision '+r.revision:'Confirmation time not recorded in this session'):'A previous receipt does not confirm pending changes.')+'</small></td></tr>').join('')+'</tbody></table></div><details class="settings-backup-evidence"><summary>Backup and restore evidence</summary><p><strong>App-state JSON:</strong> active '+esc(input.mode)+' profile · software '+esc(input.appVersion)+' · backup format '+esc(input.formatVersion)+'. Marketing database and document files require a separate laptop backup.</p><p><strong>JSON download request:</strong> '+(input.download?esc(settingsFlowTime(input.download.requestedAt))+' · format '+esc(input.download.formatVersion):'Not recorded in this session')+'. A requested download does not verify that the file was saved or restored.</p>'+(input.laptop&&!input.demo?'<p><strong>Laptop database/files backup:</strong> '+(input.backup?'Created '+esc(settingsFlowTime(input.backup.createdAt))+' · revision '+esc(input.backup.revision):'No receipt recorded in this session; existing backup files may still exist.')+'</p><p role="status">'+(input.backupState==='creating'?'Backup creation pending':input.backupState==='error'?'Latest backup attempt failed; any earlier receipt above remains separate.':'Database/files backups are separate from app-state JSON.')+'</p><button type="button" class="secondary-button" data-marketing-local-backup '+(input.backupState==='creating'?'disabled':'')+'>Create laptop database/files backup</button>':'<p>Laptop database/files backups are created in the laptop app. Cloud confirmation alone is not a restore test.</p>')+'<p><strong>Last verified restore:</strong> Not tested — no verified restore receipt is recorded here.</p></details>';
}
function settingsFlowStorageMarkup(laptop,input=null){
 return '<section class="settings-flow-storage"><p class="section-kicker">WHERE YOUR DATA LIVES</p><h2>'+ (laptop?'Laptop app':'GitHub Pages app')+'</h2><p>'+ (laptop?'Marketing jobs and files, plus Career roadmaps, use this laptop’s local service. Other workspaces follow their existing browser/cloud settings. This is separate from the GitHub Pages copy.':'Personal workspaces use browser copies and Supabase when signed in. A connected account is not a confirmed save. Laptop Marketing records and files are separate.')+'</p><p>Read the save badge for the workspace you are using. App version describes the software—not when your records last synced.</p>'+(input?'<div class="settings-flow-live">'+settingsFlowStateMarkup(input)+'</div>':'')+'</section>';
}
function settingsFlowRefreshStatus(){
 if(typeof settingsView==='undefined'||!settingsView)return;
 const live=settingsView.querySelector('.settings-flow-live');if(!live||live.contains(document.activeElement))return;
 const open=live.querySelector('.settings-backup-evidence')?.open;
 live.innerHTML=settingsFlowStateMarkup(settingsFlowSnapshot());if(open)live.querySelector('.settings-backup-evidence').open=true;
}
function settingsFlowCapture(){
 const active=document.activeElement,inside=settingsView?.contains(active),fields=[];
 if(inside&&active.matches('input,textarea'))for(const node of settingsView.querySelectorAll('input[id],textarea[id]')){
  if(['file','checkbox','radio','button','submit','hidden'].includes(node.type))continue;
  if(node===active||node.value!==node.defaultValue)fields.push({id:node.id,value:node.value,start:node.selectionStart,end:node.selectionEnd});
 }
 return {scope:settingsView?.dataset.settingsScope||'',fields,focus:inside?active.id:null,scroll:typeof currentPage!=='undefined'&&currentPage==='settings'?{x:window.scrollX,y:window.scrollY}:null,releaseOpen:settingsView?.querySelector('.settings-flow-release')?.open||false,backupOpen:settingsView?.querySelector('.settings-backup-evidence')?.open||false};
}
function settingsFlowRestore(view){
 if(!view||view.scope!==((typeof accountMode==='string'?accountMode:'personal')+'|'+(typeof syncState==='object'?syncState.userId||'':'')))return;
 for(const field of view.fields){const node=document.getElementById(field.id);if(!node||!settingsView.contains(node))continue;node.value=field.value;try{node.setSelectionRange(field.start,field.end);}catch{}}
 const focus=view.focus&&document.getElementById(view.focus);if(focus&&settingsView.contains(focus))focus.focus({preventScroll:true});
 if(view.scroll)window.scrollTo({left:view.scroll.x,top:view.scroll.y,behavior:'instant'});
}
function settingsFlowSections(snapshot,view){
 if(!settingsView)return;
 settingsView.dataset.settingsScope=(typeof accountMode==='string'?accountMode:'personal')+'|'+(typeof syncState==='object'?syncState.userId||'':'');
 const identity=settingsView.querySelector('.product-identity-card');
 if(identity)settingsView.prepend(identity);
 identity?.insertAdjacentHTML('afterend',settingsFlowStorageMarkup(snapshot.laptop,snapshot));
 if(view.backupOpen)settingsView.querySelector('.settings-backup-evidence').open=true;
 const notes=identity?.querySelector('.release-note-panel');
 if(notes)notes.outerHTML='<details class="settings-flow-release" '+(view.releaseOpen?'open':'')+'><summary>What changed in this release</summary>'+notes.outerHTML+'</details>';
 const exportButton=settingsView.querySelector('[data-settings-action="export-backup"]'),importButton=settingsView.querySelector('[data-settings-action="trigger-import"]');
 if(exportButton)exportButton.textContent='Download app-state JSON';if(importButton)importButton.textContent='Import app-state JSON';
 const copy=settingsView.querySelector('.backup-panel .meta');if(copy)copy.textContent='Active profile app-state JSON. Review the storage scopes and backup format above before importing. Laptop Marketing database/files are separate.';
}
function settingsFlowRender(base){
 return KryosUI.composeRender({capture:settingsFlowCapture,read:settingsFlowSnapshot,base,sections:settingsFlowSections,restore:settingsFlowRestore});
}
if(typeof settingsView!=='undefined'&&settingsView&&!settingsView.classList.contains('is-hidden'))renderSettingsView();
