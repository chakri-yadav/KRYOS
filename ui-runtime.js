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
    return {navigate,route:hash=>route(hash,io.pages,io.current()),cancelRestore(){generation++;},clear(){positions.clear();generation++;}};
  }
  function composeRender(steps){
    const view=steps.capture?.();
    try{const model=steps.read?.();steps.base(model);steps.sections?.(model,view);}
    finally{steps.restore?.(view);}
  }
  function createRenderRegistry(){
    const pages=new Map(),running=new Set(),generations=new Map();
    function page(key){if(!pages.has(key))pages.set(key,{base:null,steps:new Map()});return pages.get(key);}
    function register(key,id,step){const p=page(key);if(p.steps.has(id))throw Error('Render section already registered: '+key+'/'+id);p.steps.set(id,{...step,id});return ()=>p.steps.delete(id);}
    function setBase(key,id,run){const p=page(key);if(p.base)throw Error('Render base already registered: '+key);p.base={id,run};}
    function run(key,base,args=[]){
      if(running.has(key))return;
      running.add(key);generations.set(key,(generations.get(key)||0)+1);const p=page(key),steps=[...p.steps.values()].sort((a,b)=>(a.order||0)-(b.order||0)||a.id.localeCompare(b.id)),captured=[];
      let failure;
      try{
        for(const s of steps){const view=s.capture?.(...args);captured.push([s,view]);s.before?.(view,...args);}
        let value=(p.base?.run||base)(...args);
        for(const [s,view]of captured){const next=s.after?.(view,value,...args);if(next!==undefined)value=next;}
        return value;
      }catch(error){failure=error;generations.set(key,(generations.get(key)||0)+1);throw error;}
      finally{let restoreFailure;for(const [s,view]of captured.slice().reverse()){try{s.restore?.(view,...args);}catch(error){restoreFailure ||= error;}}running.delete(key);if(!failure&&restoreFailure)throw restoreFailure;}
    }
    function scope(){return JSON.stringify([typeof accountMode==='string'?accountMode:'',typeof syncState==='object'?syncState.userId||'':'',typeof kryosSelectedDate==='function'?kryosSelectedDate():'']);}
    function schedule(key,fn){const token=generations.get(key),owner=scope();(root.requestAnimationFrame||((f)=>f()))(()=>{if(token===generations.get(key)&&owner===scope()&&(typeof currentPage==='undefined'||currentPage===key))fn();});}
    return {register,setBase,run,schedule,inventory:()=>[...pages].map(([key,p])=>({page:key,base:p.base?.id||'domain base',sections:[...p.steps.keys()]}))};
  }
  const api=createOwnership();Object.assign(api,{createOwnership,createNavigation,route,composeRender,createRenderRegistry,renders:createRenderRegistry()});
  root.KryosUI=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
