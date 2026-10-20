const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const entries={render:'app',renderActionVault:'actions',renderActionCard:'action.card',updateActionSyncIndicator:'action.sync',renderModuleBlock:'career.module',renderRhythmHabit:'rhythm.habit',renderRhythmGroup:'rhythm.group',renderRhythmView:'rhythm',renderLaunchView:'launch',renderMoneyView:'money',renderLifeJournal:'journal',renderLifeProgress:'progress',renderCareerView:'career',renderSettingsView:'settings',renderMarketingView:'marketing',renderJournalRewards:'rewards',renderContainmentCovenant:'command'};
function runInContext(code,context,options){
 if(!context.__uiTestRuntimeReady){
  context.window ||= {};context.window.addEventListener ||= ()=>{};
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../ui-runtime.js'),'utf8'),context);
  for(const [name,key]of Object.entries(entries)){const base=typeof context[name]==='function'?context[name]:()=>{};context[name+'Base'] ||= base;context[name]=(...args)=>context.KryosUI.renders.run(key,base,args);}
  context.__uiTestRuntimeReady=true;
 }
 return vm.runInContext(code,context,options);
}
function runInNewContext(code,context={},options){return runInContext(code,vm.createContext(context),options);}
module.exports={runInContext,runInNewContext};
