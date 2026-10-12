/* Sole owner of page routing, history, focus and page-specific reading positions. */
(function(){
  KryosUI.claim('navigation','ui-navigation.js',['visual-foundation.css']);
  const main=document.getElementById('app');
  // Only unsubmitted entry forms. Never replay autosaved records, passwords or file inputs.
  const draftForms='[data-marketing-role-form],[data-marketing-activity-form],#sadhana-task-form,#sadhana-breach-form';
  const formKey=form=>form.id||form.dataset.role||'new-marketing-role';
  function captureDrafts(page){
    const view=document.getElementById(page+'-view');
    return [...(view?.querySelectorAll(draftForms)||[])].map(form=>({
      key:formKey(form),
      fields:[...form.elements].filter(el=>el.name&&!['file','password','submit','button'].includes(el.type)).map(el=>({name:el.name,value:el.value,checked:el.checked,type:el.type}))
    }));
  }
  function restoreDrafts(page,drafts=[]){
    const view=document.getElementById(page+'-view');
    for(const form of view?.querySelectorAll(draftForms)||[]){
      const draft=drafts.find(d=>d.key===formKey(form));if(!draft)continue;
      for(const el of form.elements){
        const field=draft.fields.find(f=>f.name===el.name&&(!['checkbox','radio'].includes(el.type)||f.value===el.value));
        if(!field||['file','password'].includes(el.type))continue;
        if(['checkbox','radio'].includes(el.type))el.checked=field.checked;else el.value=field.value;
      }
      const target=form.querySelector('.command-target-field');
      if(target&&form.elements.kind)target.hidden=form.elements.kind.value!=='quantity';
    }
  }
  const nav=KryosUI.createNavigation({
    pages:[...APP_PAGES,'today','habits','focus','redirect','project','review'],
    scope:()=>typeof isDemoMode==='function'&&isDemoMode()?'demo':'personal',
    current:()=>currentPage,
    capture:()=>({windowY:window.scrollY,mainY:main?.scrollTop||0,focusId:document.activeElement?.id||'',drafts:captureDrafts(currentPage)}),
    history:(page,target,replace)=>{
      const old=window.history.state||{};
      const state={...old,kryosPage:page,kryosNavigation:true,kryosTarget:target};
      if(page==='marketing'&&!replace&&currentPage!=='marketing'){state.kryosMarketing=true;state.from=currentPage;}
      else{delete state.kryosMarketing;delete state.from;}
      window.history[replace?'replaceState':'pushState'](state,'',window.location.pathname+window.location.search+'#'+page);
    },
    render:(page,position)=>{
      currentPage=page;render();
      restoreDrafts(page,position?.drafts);
      document.querySelectorAll('.nav-item,.mobile-nav-item').forEach(button=>{
        if(button.dataset.page===page)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
      });
      if(['actions','career','rhythm','journal','settings'].includes(page))refreshCloudData({automatic:true});
      if(page==='rewards'&&typeof syncRewardLedger==='function')syncRewardLedger();
    },
    schedule:fn=>requestAnimationFrame(()=>requestAnimationFrame(fn)),
    restore:(position,page,targetId)=>{
      const view=document.getElementById(page+'-view');
      if(!view||view.classList.contains('is-hidden'))return;
      restoreDrafts(page,position.drafts);
      if(main)main.scrollTop=position.mainY;window.scrollTo({top:position.windowY,behavior:'instant'});
      if(!document.getElementById('security-overlay')?.classList.contains('is-hidden'))return;
      const target=targetId?document.getElementById(targetId):position.focusId?document.getElementById(position.focusId):view.querySelector('h1,h2');
      if(!target||!view.contains(target))return;
      if(!target.matches('input,textarea,select,button,a,summary'))target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
      if(targetId)target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
  });
  window.KryosNavigation={ready:true,...nav};
  // One navigation event owner for sidebar and inline links in both app variants.
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-page]');
    if(!button||!APP_PAGES.includes(button.dataset.page))return;
    event.preventDefault();event.stopImmediatePropagation();
    nav.navigate(button.dataset.page,button.dataset.pageTarget||'');
  },true);
  setPage=(page,target='')=>nav.navigate(page,target);
  openMarketingWorkspace=()=>nav.navigate('marketing');
  returnFromMarketing=()=>{
    if(window.history.state?.kryosMarketing&&window.history.state?.kryosNavigation){window.history.back();return;}
    nav.navigate('launch','',{history:'replace'});
  };
  const historyRoute=()=>{
    const state=window.history.state;
    const page=KryosUI.route(window.location.hash,APP_PAGES,APP_PAGES.includes(state?.kryosPage)?state.kryosPage:currentPage);
    nav.navigate(page,'',{history:'none'});
  };
  window.addEventListener('popstate',historyRoute);
  window.addEventListener('hashchange',historyRoute);
  const initial=KryosUI.route(window.location.hash,APP_PAGES,currentPage);
  nav.navigate(initial,'',{history:'replace',force:true});
})();
