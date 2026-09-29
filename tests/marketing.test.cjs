const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadMarketing() {
  const storage = new Map();
  const listeners = {};
  const context = {
    console,
    Date,
    URL,
    Blob,
    JSON,
    Set,
    Array,
    String,
    Boolean,
    Number,
    document: {
      addEventListener: (name, listener) => { listeners[name] = listener; },
      querySelector: () => null,
      querySelectorAll: () => [],
    },
    getModeStorageValue: key => storage.get(key) || null,
    setModeStorageValue: (key, value) => storage.set(key, value),
    removeModeStorageValue: key => storage.delete(key),
    globalThis: null,
  };
  context.globalThis = context;
  const source = fs.readFileSync('marketing.js', 'utf8');
  vm.runInNewContext(`${source}\nglobalThis.__test = { MARKETING_SAMPLE_ROLES, marketingImport, marketingRead, marketingSafeUrl, renderMarketingView };`, context);
  return { api: context.__test, storage, listeners };
}

test('Marketing demo import covers ten fictional posting variations without creating real applications', () => {
  const { api, storage } = loadMarketing();
  assert.equal(api.MARKETING_SAMPLE_ROLES.length, 10);
  assert.equal(new Set(api.MARKETING_SAMPLE_ROLES.map(role => role.application.status)).size, 10);
  assert.ok(api.MARKETING_SAMPLE_ROLES.every(role => role.source_url.includes('.invalid')));
  assert.ok(api.MARKETING_SAMPLE_ROLES.some(role => role.sponsorship.startsWith('Unknown')));
  assert.ok(api.MARKETING_SAMPLE_ROLES.some(role => role.unknown_information.length > 0));
  assert.equal(api.marketingSafeUrl('javascript:alert(1)'), '#');
  assert.equal(api.marketingSafeUrl('https://jobs.example.invalid/role'), 'https://jobs.example.invalid/role');
  api.marketingImport({ format: 'kryos-marketing-batch', version: 1, name: 'Ten fictional test roles', demo: true, roles: api.MARKETING_SAMPLE_ROLES.map(role => ({ ...role, demo: true })) });
  const data = api.marketingRead();
  assert.equal(data.batches[0].roles.length, 10);
  assert.ok(data.batches[0].roles.every(role => role.demo && role.application.status));
  assert.match(api.renderMarketingView(), /DEMO BATCH · FICTIONAL DATA/);
  assert.match(api.renderMarketingView(), /Import 10 demo roles/);
  assert.match(api.renderMarketingView(), /Attach résumé/);
  assert.match(api.renderMarketingView(), /Download sample JSON/);
  assert.equal([...storage.keys()].length, 1, 'Marketing import writes only its own local record');
});

test('Marketing batch importer rejects malformed and duplicate records without saving them', () => {
  const { api, storage } = loadMarketing();
  assert.throws(() => api.marketingImport({ format: 'wrong', version: 1, roles: [] }), /KRYOS Marketing batch/);
  const repeated = [{ id: 'same', company: 'Demo', title: 'Role' }, { id: 'same', company: 'Demo', title: 'Role 2' }];
  assert.throws(() => api.marketingImport({ format: 'kryos-marketing-batch', version: 1, roles: repeated }), /unique ID/);
  assert.equal(storage.size, 0);
});

test('first Marketing visit imports the requested demo once and the remove action stays removed', () => {
  const { api, storage, listeners } = loadMarketing();
  const html = api.renderMarketingView();
  assert.match(html, /10-role feature test batch/);
  assert.equal(api.marketingRead().batches[0].roles.length, 10);
  const event = { target: { closest: selector => selector === '[data-marketing-remove-demo]' ? {} : null } };
  listeners.click(event);
  return new Promise(resolve => setTimeout(() => {
    assert.equal(api.marketingRead().batches.length, 0);
    assert.equal(storage.get('kryos-marketing-demo-dismissed-v1'), 'true');
    assert.match(api.renderMarketingView(), /No active batch/);
    resolve();
  }, 0));
});

test('Marketing workspace exposes the full posting record and application tracking fields', () => {
  const source = fs.readFileSync('marketing.js', 'utf8');
  for (const field of ['raw_description', 'unknown_information', 'source_url', 'posted_at', 'salary', 'sponsorship', 'resume_version', 'contact_email', 'contact_phone', 'linkedin_url', 'applied_date']) {
    assert.match(source, new RegExp(field));
  }
  assert.match(source, /data-marketing-import-file/);
  assert.match(source, /data-marketing-remove-demo/);
  assert.match(source, /kryos-marketing-resume-files-v1/);
  const app = fs.readFileSync('app.js', 'utf8');
  assert.match(app, /removeModeStorageValue\("kryos-marketing-batches-v1", modeName\)/);
  assert.match(app, /marketingClearFiles\(modeName\)/);
});
