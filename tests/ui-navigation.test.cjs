const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createOwnership,createNavigation,route}=require('../ui-runtime.js');
function harness(){
 let page='journal',scope='personal',position={windowY:0,mainY:0};const frames=[],history=[],restores=[],renders=[];
 const nav=createNavigation({pages:['journal','career','launch','marketing'],scope:()=>scope,current:()=>page,capture:()=>({...position}),history:(...args)=>history.push(args),render:p=>{page=p;renders.push(p);},schedule:f=>frames.push(f),restore:(...args)=>{restores.push(args);position={...args[0]};}});
 return {nav,history,restores,renders,flush:()=>{while(frames.length)frames.shift()();},position:p=>position=p,scope:s=>scope=s,page:()=>page};
}
test('component ownership rejects a second owner including duplicate script loading',()=>{
 const r=createOwnership();r.claim('career.view','career-flow-ui.js',['career-flow-ui.css']);
 assert.throws(()=>r.claim('career.view','other.js'),/already registered/);
 assert.throws(()=>r.claim('career.view','career-flow-ui.js'),/already registered/);
 assert.equal(r.inventory()[0].owner,'career-flow-ui.js');
 assert.throws(()=>r.inventory()[0].styles.push('late.css'),TypeError);
});
test('routes resolve only known pages and leave internal anchors to their page',()=>{
 assert.equal(route('#career',['career','journal'],'journal'),'career');
 for(const hash of ['#career-roadmap-detail','#bad','#__proto__'])assert.equal(route(hash,['career','journal'],'journal'),'journal');
});
test('new page entry does not inherit outgoing window or app scroll',()=>{
 const h=harness();h.position({windowY:1800,mainY:90});h.nav.navigate('career');h.flush();
 assert.deepEqual(h.restores[0][0],{windowY:0,mainY:0});
});
test('return restores the destination page reading position and focus ID',()=>{
 const h=harness();h.position({windowY:1200,mainY:60,focusId:'topic'});
 h.nav.navigate('career');h.flush();h.position({windowY:300,mainY:8});h.nav.navigate('journal');h.flush();
 assert.deepEqual(h.restores.at(-1)[0],{windowY:1200,mainY:60,focusId:'topic'});
});
test('explicit Continue target overrides remembered reading position',()=>{
 const h=harness();h.nav.navigate('career');h.flush();h.position({windowY:900,mainY:22});h.nav.navigate('journal');h.flush();
 h.nav.navigate('career','career-current-focus');h.flush();
 assert.deepEqual(h.restores.at(-1),[{windowY:0,mainY:0},'career','career-current-focus']);
});
test('rapid navigation cancels obsolete scheduled scroll and focus work',()=>{
 const h=harness();h.nav.navigate('career');h.nav.navigate('launch');h.flush();
 assert.equal(h.restores.length,1);assert.equal(h.restores[0][1],'launch');
});
test('Back and Forward render without pushing replacement history entries',()=>{
 const h=harness();h.nav.navigate('career');h.flush();h.nav.navigate('launch');h.flush();
 h.nav.navigate('career','',{history:'none'});h.flush();
 assert.equal(h.history.length,2);assert.equal(h.page(),'career');
});
test('clicking the current page is a no-op; invalid pages are rejected',()=>{
 const h=harness();assert.equal(h.nav.navigate('journal'),true);assert.equal(h.nav.navigate('missing'),false);
 assert.equal(h.renders.length,0);assert.equal(h.history.length,0);
});
test('profile changes clear remembered positions',()=>{
 const h=harness();h.position({windowY:999,mainY:0});h.nav.navigate('career');h.flush();h.scope('demo');h.nav.navigate('journal');h.flush();
 assert.equal(h.restores.at(-1)[0].windowY,0);
});
test('initial direct link replaces history, while later links push',()=>{
 const h=harness();h.nav.navigate('journal','',{history:'replace',force:true});h.flush();h.nav.navigate('marketing');h.flush();
 assert.equal(h.history[0][2],true);assert.equal(h.history[1][2],false);
});
test('clearing navigation invalidates pending callbacks',()=>{
 const h=harness();h.nav.navigate('career');h.nav.clear();h.flush();assert.equal(h.restores.length,0);
});
test('runtime loads before owners and router loads after the final page adapter',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.ok(html.indexOf('ui-runtime.js')<html.indexOf('commitment-premium.js'));
 assert.ok(html.indexOf('ui-navigation.js')>html.indexOf('reward-ui-v5.js'));
 const source=fs.readFileSync(path.join(__dirname,'../ui-navigation.js'),'utf8');
 assert.match(source,/popstate/);assert.match(source,/hashchange/);assert.match(source,/aria-current/);
 assert.doesNotMatch(source,/saveTasks|marketingWrite|localStorage|supabase\./);
});
