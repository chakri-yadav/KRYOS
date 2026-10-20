/* Shared presentation only: no storage reads, writes, polling or sync requests. */
if(typeof KryosUI!=='undefined')KryosUI.claim('foundation.status','visual-foundation.js',["visual-tokens.css","visual-foundation.css"]);
(function(root){
  function status(input={}) {
    const {storage='browser',phase='local',connected=false,dirty=false,demo=false}=input;
    if(demo)return {state:'local',label:'Demo · browser only',detail:'Demo records stay separate from Personal data.'};
    if(storage==='laptop'){
      if(phase==='error')return {state:'error',label:'Laptop save needs attention',detail:'The local service has not confirmed this update. Keep your input and check the local service before closing.'};
      if(phase==='saving'||dirty)return {state:'saving',label:'Saving on this laptop',detail:'Waiting for the local file-storage service to confirm the update.'};
      if(phase==='checking')return {state:'local',label:'Checking laptop storage',detail:'The local file-storage service has not confirmed availability yet.'};
      return {state:'synced',label:'Saved on this laptop',detail:'Confirmed by the local file-storage service. This workspace does not sync to Supabase.'};
    }
    if(phase==='error')return {state:'error',label:'Cloud save needs attention',detail:'Cloud confirmation failed. Browser-held changes are not a confirmed cloud backup; check Settings before closing.'};
    if(phase==='saving'||dirty)return {state:'saving',label:connected?'Cloud confirmation pending':'Browser changes · cloud pending',detail:connected?'Sending or checking this workspace’s records. Another device may not have received them yet.':'Cloud is not connected. Changes held in this browser are not backed up across devices.'};
    if(phase==='synced'&&connected)return {state:'synced',label:'Cloud confirmed',detail:'This workspace’s latest sync completed. Other devices must receive the update before showing it.'};
    return {state:'local',label:connected?'Browser copy · cloud connected':'Browser copy · no cloud',detail:connected?'Signed in, but this workspace has not confirmed a current sync. Connection alone is not a save receipt.':'This workspace is held in this browser. Sign in through Settings to use cloud backup.'};
  }
  const confirmations=new Map();
  const confirmationKey=(workspace,account,mode)=>[workspace,account,mode].join('|');
  function recordConfirmation(workspace,account,mode,at){if(!account||!['tasks','career'].includes(workspace)||!at||!Number.isFinite(Date.parse(at)))return;confirmations.set(confirmationKey(workspace,account,mode),at);}
  function confirmationFor(workspace,account,mode){return confirmations.get(confirmationKey(workspace,account,mode))||null;}
  root.KryosVisualFoundation={status,recordConfirmation,confirmationFor};
  if(typeof module==='object'&&module.exports)module.exports={status,recordConfirmation,confirmationFor};
})(typeof globalThis!=='undefined'?globalThis:this);
if(typeof document!=='undefined'){
  function foundationWorkspaceStatus(){
    const laptop=document.body.dataset.kryosStorage==='laptop',page=typeof currentPage==='undefined'?'':currentPage;
    const connected=typeof syncState!=='undefined'&&syncState.status==='connected'&&!!syncState.userId;
    const demo=typeof isDemoMode==='function'&&isDemoMode();
    if(laptop&&page==='marketing')return KryosVisualFoundation.status({storage:'laptop',phase:marketingLocalStatus,dirty:marketingLocalDirty,demo});
    if(laptop&&page==='career')return KryosVisualFoundation.status({storage:'laptop',phase:careerSyncState==='error'?'error':careerSyncState==='saving'?'saving':typeof careerLocalReady!=='undefined'&&careerLocalReady?'connected':'checking',demo});
    if(!laptop&&page==='marketing')return KryosVisualFoundation.status({phase:typeof actionSyncState==='undefined'?'local':actionSyncState,dirty:typeof actionSyncDirty!=='undefined'&&actionSyncDirty,connected,demo});
    const phase=page==='career'?careerSyncState:page==='marketing'&&typeof marketingSyncState!=='undefined'?marketingSyncState:typeof actionSyncState==='undefined'?'local':actionSyncState;
    const dirty=page==='career'?careerSyncDirty:page==='marketing'&&typeof marketingSyncDirty!=='undefined'?marketingSyncDirty:typeof actionSyncDirty!=='undefined'&&actionSyncDirty;
    return KryosVisualFoundation.status({phase,dirty,connected,demo});
  }
  getGlobalCloudState=foundationWorkspaceStatus;
  const foundationPreviousGlobalUpdate=updateGlobalCloudState;
  updateGlobalCloudState=function(){
    foundationPreviousGlobalUpdate();
    const status=foundationWorkspaceStatus();
    document.querySelectorAll('[data-global-cloud-state]').forEach(badge=>{
      badge.setAttribute('aria-label',status.label);
      let details=badge.parentElement.querySelector('.foundation-storage-details');
      if(!details){details=document.createElement('details');details.className='foundation-storage-details';const summary=document.createElement('summary');summary.textContent='Save details';const text=document.createElement('p');details.append(summary,text);badge.insertAdjacentElement('afterend',details);}
      details.querySelector('p').textContent=status.detail;
    });
    if(typeof settingsFlowRefreshStatus==='function')settingsFlowRefreshStatus();
  };
  actionSyncLabel=function(){return KryosVisualFoundation.status({phase:actionSyncState,dirty:actionSyncDirty,connected:syncState.status==='connected'&&!!syncState.userId,demo:isDemoMode()}).label;};
  careerSyncLabel=function(){return document.body.dataset.kryosStorage==='laptop'?KryosVisualFoundation.status({storage:'laptop',phase:careerSyncState==='error'?'error':careerSyncState==='saving'?'saving':typeof careerLocalReady!=='undefined'&&careerLocalReady?'connected':'checking',demo:isDemoMode()}).label:KryosVisualFoundation.status({phase:careerSyncState,dirty:careerSyncDirty,connected:syncState.status==='connected'&&!!syncState.userId,demo:isDemoMode()}).label;};
  if(typeof marketingLocalSetStatus==='function'){
    const foundationPreviousMarketingStatus=marketingLocalSetStatus;
    marketingLocalSetStatus=function(...args){foundationPreviousMarketingStatus(...args);updateGlobalCloudState();};
  }
  const foundationPreviousCareerIndicator=updateCareerSyncIndicator;
  updateCareerSyncIndicator=function(){foundationPreviousCareerIndicator();const el=document.getElementById('career-sync-state');if(el){el.setAttribute('role','status');el.setAttribute('aria-live','polite');}};
  document.addEventListener('DOMContentLoaded',()=>{updateGlobalCloudState();updateCareerSyncIndicator();if(typeof updateActionSyncIndicator==='function')updateActionSyncIndicator();},{once:true});
}
