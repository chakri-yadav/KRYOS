const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const css=read('visual-tokens.css'),foundation=read('visual-foundation.css');
const tokens=Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)].map(m=>[m[1],m[2].trim()]));
const token=name=>tokens['--kryos-'+name];
function luminance(hex){const a=hex.replace('#','').match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('approved opaque text/surface pairs pass minimum contrast in both palettes',()=>{
 for(const prefix of ['','dark-']){
  for(const [fg,bg] of [['text','surface'],['text-secondary','surface'],['text','canvas'],['text-secondary','canvas'],['on-action','action'],['positive','positive-surface'],['information','information-surface'],['learning','learning-surface'],['attention','attention-surface'],['negative','negative-surface'],['error','surface']]){
   assert.ok(contrast(token(prefix+fg),token(prefix+bg))>=4.5,prefix+fg+'/'+bg);
  }
  assert.ok(contrast(token(prefix+'control-border'),token(prefix+'surface'))>=3);
 }
 for(const state of ['action-hover','action-pressed'])assert.ok(contrast(token('on-action'),token(state))>=4.5);
});
test('dark values are staged without automatic activation over legacy page surfaces',()=>{
 assert.match(css,/color-scheme:light/);assert.doesNotMatch(css,/prefers-color-scheme|data-theme|color-scheme:dark/);
 assert.equal(token('canvas'),'#f4f5f3');assert.equal(token('action'),'#17614e');
});
test('shared stylesheet owns controls and chrome, not feature layouts or domain state',()=>{
 assert.doesNotMatch(foundation,/#[a-f\d]{3,8}\b/i);
 assert.doesNotMatch(foundation,/\.reward-card|\.evidence-calendar|\.career-command|\.rhythm-item-grid/);
 assert.match(foundation,/kryos-control-border/);assert.match(foundation,/kryos-focus/);
 assert.match(foundation,/prefers-reduced-motion/);assert.match(foundation,/forced-colors/);
});
test('asset order resolves existing tokens before shared and page adapters',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('visual-tokens.css')>html.indexOf('styles.css'));
 assert.ok(html.indexOf('visual-tokens.css')<html.indexOf('visual-foundation.css'));
 assert.ok(html.indexOf('visual-foundation.css')<html.indexOf('actions-rhythm-ui.css'));
});
test('historical banner names attribution without changing the date or saving domain data',()=>{
 const source=read('day-context.js');
 assert.match(source,/bar.dataset.dateMode/);
 assert.match(source,/Changes belong to this date, not today/);
 assert.match(source,/Return to today/);
 assert.match(source,/bar.hidden=currentPage==='marketing'/);
});

