import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('reward ownership lookup uses the authenticated owner scope',()=>{
 const source=readFileSync(new URL('../supabase/functions/kryos-rewards/index.ts',import.meta.url),'utf8');
 assert.match(source,/ownerClient\.from\('kryos_profiles'\)/);
 assert.match(source,/Authorization:`Bearer \$\{token\}`/);
 assert.match(source,/eq\('user_id',data\.user\.id\)/);
 assert.doesNotMatch(source,/admin\.from\('kryos_profiles'\)/);
});
