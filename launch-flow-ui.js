/* Presentation only: existing logs, targets and persistence remain authoritative. */
if(typeof KryosUI!=='undefined')KryosUI.claim('launch.view','launch-flow-ui.js',["launch-flow-ui.css"]);
function launchFlowFocusMarkup(date, market, rehearsal) {
 return '<section class="launch-flow-focus" aria-label="Next Launch action"><div><p class="section-kicker">ONE USEFUL STEP</p><h2>'+ (market?'Keep your speaking practice moving.':'Begin with one real market action.')+'</h2><p>'+market+' market actions · '+rehearsal+' rehearsals recorded for '+escapeHtml(date)+'. Logs are evidence, not a measure of your worth.</p></div><div><button type="button" class="primary-button" data-launch-open="'+(market?'mock':'market')+'">'+(market?'Record a rehearsal':'Record a market action')+'</button><button type="button" class="secondary-button" data-marketing-open>Open Marketing →</button></div></section>';
}
const launchFlowOriginalRenderer=renderLaunchView;
renderLaunchView=function(){
 launchFlowOriginalRenderer();
 if(!launchView)return;
 const command=launchView.querySelector('.launch-command');
if(command){const date=launchActivityDate();command.insertAdjacentHTML('afterend',launchFlowFocusMarkup(date,launchIntegratedCount(date),launchMocksOn(date).length));}
 launchView.querySelectorAll('[data-launch-platform]').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('checked'))));
 launchView.querySelectorAll('.launch-heatmap i[title]').forEach(cell=>{cell.setAttribute('tabindex','0');cell.setAttribute('role','img');cell.setAttribute('aria-label',cell.title);});
};
if(typeof currentPage!=='undefined'&&currentPage==='launch')renderLaunchView();
