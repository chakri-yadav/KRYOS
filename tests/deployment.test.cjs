const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('deployment loads Supabase before KRYOS application code', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const supabase = html.indexOf('vendor/supabase.js?v=0.5.11');
  const app = html.indexOf('app.js?v=0.5.11');
  assert.ok(supabase >= 0, 'Supabase browser client is missing');
  assert.ok(supabase < app, 'Supabase must load before app.js');
});

test('cross-device freshness has realtime and fast foreground fallbacks', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
  assert.match(app, /postgres_changes/);
  assert.match(app, /setInterval[\s\S]*?5000/);
  assert.match(app, /\["actions", "career", "rhythm", "journal"\][\s\S]*?refreshCloudData/);
  assert.match(schema, /alter publication supabase_realtime add table public\.kryos_sync_blocks/);
});

test('fresh or stale phones recover newer completion evidence by sync block', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  const actions = fs.readFileSync('actions.js', 'utf8');
  assert.match(app, /remoteBlockVersions/);
  assert.match(app, /recoveryFromStaleLocal = !knownRemoteAt && remoteEvidence > localEvidence/);
  assert.match(app, /getSyncEvidenceScore\(row\.block_key/);
  assert.match(app, /remoteBlockVersions: \{ \.\.\.syncState\.remoteBlockVersions, career:/);
  assert.match(actions, /remoteBlockVersions: \{ \.\.\.syncState\.remoteBlockVersions, tasks:/);
});

test('Career startup reconciles cloud before migration autosave', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  assert.doesNotMatch(app, /if \(dsaRoadmapMigrated \|\| apiDesignRoadmapMigrated\)[\s\S]{0,180}setTimeout\(scheduleCareerCloudSync/);
  assert.match(app, /const recovery = await refreshCloudData\(\{ automatic: true \}\)/);
  assert.match(app, /pendingCareerMigrationSync && !recovery\.conflicts && !recovery\.error/);
});
