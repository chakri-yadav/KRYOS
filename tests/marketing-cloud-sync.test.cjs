const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('hosted Marketing excludes private batch storage from outgoing and incoming sync', () => {
 const app=fs.readFileSync('app.js','utf8'),vm=require('node:vm');
 const blocks=app.slice(app.indexOf('const SYNC_BLOCKS = ['),app.indexOf('const TASK_DOMAINS ='));
 assert.doesNotMatch(blocks,/key: "marketing"/);
 assert.ok(app.includes('const safeKeys = new Set(["foundation", "career", "tasks", "journal"])'));
 const code=app.slice(app.indexOf('function scheduleMarketingCloudSync()'),app.indexOf('async function flushCareerCloudSync()'));
 const context={window:{clearTimeout(){}},marketingSyncTimer:null,marketingSyncDirty:true,marketingSyncState:'saving'};vm.runInNewContext(code,context);
 context.scheduleMarketingCloudSync();assert.equal(context.marketingSyncDirty,false);assert.equal(context.marketingSyncState,'local');
 for(const call of ['.rpc(','.upsert(','writeVersionedBlock('])assert.ok(!code.includes(call));
 assert.doesNotMatch(app.slice(app.indexOf('function retryPendingCloudWrites()'),app.indexOf('async function startCloudFreshnessMonitor(')),/scheduleMarketingCloudSync/);
});

test('legacy server migration retains its revision-checked contract for compatibility, not active hosted UI sync', () => {
  const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
  const migration = fs.readFileSync('supabase/migrations/20261007120000_marketing_cloud_assistant_import.sql', 'utf8');
  assert.match(schema, /'journal', 'marketing', 'security'/);
  assert.match(migration, /p_block_key not in \('tasks', 'career', 'marketing'\)/);
  assert.match(migration, /where public\.kryos_sync_blocks\.revision = p_expected_revision/);
  assert.match(migration, /create or replace function public\.kryos_import_marketing_batch/);
  assert.match(migration, /to service_role/);
  assert.match(migration, /'marketing_revision', v_revision/);
});

test('legacy ingestion implementation remains transactional; current handoffs use aggregate stats instead', () => {
  const edge = fs.readFileSync('supabase/functions/kryos-ingest/index.ts', 'utf8');
  const projector = fs.readFileSync('supabase/functions/kryos-ingest/projector.mjs', 'utf8');
  assert.match(edge, /const marketingOnly = input\.operations\.length === 1/);
  assert.match(edge, /admin\.rpc\('kryos_import_marketing_batch'/);
  assert.match(edge, /p_expected_revision: Number\(marketing\?\.revision \|\| 0\)/);
  assert.match(edge, /marketingSynced: true/);
  assert.match(projector, /'marketing\.batch\.import'/);
  assert.match(projector, /function validateMarketingBatch\(batch\)/);
  assert.match(projector, /Marketing posting IDs must be unique/);
});
