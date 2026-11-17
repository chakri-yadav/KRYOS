(() => {
  const laptop = location.hostname === '127.0.0.1' && location.port === '4173';
  const endpoint = '/api/hr-contacts';
  const fields = {name:'Name', company:'Company', role:'Role', email:'Work email', phone:'Phone', linkedin:'LinkedIn URL', note:'How I know them', next:'Next step', due:'Follow-up date'};
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let records = [], selected = '', linkedJob = '', filter = 'active', query = '', session, busy = false;
  let editingRevision = 0;
  const canonical = value => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key,canonical(value[key])]))
      : value;
  const samePayload = (a,b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
  const node = () => document.querySelector('[data-hr-directory]');
  const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Chicago'}).format(new Date());
  async function local(method = 'GET', body) {
    const res = await fetch(endpoint,{method,headers:{'Content-Type':'application/json'},body:body && JSON.stringify(body)});
    const result = await res.json();
    if (!res.ok) throw Error(result.error || 'Laptop storage is unavailable.');
    return result;
  }
  async function cloudList() {
    const client = getSupabaseClient();
    session = await getSupabaseSession();
    if (!session?.user) throw Error('Sign in through Cloud settings to open the synced directory.');
    const rows = [];
    for (let offset = 0;; offset += 500) {
      const {data,error} = await client.from('hr_contacts').select('id,revision,payload').eq('owner',session.user.id).order('id').range(offset,offset+499);
      if (error) throw Error(error.message);
      rows.push(...data);
      if (data.length < 500) return rows;
    }
  }
  async function cloudWrite(id, payload, base) {
    const active = await getSupabaseSession();
    if (!session?.user || active?.user?.id !== session.user.id) throw Error('Your account changed. Reopen HR Contacts to continue.');
    const table = getSupabaseClient().from('hr_contacts');
    const owner = session.user.id;
    const write = base ? table.update({payload,revision:base+1}).eq('owner',owner).eq('id',id).eq('revision',base)
      : table.insert({owner,id,payload,revision:1});
    const {data,error} = await write.select('id,revision,payload').maybeSingle();
    if (error) throw Error(error.code === '23505' ? 'Cloud contact changed. Refresh and review both versions.' : error.message);
    if (!data) throw Error('Cloud contact changed. Refresh and review both versions.');
    return data;
  }
  function message(value) {
    const status = node()?.querySelector('[data-hr-status]');
    if (status) status.textContent = value;
  }
  async function load() {
    records = laptop ? await local() : await cloudList();
    drawList();
    message(laptop ? 'Saved on this laptop.' : 'Connected to your account.');
  }
  function drawList() {
    const list = node()?.querySelector('[data-hr-list]');
    if (!list) return;
    const rows = records.filter(({payload:p,dirty}) => (filter === 'pending' ? dirty : !p.deleted && (filter === 'archive' ? p.archived : !p.archived))
      && (filter !== 'due' || (p.due && p.due <= today()))
      && [p.name,p.company,p.role,p.email,p.phone,p.linkedin].some(v => String(v || '').toLowerCase().includes(query)))
      .sort((a,b) => filter === 'due' ? a.payload.due.localeCompare(b.payload.due) : label(a.payload).localeCompare(label(b.payload)));
    list.innerHTML = rows.map(({id,dirty,payload:p}) => '<button type="button" class="hr-result" data-hr-open="'+escape(id)+'"><strong>'+escape(label(p))+'</strong><span>'+escape([p.company,p.due && 'Follow up '+p.due,false].filter(Boolean).join(' · ') || p.note || p.role || '')+'</span></button>').join('') || '<p class="hr-empty">No contacts in this view.</p>';
  }
  const label = p => p.name || p.email || p.phone || p.linkedin || (p.deleted ? 'Pending deletion' : '');
  function edit(id = '') {
    selected = id;
    const row = records.find(item => item.id === id);
    editingRevision = row?.revision || 0;
    const p = row?.payload || {};
    const form = node().querySelector('[data-hr-form]');
    form.hidden = false;
    form.innerHTML = '<h3>'+escape(id ? label(p) : 'New contact')+'</h3><div class="hr-fields">'+Object.entries(fields).map(([k,v]) => '<label>'+v+'<input name="'+k+'" '+(k==='due'?'type="date"':'')+' maxlength="500" value="'+escape(p[k])+'"></label>').join('')+'</div>'
      + (!id ? '<details><summary>Paste contact details</summary><textarea name="paste" aria-label="Contact details" maxlength="4000"></textarea><button type="button" data-hr-parse>Preview fields</button></details>' : '')
      + (laptop && linkedJob ? '<p>Save to link this contact to the selected job.</p>' : '')
      + (laptop && row?.jobIds?.length ? '<p>Linked jobs: '+escape(row.jobIds.map(jobId=>{const job=marketingRoleById(jobId);return job ? job.company+' · '+job.title : 'Saved job';}).join(', '))+'</p>' : '')
      + '<div class="hr-actions">'+(p.deleted?'':'<button class="secondary-button" type="submit">Save contact</button>')+'<button type="button" data-hr-close>Close</button>'
      + (id ? '<button type="button" data-hr-archive>'+(p.archived?'Restore':'Archive')+'</button><button type="button" data-hr-delete>Delete</button>'
        :'')+'</div>'
      + (id ? '<section><h4>Interaction history</h4>'+ (p.events || []).slice().reverse().map(e=>'<p><strong>'+escape(e.date+' · '+e.type)+'</strong> '+escape(e.note)+'</p>').join('')
        +'<div class="hr-fields"><label>Interaction<select name="kind"><option>Email</option><option>Call</option><option>Meeting</option><option>Reply</option><option>Note</option></select></label><label>Summary<input name="interaction" maxlength="500"></label></div><button type="button" data-hr-log>Log interaction</button></section>':'');
    form.querySelector('input')?.focus();
  }
  async function save(payload,id = selected,jobIds) {
    const row = records.find(item => item.id === id);
    if (id === selected && (row?.revision || 0) !== editingRevision) throw Error('This contact changed. Close and reopen it before saving.');
    if (laptop) await local('POST',{id,payload,expected:row?.revision || 0,cloudRevision:row?.cloudRevision || 0,account:row?.account,dirty:true,jobIds});
    else await cloudWrite(id,payload,row?.revision || 0);
    await load();
    message(laptop ? 'Saved on this laptop.' : 'Saved to your account.');
  }
  async function run(action) {
    if (busy) return;
    busy = true;
    node()?.setAttribute('aria-busy','true');
    try { await action(); } catch(error) { message(error.message); } finally {
      busy = false;
      node()?.removeAttribute('aria-busy');
    }
  }
  document.addEventListener('input', e => {
    if (!e.target.matches('[data-hr-search]')) return;
    query = e.target.value.trim().toLowerCase();
    drawList();
  });
  document.addEventListener('change', e => {
    if (!e.target.matches('[data-hr-filter]')) return;
    filter = e.target.value;
    drawList();
  });
  document.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (busy) return;
    if (laptop && button?.dataset.hrLinkJob && node()) {
      linkedJob = button.dataset.hrLinkJob;
      node().querySelector('[data-hr-panel]').hidden = false;
      node().querySelector('[data-hr-toggle]').setAttribute('aria-expanded','true');
      node().scrollIntoView({block:'start'});
      node().querySelector('[data-hr-search]').focus();
      run(async()=>{await load(); message('Open an existing contact or add a new one to link it to this job.');});
      return;
    }
    if (!button?.closest('[data-hr-directory]')) return;
    const d = button.dataset;
    if ('hrToggle' in d) {
      const panel = node().querySelector('[data-hr-panel]');
      panel.hidden = !panel.hidden;
      linkedJob = '';
      filter = node().querySelector('[data-hr-filter]').value;
      query = node().querySelector('[data-hr-search]').value.trim().toLowerCase();
      button.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) {
        records = [];
        selected = '';
        node().querySelector('[data-hr-form]').hidden = true;
        drawList();
        run(load);
      }
    }
    if ('hrAdd' in d) edit();
    if (d.hrOpen) edit(d.hrOpen);
    if ('hrClose' in d) node().querySelector('[data-hr-form]').hidden = true;

    const form = node().querySelector('[data-hr-form]');
    if ('hrParse' in d) {
      const input = form.elements.paste.value;
      const matches = {email:input.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i), phone:input.match(/(?:\+?\d[\d ().-]{7,}\d)/), linkedin:input.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s<>]+/i)};
      for (const [key,match] of Object.entries(matches)) if (match && !form.elements[key].value) form.elements[key].value = match[0];
      message('Review the recognized fields before saving.');
    }
    const row = records.find(item => item.id === selected);
    if (!row) return;
    if ('hrArchive' in d) run(async()=>{ await save({...row.payload,archived:!row.payload.archived}); edit(row.id); });
    if ('hrDelete' in d && confirm('Permanently delete this contact and its interaction history?')) run(async()=>{
      await save({deleted:true}); form.hidden = true;
    });
    if ('hrLog' in d) run(async()=>{
      const note = form.elements.interaction.value.trim();
      if (!note) throw Error('Enter an interaction summary.');
      await save({...row.payload,...Object.fromEntries(Object.keys(fields).map(key=>[key,form.elements[key].value.trim()])),events:[...(row.payload.events || []),{id:crypto.randomUUID(),date:today(),type:form.elements.kind.value,note}]});
      edit(row.id);
    });
  });
  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-hr-form]')) return;
    e.preventDefault();
    run(async()=>{
      const row = records.find(item=>item.id===selected);
      if (row?.payload.deleted) throw Error('Resolve the pending deletion before editing this contact.');
      const data = new FormData(e.target);
      const payload = {...row?.payload,...Object.fromEntries(Object.keys(fields).map(k=>[k,String(data.get(k)||'').trim()]))};
      if (!label(payload)) throw Error('Add a name, email, phone, or LinkedIn URL.');
      const duplicate = records.find(item=>item.id!==selected && !item.payload.deleted && ['email','linkedin'].some(k=>payload[k] && payload[k].toLowerCase().replace(/\/$/,'')===String(item.payload[k]||'').toLowerCase().replace(/\/$/,'')));
      if (duplicate && !confirm('A contact already uses this email or LinkedIn URL. Save separately?')) return edit(duplicate.id);
      const id = selected || crypto.randomUUID();
      await save(payload,id,linkedJob ? [...new Set([...(row?.jobIds||[]),linkedJob])] : undefined);
      linkedJob = '';
      edit(id);
      message('Contact saved.');
      node()?.querySelector('[data-hr-add]')?.focus();
    });
  });
  window.kryosHRContacts = () => '<section class="hr-directory" data-hr-directory><button type="button" class="secondary-button" data-hr-toggle aria-expanded="false">HR Contacts</button><div data-hr-panel hidden><header class="hr-heading"><p class="marketing-section-label">RECRUITING DIRECTORY</p><h2>HR Contacts</h2><p>Save recruiters and hiring contacts, then pick up where you left off.</p></header><div class="hr-actions"><button type="button" class="secondary-button" data-hr-add>Add contact</button></div><p role="status" data-hr-status></p><div class="hr-fields"><label>Search contacts<input type="search" data-hr-search placeholder="Name, company, email or phone"></label><label>View<select data-hr-filter><option value="active">All contacts</option><option value="due">Follow-ups due</option><option value="archive">Archive</option></select></label></div><form data-hr-form hidden></form><div data-hr-list></div></div></section>';
})();
