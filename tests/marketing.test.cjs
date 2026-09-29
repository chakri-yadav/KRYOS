const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadMarketing(options = {}) {
  const storage = new Map();
  const listeners = {};
  let failStorageWrite = false;
  const blobs = new Map();
  const database = {
    createObjectStore: () => ({}),
    transaction: () => {
      const tx = { error: null, objectStore: () => ({
        put: record => { if (options.failIdbWrite) { tx.error = Object.assign(new Error('Quota exceeded'), { name: 'QuotaExceededError' }); setTimeout(() => tx.onerror?.(), 0); } else { blobs.set(record.id, record); setTimeout(() => tx.oncomplete?.(), 0); } },
        get: id => { const request = {}; setTimeout(() => { request.result = blobs.get(id); request.onsuccess?.(); }, 0); return request; },
        delete: id => { blobs.delete(id); setTimeout(() => tx.oncomplete?.(), 0); },
      }) };
      return tx;
    },
  };
  const indexedDB = options.noIndexedDb ? undefined : { open: () => { const request = {}; setTimeout(() => { if (options.failOpen) { request.error = new Error('IndexedDB unavailable'); request.onerror?.(); } else { request.result = database; request.onupgradeneeded?.(); request.onsuccess?.(); } }, 0); return request; } };
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
    getModeStorageKey: key => key,
    setModeStorageValue: (key, value) => { if (failStorageWrite) throw Object.assign(new Error('Storage full'), { name: 'QuotaExceededError' }); storage.set(key, value); },
    removeModeStorageValue: key => storage.delete(key),
    globalThis: null,
    indexedDB,
    __setStorageFailure: value => { failStorageWrite = value; },
  };
  context.globalThis = context;
  const source = fs.readFileSync('marketing.js', 'utf8');
  vm.runInNewContext(`${source}\nglobalThis.__test = { MARKETING_SAMPLE_ROLES, marketingImport, marketingRead, marketingSafeUrl, renderMarketingView, marketingValidateAttachment, marketingSaveAttachment, marketingGetFile, marketingRemoveAttachment, marketingFileId };`, context);
  return { api: context.__test, storage, listeners, blobs, failStorageWrite: value => context.__setStorageFailure(value) };
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
  assert.match(api.renderMarketingView(), /<strong>4<\/strong><span>In application process<\/span>/);
  assert.match(api.renderMarketingView(), /Files for this application/);
  assert.match(api.renderMarketingView(), /Portfolio \/ work sample/);
  assert.match(api.renderMarketingView(), /Download sample JSON/);
  assert.equal([...storage.keys()].length, 1, 'Marketing import writes only its own local record');
});

test('Marketing upload rejects absent, empty, oversized, and unsupported files before storage', () => {
  const { api } = loadMarketing();
  assert.throws(() => api.marketingValidateAttachment(null), /Choose a file/);
  assert.throws(() => api.marketingValidateAttachment({ name: 'empty.pdf', size: 0 }), /empty/);
  assert.throws(() => api.marketingValidateAttachment({ name: 'large.pdf', size: 10 * 1024 * 1024 + 1 }), /10 MB/);
  assert.throws(() => api.marketingValidateAttachment({ name: 'payload.exe', size: 10 }), /not supported/);
  assert.throws(() => api.marketingValidateAttachment({ name: 'missing-extension', size: 10 }), /not supported/);
  assert.equal(api.marketingValidateAttachment({ name: 'Résumé.PDF', type: 'application/pdf', size: 10 }), true);
});

test('Marketing attachment saves per-job metadata and binary separately, then downloads/removes cleanly', async () => {
  const { api, blobs } = loadMarketing();
  api.marketingImport({ format: 'kryos-marketing-batch', version: 1, name: 'Upload test', roles: [{ id: 'upload-role', company: 'Example', title: 'Analyst', application: { resume_version: 'Analyst-v4' } }] });
  const file = { name: 'analyst-v4.pdf', type: 'application/pdf', size: 42 };
  await api.marketingSaveAttachment('upload-role', file, 'Résumé', 'Analyst résumé');
  const metadata = api.marketingRead().batches[0].roles[0].application.attachments[0];
  assert.equal(metadata.title, 'Analyst résumé');
  assert.equal(metadata.resumeVersion, 'Analyst-v4');
  assert.equal(metadata.name, file.name);
  assert.equal(JSON.stringify(api.marketingRead()).includes('analyst-v4.pdf'), true, 'only attachment metadata is in Marketing storage');
  assert.equal(blobs.size, 1);
  assert.equal((await api.marketingGetFile(api.marketingFileId('upload-role', metadata.id))).blob, file);
  await api.marketingRemoveAttachment('upload-role', metadata.id);
  assert.equal(api.marketingRead().batches[0].roles[0].application.attachments.length, 0);
  assert.equal(blobs.size, 0);
});

test('Marketing upload failures do not create a false attachment record or leave its binary behind', async () => {
  const openFailure = loadMarketing({ failOpen: true });
  openFailure.api.marketingImport({ format: 'kryos-marketing-batch', version: 1, roles: [{ id: 'role', company: 'Example', title: 'Analyst' }] });
  await assert.rejects(openFailure.api.marketingSaveAttachment('role', { name: 'cv.pdf', size: 42 }, 'Résumé'), /IndexedDB unavailable/);
  assert.equal(openFailure.api.marketingRead().batches[0].roles[0].application.attachments, undefined);

  const quotaFailure = loadMarketing({ failIdbWrite: true });
  quotaFailure.api.marketingImport({ format: 'kryos-marketing-batch', version: 1, roles: [{ id: 'role', company: 'Example', title: 'Analyst' }] });
  await assert.rejects(quotaFailure.api.marketingSaveAttachment('role', { name: 'cv.pdf', size: 42 }, 'Résumé'), /10 MB|storage|saved/i);
  assert.equal(quotaFailure.api.marketingRead().batches[0].roles[0].application.attachments, undefined);

  const storageFailure = loadMarketing();
  storageFailure.api.marketingImport({ format: 'kryos-marketing-batch', version: 1, roles: [{ id: 'role', company: 'Example', title: 'Analyst' }] });
  storageFailure.failStorageWrite(true);
  await assert.rejects(storageFailure.api.marketingSaveAttachment('role', { name: 'cv.pdf', size: 42 }, 'Résumé'), /Browser storage|not recorded/i);
  assert.equal(storageFailure.blobs.size, 0, 'a failed metadata write cleans up the saved binary');
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

test('Marketing premium visuals preserve every stage and make browser-local storage explicit', () => {
  const { api } = loadMarketing();
  api.marketingImport({ format: 'kryos-marketing-batch', version: 1, name: 'Visual check', demo: false, roles: api.MARKETING_SAMPLE_ROLES.map(role => ({ ...role, demo: false })) });
  const html = api.renderMarketingView();
  for (const status of ['to-review', 'saved', 'applied', 'interview', 'follow-up', 'offer', 'not-selected', 'keep-for-later', 'archived', 'verify-details']) {
    assert.match(html, new RegExp(`marketing-status-pill status-${status}`));
  }
  assert.match(html, /KRYOS ACCOUNT/);
  assert.match(html, /Marketing batches and files stay in this browser/);
  assert.match(html, /Read full captured posting/);
  assert.match(html, /marketing-detail-overview/);
  assert.match(html, /What you’ll do/);
  assert.match(html, /Unknown or verify/);
  assert.match(html, /<fieldset class="marketing-form-group"><legend>Progress<\/legend>/);
  assert.match(html, /<fieldset class="marketing-form-group"><legend>Contact details used<\/legend>/);
  assert.match(html, /marketing-attachments/);
  const css = fs.readFileSync('marketing.css', 'utf8');
  assert.match(css, /\.marketing-batch-card[\s\S]*?linear-gradient\(118deg/);
  assert.match(css, /\.marketing-role-summary:focus-visible/);
  assert.match(css, /\.marketing-application-fields input[\s\S]*?min-height: 44px/);
});
