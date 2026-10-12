/* Settings presentation; never changes configuration, credentials or records. */
if(typeof KryosUI!=='undefined')KryosUI.claim('settings.view','settings-flow-ui.js',["settings-flow-ui.css"]);
function settingsFlowStorageMarkup(laptop){
 return '<section class="settings-flow-storage"><p class="section-kicker">WHERE YOUR DATA LIVES</p><h2>'+ (laptop?'Laptop app':'GitHub Pages app')+'</h2><p>'+ (laptop?'Marketing jobs and files, plus Career roadmaps, use this laptop’s local service. Other workspaces follow their existing browser/cloud settings. This is separate from the GitHub Pages copy.':'Personal workspaces use browser copies and Supabase when signed in. A connected account is not a confirmed save. Laptop Marketing records and files are separate.')+'</p><p>Read the save badge for the workspace you are using. App version describes the software—not when your records last synced.</p></section>';
}
const settingsFlowOriginalRenderer=renderSettingsView;
renderSettingsView=function(){
 const releaseOpen=settingsView?.querySelector('.settings-flow-release')?.open||false;
 settingsFlowOriginalRenderer();
 if(!settingsView)return;
 const identity=settingsView.querySelector('.product-identity-card');
 if(identity)settingsView.prepend(identity);
 identity?.insertAdjacentHTML('afterend',settingsFlowStorageMarkup(document.body.dataset.kryosStorage==='laptop'));
 const notes=identity?.querySelector('.release-note-panel');
 if(notes)notes.outerHTML='<details class="settings-flow-release" '+(releaseOpen?'open':'')+'><summary>What changed in this release</summary>'+notes.outerHTML+'</details>';
};
if(typeof settingsView!=='undefined'&&settingsView&&!settingsView.classList.contains('is-hidden'))renderSettingsView();
