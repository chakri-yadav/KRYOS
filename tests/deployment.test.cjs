const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('deployment loads Supabase before KRYOS application code', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const supabase = html.indexOf('vendor/supabase.js?v=0.004.023');
  const app = html.indexOf('app.js?v=0.004.023');
  assert.ok(supabase >= 0, 'Supabase browser client is missing');
  assert.ok(supabase < app, 'Supabase must load before app.js');
});
