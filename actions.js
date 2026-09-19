const ACTION_PRIORITIES = ['critical', 'important', 'normal'];
const ACTION_STATUSES = ['open', 'active', 'waiting', 'done'];
let actionFilter = 'open';
let actionSyncTimer = null;
let actionSyncRunning = false;
let actionSyncDirty = false;
let actionSyncState = 'local';

function actionVault() { return lifeStore().actions; }
function actionPriorityLabel(priority) { return priority.charAt(0).toUpperCase() + priority.slice(1); }
function actionStatusLabel(status) { return status.charAt(0).toUpperCase() + status.slice(1); }
function actionCount(status) { return actionVault().filter(action => action.status === status).length; }

function actionSort(left, right) {
  const rank = { critical: 0, important: 1, normal: 2 };
  return (rank[left.priority] - rank[right.priority]) || (left.deadline || '9999').localeCompare(right.deadline || '9999') || left.createdAt.localeCompare(right.createdAt);
}

function actionDeadline(action) {
  if (!action.deadline) return null;
  const today = getDateFromKey(toDateKey());
  const due = getDateFromKey(action.deadline);
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return { tone: 'overdue', label: `${Math.abs(days)}d overdue` };
  if (days === 0) return { tone: 'today', label: 'Due today' };
  if (days === 1) return { tone: 'soon', label: 'Due tomorrow' };
  const label = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return { tone: days <= 7 ? 'soon' : 'future', label };
}

function actionSummary() {
  const actions = actionVault().filter(action => action.status !== 'archived');
  const today = getDateFromKey(toDateKey());
  return {
    open: actions.filter(action => action.status !== 'done').length,
    active: actions.filter(action => action.status === 'active').length,
    dueSoon: actions.filter(action => {
      if (!action.deadline || action.status === 'done') return false;
      const days = Math.round((getDateFromKey(action.deadline) - today) / 86400000);
      return days >= 0 && days <= 7;
    }).length,
    overdue: actions.filter(action => action.deadline && action.deadline < toDateKey() && action.status !== 'done').length,
  };
}

function renderActionCard(action) {
  const deadline = actionDeadline(action);
  const priority = action.priority !== 'normal' ? `<span class="action-priority ${action.priority}">${actionPriorityLabel(action.priority)}</span>` : '';
  return `<article class="action-card priority-${action.priority} status-${action.status}" data-action-id="${action.id}">
    <button class="action-check" data-action-command="${action.status === 'done' ? 'reopen' : 'done'}" data-id="${action.id}" aria-label="${action.status === 'done' ? 'Reopen' : 'Complete'} ${escapeHtml(action.title)}"><span aria-hidden="true">&#10003;</span></button>
    <div class="action-main"><div class="action-meta"><span class="action-domain">${escapeHtml(action.domain)}</span>${priority}${deadline ? `<time class="deadline-${deadline.tone}" datetime="${escapeHtml(action.deadline)}">${escapeHtml(deadline.label)}</time>` : '<span class="action-undated">No deadline</span>'}</div><h3>${escapeHtml(action.title)}</h3>${action.nextAction ? `<p><span>Next step</span>${escapeHtml(action.nextAction)}</p>` : ''}</div>
    <div class="action-controls"><label><span class="sr-only">Status for ${escapeHtml(action.title)}</span><select data-action-status data-id="${action.id}" class="status-${action.status}">${ACTION_STATUSES.map(status => `<option value="${status}" ${status === action.status ? 'selected' : ''}>${actionStatusLabel(status)}</option>`).join('')}</select></label><button class="icon-button action-edit" data-action-command="edit" data-id="${action.id}" aria-label="Edit ${escapeHtml(action.title)}" title="Edit action">&#9998;</button></div>
  </article>`;
}

function actionCapacity(activeCount) {
  return [0, 1, 2].map(index => `<i class="${index < activeCount ? 'filled' : ''}"></i>`).join('');
}

function actionSyncLabel() {
  const labels = { local: 'Saved on device', saving: 'Saving changes', synced: 'Saved to cloud', error: 'Saved locally - cloud unavailable' };
  return labels[actionSyncState] || labels.local;
}

function updateActionSyncIndicator() {
  const indicator = document.querySelector('#action-sync-state');
  if (!indicator) return;
  indicator.className = `action-sync-state state-${actionSyncState}`;
  indicator.innerHTML = `<i></i>${escapeHtml(actionSyncLabel())}`;
}

function scheduleTaskCloudSync() {
  if (typeof isDemoMode === 'function' && isDemoMode()) return;
  actionSyncDirty = true;
  actionSyncState = 'saving';
  updateActionSyncIndicator();
  window.clearTimeout(actionSyncTimer);
  actionSyncTimer = window.setTimeout(flushTaskCloudSync, 900);
}

async function flushTaskCloudSync() {
  if (actionSyncRunning || !actionSyncDirty) return;
  actionSyncRunning = true;
  actionSyncDirty = false;
  try {
    const session = await refreshSyncAuthState({ silent: true });
    if (!session) {
      actionSyncState = 'local';
      return;
    }
    const client = getSupabaseClient();
    const profileId = await ensureSupabaseProfile(session);
    const taskBlock = getSyncBlockPayloads().find(block => block.block_key === 'tasks');
    const { error } = await client.from('kryos_sync_blocks').upsert([{ ...taskBlock, profile_id: profileId, updated_at: new Date().toISOString() }], { onConflict: 'profile_id,block_key' });
    if (error) throw error;
    syncState = { ...syncState, enabled: true, endpointConfigured: true, status: 'connected', lastSyncAt: new Date().toISOString(), lastAttemptAt: new Date().toISOString(), remoteProfileId: profileId, userEmail: session.user.email || syncState.userEmail, userId: session.user.id };
    saveSyncState();
    actionSyncState = 'synced';
  } catch (error) {
    console.warn('KRYOS action auto-sync failed.', error);
    actionSyncState = 'error';
  } finally {
    actionSyncRunning = false;
    updateActionSyncIndicator();
    if (actionSyncDirty) scheduleTaskCloudSync();
  }
}

function actionEditor() {
  return `<dialog class="action-dialog" id="action-edit-dialog"><form id="action-edit-form"><input type="hidden" name="actionId"><header><div><p class="section-kicker">EDIT ACTION</p><h2>Refine the commitment</h2></div><button type="button" class="dialog-close" data-dialog-close aria-label="Close editor" title="Close">&times;</button></header><div class="action-edit-fields"><label class="wide">Action<input name="title" required maxlength="180"></label><label class="wide">Smallest next action<input name="nextAction" maxlength="240"></label><label>Domain<select name="domain">${lifeOptions(LIFE_DOMAINS)}</select></label><label>Priority<select name="priority">${ACTION_PRIORITIES.map(priority => `<option value="${priority}">${actionPriorityLabel(priority)}</option>`).join('')}</select></label><label>Status<select name="status">${ACTION_STATUSES.map(status => `<option value="${status}">${actionStatusLabel(status)}</option>`).join('')}</select></label><label>Real deadline<input name="deadline" type="date"></label></div><footer><button type="button" class="secondary-button" data-dialog-close>Cancel</button><button type="submit" class="primary-button">Save changes</button></footer></form></dialog>`;
}

function renderActionVault() {
  const actions = [...actionVault()].sort(actionSort);
  const visible = actionFilter === 'all' ? actions.filter(action => action.status !== 'archived') : actions.filter(action => action.status === actionFilter);
  const summary = actionSummary();
  const attention = summary.overdue ? `${summary.overdue} overdue` : summary.dueSoon ? `${summary.dueSoon} due this week` : 'Field is clear';
  actionsView.innerHTML = `<header class="action-title"><div><p class="section-kicker">KRYOS / ACTION VAULT</p><h1>The next right actions.</h1><p>Important commitments stay visible without occupying your mind.</p><span id="action-sync-state" class="action-sync-state state-${actionSyncState}"><i></i>${escapeHtml(actionSyncLabel())}</span></div><div class="action-open-count"><strong>${summary.open}</strong><span>open commitments</span><small class="${summary.overdue ? 'has-overdue' : ''}">${attention}</small></div></header>
    <section class="action-command"><div class="action-command-copy"><span>ACTIVE FIELD</span><h2>${summary.active ? `${summary.active} commitment${summary.active === 1 ? '' : 's'} in motion` : 'Choose what moves now'}</h2><p>Only three actions can compete for active attention.</p></div><div class="capacity-visual"><div>${actionCapacity(summary.active)}</div><strong>${summary.active}<span>/3</span></strong><small>active capacity</small></div><div class="action-command-rule"><span>CONTAINMENT RULE</span><p>Open keeps it remembered. Active means you are acting on it now.</p></div></section>
    <section class="action-toolbar"><nav class="action-filters" aria-label="Action status">${['open','active','waiting','done','all'].map(status => `<button class="${actionFilter === status ? 'active' : ''}" data-action-filter="${status}">${status === 'all' ? 'All' : actionStatusLabel(status)} <span>${status === 'all' ? actions.filter(action => action.status !== 'archived').length : actionCount(status)}</span></button>`).join('')}</nav><details class="action-add"><summary><span aria-hidden="true">+</span> New action</summary><form id="action-add-form"><label class="wide">Action<input name="title" required maxlength="180" placeholder="What must remain remembered?"></label><label class="wide">Smallest next action<input name="nextAction" maxlength="240" placeholder="The first physical step"></label><label>Domain<select name="domain">${lifeOptions(LIFE_DOMAINS)}</select></label><label>Priority<select name="priority"><option value="critical">Critical</option><option value="important">Important</option><option value="normal" selected>Normal</option></select></label><label>Real deadline<input name="deadline" type="date"></label><button class="primary-button">Keep in Vault</button></form></details></section>
    <section class="action-list" aria-live="polite">${visible.map(renderActionCard).join('') || `<div class="action-empty"><span>&#10003;</span><strong>No ${actionFilter} actions</strong><p>Nothing is asking for your attention in this view.</p></div>`}</section>${actionEditor()}`;
}

function updateActionStatus(action, status) {
  if (status === 'active' && action.status !== 'active' && actionCount('active') >= 3) {
    alert('Active is full. Move one of the three active actions before choosing another.');
    return false;
  }
  action.status = status;
  action.completedAt = status === 'done' ? new Date().toISOString() : null;
  action.updatedAt = new Date().toISOString();
  saveTasks();
  return true;
}

function openActionEditor(action) {
  const dialog = document.querySelector('#action-edit-dialog');
  const form = dialog.querySelector('form');
  form.elements.actionId.value = action.id;
  form.elements.title.value = action.title;
  form.elements.nextAction.value = action.nextAction || '';
  form.elements.domain.value = action.domain;
  form.elements.priority.value = action.priority;
  form.elements.status.value = action.status;
  form.elements.deadline.value = action.deadline || '';
  dialog.showModal();
  form.elements.title.focus();
}

document.addEventListener('submit', event => {
  if (event.target.id === 'action-add-form') {
    event.preventDefault();
    const form = new FormData(event.target);
    actionVault().push({ id: createId(), externalId: `manual-${createId()}`, title: form.get('title').trim(), nextAction: form.get('nextAction').trim(), domain: form.get('domain'), priority: form.get('priority'), deadline: form.get('deadline'), status: 'open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null });
    saveTasks();
    renderActionVault();
  }
  if (event.target.id === 'action-edit-form') {
    event.preventDefault();
    const form = new FormData(event.target);
    const action = actionVault().find(item => item.id === form.get('actionId'));
    if (!action || !updateActionStatus(action, form.get('status'))) return;
    action.title = form.get('title').trim();
    action.nextAction = form.get('nextAction').trim();
    action.domain = form.get('domain');
    action.priority = form.get('priority');
    action.deadline = form.get('deadline');
    action.updatedAt = new Date().toISOString();
    saveTasks();
    document.querySelector('#action-edit-dialog').close();
    renderActionVault();
  }
});

document.addEventListener('change', event => {
  if (!event.target.matches('[data-action-status]')) return;
  const action = actionVault().find(item => item.id === event.target.dataset.id);
  if (action && !updateActionStatus(action, event.target.value)) renderActionVault();
  else renderActionVault();
});

document.addEventListener('click', event => {
  const dialogClose = event.target.closest('[data-dialog-close]');
  if (dialogClose) { dialogClose.closest('dialog')?.close(); return; }
  const filter = event.target.closest('[data-action-filter]');
  if (filter) { actionFilter = filter.dataset.actionFilter; renderActionVault(); return; }
  const button = event.target.closest('[data-action-command]');
  if (!button) return;
  const action = actionVault().find(item => item.id === button.dataset.id);
  if (!action) return;
  if (button.dataset.actionCommand === 'done') updateActionStatus(action, 'done');
  if (button.dataset.actionCommand === 'reopen') updateActionStatus(action, 'open');
  if (button.dataset.actionCommand === 'edit') { openActionEditor(action); return; }
  renderActionVault();
});
