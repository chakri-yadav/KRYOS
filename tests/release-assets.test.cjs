const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('all bundled browser assets share the canonical release cache key',()=>{
 const app=fs.readFileSync('app.js','utf8'),html=fs.readFileSync('index.html','utf8'),version=app.match(/const APP_VERSION = "([^"]+)"/)[1];
 const assets=[...html.matchAll(/(?:href|src)="([^":]+\?v=([^"&]+))"/g)];
 assert.ok(assets.length>30);for(const [,file,key] of assets)assert.equal(key,version,file+' uses a different release key');
});
