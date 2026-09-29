function renderMarketingView() {
  return `
    <div class="marketing-workspace">
      <header class="marketing-topbar">
        <button class="marketing-back" type="button" data-marketing-back>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7M8 12h12" /></svg>
          <span>Career Launch</span>
        </button>
        <div class="marketing-wordmark" aria-label="Marketing workspace">
          <span class="marketing-mark">M</span>
          <span><strong>MARKETING</strong><small>KRYOS WORKSPACE</small></span>
        </div>
        <div class="marketing-sync-wrap">
          <span class="marketing-sync-caption">KRYOS CLOUD</span>
          <span class="global-cloud-state state-local" data-global-cloud-state role="status" aria-live="polite" title="Shared KRYOS cloud status"><i></i><span>Checking</span></span>
        </div>
      </header>

      <main class="marketing-content">
        <section class="marketing-intro">
          <div>
            <p class="marketing-eyebrow"><span></span> CAREER LAUNCH / WORKSPACE</p>
            <h1>Your search, held in one place.</h1>
            <p class="marketing-intro-copy">Keep the roles you choose to track, the application details, and the résumé you used together—without turning every search into more admin.</p>
          </div>
          <div class="marketing-intro-note"><span aria-hidden="true">✦</span><p><strong>Built around your workflow</strong><br />Search and apply manually. Save only what you want to keep.</p></div>
        </section>

        <section class="marketing-batch-card" aria-labelledby="marketing-batch-title">
          <div class="marketing-batch-topline"><p class="marketing-section-label">CURRENT BATCH</p><span class="marketing-empty-badge"><i></i>No active batch</span></div>
          <div class="marketing-batch-main">
            <div class="marketing-batch-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM8 5V3m8 2V3M4 10h16M8 14h3m-3 3h7" /></svg></div>
            <div><h2 id="marketing-batch-title">Ready for your next batch</h2><p>Your next imported search batch will appear here. No sample jobs or placeholder records are being shown.</p></div>
          </div>
          <div class="marketing-batch-metrics" aria-label="Current batch summary">
            <div><strong>—</strong><span>Roles in batch</span></div>
            <div><strong>—</strong><span>Applied</span></div>
            <div><strong>—</strong><span>Last updated</span></div>
          </div>
          <p class="marketing-batch-footnote"><span aria-hidden="true">↗</span> Batch import is the next build step. Your existing Career Launch records remain unchanged.</p>
        </section>

        <section class="marketing-roles-card" aria-labelledby="marketing-roles-title">
          <div class="marketing-roles-heading">
            <div><p class="marketing-section-label">YOUR RECORDS</p><h2 id="marketing-roles-title">Saved roles</h2><p>Only roles you choose to keep will live in this list.</p></div>
            <span class="marketing-count">0 <span>saved</span></span>
          </div>
          <label class="marketing-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
            <input id="marketing-role-search" type="search" autocomplete="off" placeholder="Search company or role" aria-label="Search saved roles" />
            <kbd>⌕</kbd>
          </label>
          <div class="marketing-list-head" aria-hidden="true"><span>COMPANY / ROLE</span><span>LOCATION</span><span>POSTED</span><span>STATUS</span></div>
          <div class="marketing-list-empty" id="marketing-list-empty" role="status" aria-live="polite">
            <span class="marketing-empty-illustration" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="9" y="8" width="30" height="34" rx="7"/><path d="M17 19h14M17 25h14M17 31h8"/><path d="M34 8v8h5"/></svg></span>
            <strong>No saved roles yet</strong>
            <span>Your list is ready. Saved roles will be searchable here.</span>
          </div>
          <div class="marketing-search-hint" id="marketing-search-hint">Search activates as soon as your first role is saved.</div>
        </section>

        <footer class="marketing-footer"><span>MARKETING</span><i></i><span>Separate workspace · Shared KRYOS cloud connection</span></footer>
      </main>
    </div>`;
}

document.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.id !== "marketing-role-search") return;
  const query = event.target.value.trim();
  const emptyMessage = document.querySelector("#marketing-list-empty strong");
  const emptyDetail = document.querySelector("#marketing-list-empty > span:last-child");
  const hint = document.querySelector("#marketing-search-hint");
  if (emptyMessage) emptyMessage.textContent = query ? "No saved roles to match yet" : "No saved roles yet";
  if (emptyDetail) emptyDetail.textContent = query
    ? "Your search is ready; saved roles will appear here when added."
    : "Your list is ready. Saved roles will be searchable here.";
  if (hint) hint.textContent = query
    ? "No records are loaded in this workspace yet."
    : "Search activates as soon as your first role is saved.";
});
