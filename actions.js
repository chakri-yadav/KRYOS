const ACTION_PRIORITIES = ['critical', 'important', 'normal'];
const ACTION_STATUSES = ['open', 'active', 'waiting', 'done'];
let actionFilter = 'open';

function actionVault() {
  return lifeStore().actions;
}

function actionPriorityLabel(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function actionStatusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function actionCount(status) {
  return actionVault().filter(action => action.status === status).length;
}

function actionSort(left, right) {
  const rank = { critical: 0, important: 1, normal: 2 };
  return (rank[left.priority] - rank[right.priority]) || (left.deadline || '9999').localeCompare(right.deadline || '9999') || left.createdAt.localeCompare(right.createdAt);
}

function renderActionCard(action) {
  const overdue = action.deadline && action.deadline < toDateKey() && action.status !== 'done';
  return `<article class="action-card priority-${action.priority} ${action.status === 'done' ? 'done' : ''}" data-action-id="${action.id}">
    <button class="action-check" data-action-command="${action.status === 'done' ? 'reopen' : 'done'}" data-id="${action.id}" aria-label="${action.status === 'done' ? 'Reopen' : 'Complete'} ${escapeHtml(action.title)}">${action.status === 'done' ? '&#10003;' : ''}</button>
    <div class="action-main"><div class="action-meta"><span class="action-priority">${actionPriorityLabel(action.priority)}</span><span>${escapeHtml(action.domain)}</span>${action.deadline ? `<time class="${overdue ? 'overdue' : ''}">${escapeHtml(action.deadline)}</time>` : ''}</div><h3>${escapeHtml(action.title)}</h3>${action.nextAction ? `<p><strong>Next:</strong> ${escapeHtml(action.nextAction)}</p>` : ''}</div>
    <div class="action-controls"><select data-action-status data-id="${action.id}" aria-label="Status for ${escapeHtml(action.title)}">${ACTION_STATUSES.map(status => `<option value="${status}" ${status === action.status ? 'selected' : ''}>${actionStatusLabel(status)}</option>`).join('')}</select><button class="icon-button" data-action-command="edit" data-id="${action.id}" aria-label="Edit ${escapeHtml(action.title)}" title="Edit">&#9998;</button></div>
  </article>`;
}

function renderActionVault() {
  const actions = [...actionVault()].sort(actionSort);
  const visible = actionFilter === 'all' ? actions.filter(action => action.status !== 'archived') : actions.filter(action => action.status === actionFilter);
  const activeCount = actionCount('active');
  actionsView.innerHTML = `<header class="progress-title"><div><p class="section-kicker">KRYOS / Action Vault</p><h1>Nothing important lives in memory.</h1></div><span>${actions.filter(action => !['done','archived'].includes(action.status)).length} open</span></header>
    <section class="action-focus"><div><span>Active capacity</span><strong>${activeCount} / 3</strong></div><p>Keep no more than three actions active. Everything else remains safely stored without competing for attention.</p></section>
    <details class="action-add"><summary>Add an action</summary><form id="action-add-form"><label>Action<input name="title" required maxlength="180" placeholder="What must remain remembered?"></label><label>Smallest next action<input name="nextAction" maxlength="240" placeholder="Open the form and read the first field"></label><label>Domain<select name="domain">${lifeOptions(LIFE_DOMAINS)}</select></label><label>Priority<select name="priority"><option value="critical">Critical</option><option value="important">Important</option><option value="normal" selected>Normal</option></select></label><label>Real deadline, if any<input name="deadline" type="date"></label><button class="primary-button">Keep in Vault</button></form></details>
    <nav class="action-filters" aria-label="Action status">${['open','active','waiting','done','all'].map(status => `<button class="${actionFilter === status ? 'active' : ''}" data-action-filter="${status}">${status === 'all' ? 'All' : actionStatusLabel(status)} <span>${status === 'all' ? actions.filter(action => action.status !== 'archived').length : actionCount(status)}</span></button>`).join('')}</nav>
    <section class="action-list">${visible.map(renderActionCard).join('') || `<p class="life-empty">No ${actionFilter} actions. Your journal can add the next one.</p>`}</section>`;
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

document.addEventListener('submit', event => {
  if (event.target.id !== 'action-add-form') return;
  event.preventDefault();
  const form = new FormData(event.target);
  actionVault().push({ id: createId(), externalId: `manual-${createId()}`, title: form.get('title').trim(), nextAction: form.get('nextAction').trim(), domain: form.get('domain'), priority: form.get('priority'), deadline: form.get('deadline'), status: 'open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null });
  saveTasks();
  renderActionVault();
});

document.addEventListener('change', event => {
  if (!event.target.matches('[data-action-status]')) return;
  const action = actionVault().find(item => item.id === event.target.dataset.id);
  if (action && !updateActionStatus(action, event.target.value)) renderActionVault();
  else renderActionVault();
});

document.addEventListener('click', event => {
  const filter = event.target.closest('[data-action-filter]');
  if (filter) { actionFilter = filter.dataset.actionFilter; renderActionVault(); return; }
  const button = event.target.closest('[data-action-command]');
  if (!button) return;
  const action = actionVault().find(item => item.id === button.dataset.id);
  if (!action) return;
  if (button.dataset.actionCommand === 'done') updateActionStatus(action, 'done');
  if (button.dataset.actionCommand === 'reopen') updateActionStatus(action, 'open');
  if (button.dataset.actionCommand === 'edit') {
    const title = prompt('Action', action.title);
    if (title === null || !title.trim()) return;
    const nextAction = prompt('Smallest next action', action.nextAction || '');
    if (nextAction === null) return;
    action.title = title.trim(); action.nextAction = nextAction.trim(); action.updatedAt = new Date().toISOString(); saveTasks();
  }
  renderActionVault();
});
