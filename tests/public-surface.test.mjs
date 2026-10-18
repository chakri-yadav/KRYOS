import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {checkText,scanPublicFiles} from '../scripts/check-public-surface.mjs';
test('publication check blocks prohibited branding and user-home paths without echoing contents',()=>{
 const brand=String.fromCharCode(99,111,100,101,120);
 assert.deepEqual(checkText(brand),['tooling-brand']);
 assert.deepEqual(checkText('D:'+String.fromCharCode(92)+'Users'+String.fromCharCode(92)+'example'+String.fromCharCode(92)+'project'),['user-home-path']);
 assert.deepEqual(checkText('Sensitive fixture',['sensitive']),['private-vocabulary']);
 assert.deepEqual(checkText('cross-device records and GET /users/{id}'),[]);
});
test('current public tree contains no prohibited branding or machine paths',()=>{
 assert.deepEqual(scanPublicFiles({cwd:fileURLToPath(new URL('..',import.meta.url))}),[]);
});
