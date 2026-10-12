/* Shared presentation ownership. No domain records, storage or scoring are owned here. */
(function(root){
  function createOwnership(){
    const owners=new Map();
    return {
      claim(component,owner,styles=[]){
        if(!component||!owner)throw new Error('A component and its owner are required.');
        if(owners.has(component))throw new Error('Presentation owner already registered: '+component);
        owners.set(component,Object.freeze({component,owner,styles:Object.freeze([...styles])}));
      },
      inventory(){return [...owners.values()];}
    };
  }
  function route(hash,pages,fallback){
    const page=String(hash||'').replace(/^#/,'');
    return pages.includes(page)?page:fallback;
  }
  function createNavigation(io){
    const positions=new Map();let generation=0,lastScope=io.scope();
    function navigate(page,target='',options={}){
      if(!io.pages.includes(page))return false;
      const scope=io.scope();if(scope!==lastScope){positions.clear();lastScope=scope;}
      const previous=io.current(),changed=previous!==page;
      if(changed)positions.set(previous,io.capture());
      if(!changed&&!target&&!options.force)return true;
      const token=++generation;
      if(options.history!=='none')io.history(page,target,options.history==='replace');
      const saved=!target?positions.get(page):null;
      io.render(page,saved);
      io.schedule(()=>{if(token!==generation||io.current()!==page)return;io.restore(saved||{windowY:0,mainY:0},page,target);});
      return true;
    }
    return {navigate,route:hash=>route(hash,io.pages,io.current()),clear(){positions.clear();generation++;}};
  }
  const api=createOwnership();Object.assign(api,{createOwnership,createNavigation,route});
  root.KryosUI=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
