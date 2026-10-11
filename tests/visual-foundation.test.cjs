const test=require('node:test'),assert=require('node:assert/strict');
const {status}=require('../visual-foundation.js');
test('cloud connection alone never claims a confirmed save',()=>{
 assert.equal(status({connected:true}).label,'Browser copy · cloud connected');
 assert.equal(status({connected:true,phase:'synced'}).label,'Cloud confirmed');
 assert.equal(status({connected:false,phase:'synced'}).state,'local');
});
test('pending edits override an earlier confirmed receipt',()=>{
 assert.equal(status({connected:true,phase:'synced',dirty:true}).state,'saving');
 assert.equal(status({phase:'local',dirty:true}).label,'Browser changes · cloud pending');
});
test('laptop states never imply Supabase or browser persistence',()=>{
 for(const phase of ['checking','saving','connected','error']){
  const s=status({storage:'laptop',phase});assert.ok(s.label.includes('laptop')||s.label.includes('Laptop'));
 }
 assert.equal(status({storage:'laptop',phase:'connected'}).label,'Saved on this laptop');
 assert.equal(status({storage:'laptop',phase:'error'}).state,'error');
});
test('failure and demo status do not promise backup or cross-device delivery',()=>{
 assert.match(status({phase:'error'}).detail,/not a confirmed cloud backup/);
 assert.equal(status({demo:true,phase:'synced',connected:true}).label,'Demo · browser only');
 assert.match(status({phase:'synced',connected:true}).detail,/Other devices must receive/);
});
test('foundation script loads after adapters; stylesheet loads after page styles',()=>{
 const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 assert.ok(html.indexOf('visual-foundation.js')>html.indexOf('career-workflows.js'));
 assert.ok(html.indexOf('visual-foundation.css')>html.indexOf('reward-system.css'));
 assert.match(html,/data-kryos-storage="cloud"/);
});
