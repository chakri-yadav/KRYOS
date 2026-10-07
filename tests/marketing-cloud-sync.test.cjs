const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Marketing batch data is part of the app sync and backup contracts', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  const marketing = fs.readFileSync('marketing.js', 'utf8');
  assert.match(app, /\{ key: "marketing", storageKey: "kryos-marketing-batches-v1" \}/);
  assert.match(app, /marketing:\s*\{[\s\S]*?value: marketingData/);
  assert.match(app, /const safeKeys = new Set\(\["foundation", "career", "tasks", "journal", "marketing"\]\)/);
  assert.match(app, /row\.block_key === "marketing"/);
  assert.match(app, /mergeMarketingSyncPayload\(localBlock\?\.value, row\.payload\)/);
  assert.match(app, /remoteBatchIds\.has\(String\(marketingActiveBatchId\)\)/);
  assert.match(app, /updatedKeys\.includes\("marketing"\)/);
  assert.match(app, /key: "marketing", title: "Marketing"/);
  assert.match(app, /function scheduleMarketingCloudSync\(\)/);
  assert.match(marketing, /function marketingWrite\(data\)[\s\S]*?scheduleMarketingCloudSync\(\)/);
  assert.match(marketing, /mergeMarketingSyncPayload/);
  assert.doesNotMatch(marketing, /browser-local records · not cloud or backup-synced/);
});

test('Supabase allows Marketing block writes only through the revision-checked writer', () => {
  const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
  const migration = fs.readFileSync('supabase/migrations/20261007120000_marketing_cloud_assistant_import.sql', 'utf8');
  assert.match(schema, /'journal', 'marketing', 'security'/);
  assert.match(migration, /p_block_key not in \('tasks', 'career', 'marketing'\)/);
  assert.match(migration, /where public\.kryos_sync_blocks\.revision = p_expected_revision/);
  assert.match(migration, /create or replace function public\.kryos_import_marketing_batch/);
  assert.match(migration, /to service_role/);
  assert.match(migration, /'marketing_revision', v_revision/);
});

test('assistant endpoint routes Marketing imports to the transactional idempotent RPC', () => {
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
