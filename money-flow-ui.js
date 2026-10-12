/* Money presentation only. No ledger calculations, rewards or storage writes. */
if(typeof KryosUI!=='undefined')KryosUI.claim('money.view','money-flow-ui.js',["money-flow-ui.css","money.css"]);
function moneyFlowNavigationMarkup(sections){
 return '<nav class="money-flow-navigation" aria-label="Money sections"><p class="section-kicker">FIND WHAT YOU NEED</p><div>'+sections.map(s=>'<button type="button" class="secondary-button" data-money-section="'+escapeHtml(s.id)+'">'+escapeHtml(s.title)+'</button>').join('')+'</div></nav>';
}
const moneyFlowOriginalRenderer=renderMoneyView;
renderMoneyView=function(){
 moneyFlowOriginalRenderer();
 if(!moneyView)return;
 const sections=[...moneyView.querySelectorAll('.money-surface')].map((panel,index)=>{
 const heading=panel.querySelector('h2');if(!heading)return null;
 const id='money-reading-section-'+index;panel.id=id;heading.tabIndex=-1;
 return {id,title:panel.querySelector('.section-kicker')?.textContent||heading.textContent};
 }).filter(Boolean);
 const anchor=moneyView.querySelector('.money-next-action')||moneyView.querySelector('.money-command');
 if(anchor&&sections.length)anchor.insertAdjacentHTML('afterend',moneyFlowNavigationMarkup(sections));
 const grid=moneyView.querySelector('.money-contact-grid');
 if(grid){grid.setAttribute('role','img');grid.setAttribute('aria-label','Contact history: '+[...grid.querySelectorAll('[title]')].map(c=>c.title).join('; '));}
};
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-money-section]');if(!button)return;
 const panel=document.getElementById(button.dataset.moneySection);if(!panel)return;
 panel.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 panel.querySelector('h2')?.focus({preventScroll:true});
});
if(typeof moneyView!=='undefined'&&moneyView&&!moneyView.classList.contains('is-hidden'))renderMoneyView();
