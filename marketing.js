const MARKETING_STORAGE_KEY = "kryos-marketing-batches-v1";
const MARKETING_DEMO_DISMISSED_KEY = "kryos-marketing-demo-dismissed-v1";
const MARKETING_FILES_DB = "kryos-marketing-resume-files-v1";
const MARKETING_STATUSES = ["To review", "Saved", "Applied", "Interview", "Follow-up", "Offer", "Not selected", "Keep for later", "Archived", "Verify details"];
const MARKETING_ATTACHMENT_CATEGORIES = ["Résumé", "Cover letter", "Portfolio / work sample", "Certificate", "Job description", "Other"];
const MARKETING_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
const MARKETING_ATTACHMENT_EXTENSIONS = new Set(["pdf", "doc", "docx", "rtf", "txt", "odt", "xls", "xlsx", "csv", "ppt", "pptx", "png", "jpg", "jpeg"]);

// Entirely synthetic fixture data. Every link uses the reserved .invalid domain.
const MARKETING_SAMPLE_ROLES = [
  { id:"demo-001", company:"Northstar Health (Demo)", title:"Business Intelligence Analyst", location:"Chicago, IL", work_mode:"Hybrid", salary:"$82,000–$104,000", sponsorship:"Yes — explicitly stated", posted_at:"2026-09-25", source_url:"https://jobs.northstar.example.invalid/bi-analyst", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Build operational dashboards","Partner with clinical operations","Explain trends to non-technical teams"], requirements:["SQL","Power BI","2+ years analytics"], raw_description:"FICTIONAL SAMPLE. Northstar Health is not a real employer. Analyze clinical operations data, build Power BI dashboards, and communicate insights to partners. Sponsorship is explicitly stated as available.", unknown_information:["Application deadline not stated","Recruiter name not stated"], application:{status:"To review", applied_date:"", resume_version:"", contact_email:"", contact_phone:"", linkedin_url:"", notes:""} },
  { id:"demo-002", company:"Cedar Peak Systems (Demo)", title:"Junior Data Analyst", location:"Remote — US", work_mode:"Remote", salary:"Not listed", sponsorship:"No — explicitly stated", posted_at:"2026-09-24", source_url:"https://careers.cedarpeak.example.invalid/junior-analyst", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Validate weekly data extracts","Maintain recurring reports"], requirements:["Excel","Basic SQL","Clear written communication"], raw_description:"FICTIONAL SAMPLE. Cedar Peak Systems is not a real employer. Support a small reporting team with data checks and recurring analysis.", unknown_information:["Salary not listed","Benefits not listed","Sponsorship unavailable"], application:{status:"Saved", applied_date:"", resume_version:"", contact_email:"", contact_phone:"", linkedin_url:"", notes:""} },
  { id:"demo-003", company:"Lakeview Digital (Demo)", title:"Product Data Analyst", location:"Austin, TX", work_mode:"On-site", salary:"$95,000–$120,000", sponsorship:"Unknown", posted_at:"2026-09-22", source_url:"https://jobs.lakeview.example.invalid/product-analyst", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Define product health metrics","Analyze experiment results","Present recommendations"], requirements:["SQL","Experiment design","Python preferred"], raw_description:"FICTIONAL SAMPLE. Lakeview Digital is not a real employer. Work with product managers to define metrics and evaluate experiments. Work location is on-site.", unknown_information:["Sponsorship policy unclear","Bonus range not disclosed"], application:{status:"Applied", applied_date:"2026-09-23", resume_version:"Analyst-v2 (demo)", contact_email:"demo.applicant@example.invalid", contact_phone:"+1-555-0103", linkedin_url:"https://www.linkedin.com/in/demo-applicant-03", notes:"Synthetic applied example; no application was submitted."} },
  { id:"demo-004", company:"Redwood Financial Lab (Demo)", title:"Risk Reporting Associate", location:"New York, NY", work_mode:"Hybrid", salary:"$78,000 base + bonus", sponsorship:"Unknown", posted_at:"Date not available", source_url:"https://careers.redwood.example.invalid/risk-reporting", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Prepare monthly risk summaries","Reconcile reporting inputs","Document review findings"], requirements:["Excel","Attention to detail","Finance coursework preferred"], raw_description:"FICTIONAL SAMPLE. Redwood Financial Lab is not a real employer. The posting omits its publication date and does not describe sponsorship.", unknown_information:["Posting date unavailable","Sponsorship not mentioned","Hiring manager not identified"], application:{status:"Interview", applied_date:"2026-09-18", resume_version:"Risk-v1 (demo)", contact_email:"", contact_phone:"", linkedin_url:"", notes:"Synthetic interview state, for visual testing only."} },
  { id:"demo-005", company:"Orbit Grove Software (Demo)", title:"Data Quality Specialist", location:"Denver, CO", work_mode:"Remote eligible", salary:"$70,000–$88,000", sponsorship:"No — explicitly stated", posted_at:"2026-09-21", source_url:"https://jobs.orbitgrove.example.invalid/quality-specialist", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Investigate quality exceptions","Coordinate corrections with data owners","Track recurring issues"], requirements:["SQL basics","Documentation","Stakeholder follow-up"], raw_description:"FICTIONAL SAMPLE. Orbit Grove Software is not a real employer. Verify the work location and eligibility with the employer before proceeding.", unknown_information:["Remote eligibility limited by state","No recruiter contact listed"], application:{status:"Follow-up", applied_date:"2026-09-15", resume_version:"Data-quality-v3 (demo)", contact_email:"talent@example.invalid", contact_phone:"", linkedin_url:"", notes:"Synthetic reminder example. No real follow-up is due."} },
  { id:"demo-006", company:"Juniper Works (Demo)", title:"Operations Research Analyst", location:"Boston, MA", work_mode:"Hybrid", salary:"$105,000–$135,000", sponsorship:"Yes — recruiter confirmation required", posted_at:"2026-09-20", source_url:"https://careers.juniperworks.example.invalid/operations-research", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Model operational capacity","Compare scheduling scenarios","Summarize trade-offs"], requirements:["Python or R","Statistics","Optimization preferred"], raw_description:"FICTIONAL SAMPLE. Juniper Works is not a real employer. Sponsorship is described as case-by-case and requires recruiter confirmation.", unknown_information:["Sponsorship is conditional","Travel expectations unclear"], application:{status:"Offer", applied_date:"2026-09-10", resume_version:"OR-2026-demo", contact_email:"", contact_phone:"", linkedin_url:"", notes:"Synthetic offer state; not a real offer."} },
  { id:"demo-007", company:"Blue Harbor Insights (Demo)", title:"Reporting Analyst — Contract", location:"Minneapolis, MN", work_mode:"Contract / hybrid", salary:"$42–$55 per hour", sponsorship:"Not stated", posted_at:"2026-09-19", source_url:"https://blueharbor.example.invalid/reporting-contract", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Refresh client reports","Monitor data feeds","Prepare handoff documentation"], requirements:["Excel","SQL","Six-month contract availability"], raw_description:"FICTIONAL SAMPLE. Blue Harbor Insights is not a real employer. Contract length is six months. Sponsorship policy is not stated.", unknown_information:["Benefits not stated","Conversion to full time not stated","Sponsorship not stated"], application:{status:"Not selected", applied_date:"2026-09-08", resume_version:"Reporting-v2 (demo)", contact_email:"", contact_phone:"", linkedin_url:"", notes:"Synthetic closed application example."} },
  { id:"demo-008", company:"Mosslight Research (Demo)", title:"Research Data Coordinator", location:"Portland, OR", work_mode:"On-site", salary:"$64,000–$76,000", sponsorship:"Unknown", posted_at:"2026-09-18", source_url:"https://mosslight.example.invalid/research-data", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Maintain study datasets","Run completeness checks","Coordinate researcher requests"], requirements:["Data handling","Excel or Sheets","Research experience helpful"], raw_description:"FICTIONAL SAMPLE. Mosslight Research is not a real employer. Duties and eligibility details are intentionally incomplete in this sample.", unknown_information:["Sponsorship unknown","Required years of experience not stated","Posting may have expired"], application:{status:"Keep for later", applied_date:"", resume_version:"", contact_email:"", contact_phone:"", linkedin_url:"", notes:"Synthetic deferred example; review again later."} },
  { id:"demo-009", company:"Copperline Analytics (Demo)", title:"Senior Analytics Consultant", location:"Washington, DC", work_mode:"Remote — travel required", salary:"$125,000–$158,000", sponsorship:"Yes — posting says case-by-case", posted_at:"2026-09-17", source_url:"https://copperline.example.invalid/analytics-consultant", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Lead client discovery","Design analytical approaches","Present executive recommendations"], requirements:["5+ years analytics","SQL and Python","Client-facing experience"], raw_description:"FICTIONAL SAMPLE. Copperline Analytics is not a real employer. Travel is expected up to 25%; sponsorship is reviewed case-by-case.", unknown_information:["Travel reimbursement details not stated","Sponsorship outcome depends on role"], application:{status:"Archived", applied_date:"", resume_version:"", contact_email:"", contact_phone:"", linkedin_url:"", notes:"Synthetic archived example."} },
  { id:"demo-010", company:"Meadowline Public Services (Demo)", title:"Program Evaluation Analyst", location:"Remote / location varies", work_mode:"Flexible; verify with employer", salary:"$80,000 (range not provided)", sponsorship:"Unclear / conflicting sample text", posted_at:"2026-09-16", source_url:"https://meadowline.example.invalid/evaluation-analyst", captured_at:"2026-09-28T14:10:00Z", responsibilities:["Analyze program outcomes","Prepare evaluation briefs","Coordinate data requests"], requirements:["Statistics","Clear writing","Public-sector experience preferred"], raw_description:"FICTIONAL SAMPLE. Meadowline Public Services is not a real employer. One section says remote while another lists an office location; confirm before applying. Sponsorship language is conflicting.", unknown_information:["Remote status conflicts across sections","Sponsorship language conflicts","Salary is a single figure, not a range"], application:{status:"Verify details", applied_date:"", resume_version:"", contact_email:"", contact_phone:"", linkedin_url:"", notes:"Synthetic verification example; do not contact anyone."} },
];

function marketingEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function marketingRead() {
  try { return JSON.parse(getModeStorageValue(MARKETING_STORAGE_KEY) || "null") || { batches: [] }; }
  catch { return { batches: [] }; }
}
function marketingWrite(data) {
  data.meta = { ...(data.meta || {}), updatedAt: new Date().toISOString() };
  setModeStorageValue(MARKETING_STORAGE_KEY, JSON.stringify(data));
  if (typeof scheduleMarketingCloudSync === "function") scheduleMarketingCloudSync();
}
function marketingSafeUrl(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : "#"; }
  catch { return "#"; }
}
let marketingActiveBatchId = "";
let marketingSearchQuery = "";
let marketingShowRoleForm = false;
function marketingImport(batch) {
  if (!batch || batch.format !== "kryos-marketing-batch" || batch.version !== 1 || !Array.isArray(batch.roles)) throw new Error("Choose a KRYOS Marketing batch JSON file (format version 1).");
  if (!batch.roles.length || batch.roles.length > 500) throw new Error("A batch must contain between 1 and 500 roles.");
  const ids = new Set();
  for (const role of batch.roles) {
    if (!role.id || ids.has(role.id) || !role.company || !role.title) throw new Error("Every role needs a unique ID, company, and title.");
    ids.add(role.id);
  }
  const data = marketingRead();
  const now = new Date().toISOString();
  const batchId = String(batch.id || `batch-${Date.now()}`).trim();
  if (data.batches.some(item => item.id === batchId)) throw new Error("That batch is already in Marketing.");
  const knownIds = new Set(data.batches.flatMap(item => item.roles.map(role => role.id)));
  data.batches.unshift({ id: batchId, name: batch.name || "Imported job batch", importedAt: batch.importedAt || now, demo: Boolean(batch.demo), roles: batch.roles.map(role => {
    const id = knownIds.has(role.id) ? `${batchId}-${role.id}` : role.id;
    knownIds.add(id);
    return { ...role, id, application: { status: "To review", applied_date: "", resume_version: "", contact_email: "", contact_phone: "", linkedin_url: "", notes: "", ...(role.application || {}) } };
  }) });
  marketingWrite(data);
  removeModeStorageValue(MARKETING_DEMO_DISMISSED_KEY);
  marketingActiveBatchId = batchId;
}
function marketingCreateRole(details) {
  const company = String(details.company || "").trim();
  const title = String(details.title || "").trim();
  if (!company || !title) throw new Error("Add the company and job title to save this role.");
  const sourceUrl = String(details.source_url || "").trim();
  if (sourceUrl && marketingSafeUrl(sourceUrl) === "#") throw new Error("Use a complete http or https link for the original posting.");
  const data = marketingRead();
  const activeBatch = data.batches.find(item => item.id === marketingActiveBatchId) || data.batches[0] || null;
  const now = new Date().toISOString();
  const roleId = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const lines = value => String(value || "").split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  const role = {
    id: roleId,
    company,
    title,
    source_url: sourceUrl,
    location: String(details.location || "").trim(),
    salary: String(details.salary || "").trim(),
    work_mode: String(details.work_mode || "Not stated").trim() || "Not stated",
    sponsorship: String(details.sponsorship || "Not stated").trim() || "Not stated",
    posted_at: String(details.posted_at || "").trim(),
    captured_at: now,
    responsibilities: lines(details.responsibilities),
    requirements: lines(details.requirements),
    raw_description: String(details.raw_description || "").trim(),
    unknown_information: lines(details.unknown_information),
    application: { status: details.status || "To review", applied_date: "", resume_version: "", contact_email: "", contact_phone: "", linkedin_url: "", notes: "" },
    manually_added: true,
  };
  let batch = activeBatch && !activeBatch.demo ? activeBatch : null;
  if (!batch) {
    batch = { id: `manual-batch-${Date.now()}`, name: "Manually added roles", importedAt: now, demo: false, roles: [] };
    data.batches.unshift(batch);
  }
  batch.roles.unshift(role);
  marketingWrite(data);
  removeModeStorageValue(MARKETING_DEMO_DISMISSED_KEY);
  marketingActiveBatchId = batch.id;
  marketingActiveFilter = "all";
  marketingSearchQuery = "";
  marketingExpandedRoles.add(roleId);
  return role;
}
function marketingUpdateRole(roleId, field, value) {
  const data = marketingRead();
  const role = data.batches.flatMap(batch => batch.roles).find(item => item.id === roleId);
  if (!role) return;
  role.application ||= {};
  role.application[field] = value;
  marketingWrite(data);
  renderMarketingView();
}
function marketingOpenFileDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MARKETING_FILES_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("resumes", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Marketing file storage is busy in another tab. Close the other KRYOS tab and retry."));
  });
}
function marketingFileId(roleId, attachmentId = "") { return `${getModeStorageKey(MARKETING_STORAGE_KEY)}::${roleId}${attachmentId ? `::${attachmentId}` : ""}`; }
function marketingValidateAttachment(file) {
  if (!file) throw new Error("Choose a file to attach.");
  if (!Number.isFinite(file.size) || file.size <= 0) throw new Error("That file is empty. Choose a file with content.");
  if (file.size > MARKETING_ATTACHMENT_MAX_BYTES) throw new Error("That file is over the 10 MB limit. Choose a smaller file.");
  const extension = String(file.name || "").split(".").pop().toLowerCase();
  if (!file.name || !file.name.includes(".") || !MARKETING_ATTACHMENT_EXTENSIONS.has(extension)) throw new Error("File type not supported. Use PDF, Office documents, text, CSV, or an image.");
  return true;
}
function marketingRoleById(roleId) { return marketingRead().batches.flatMap(batch => batch.roles).find(role => role.id === roleId) || null; }
function marketingAttachmentLabel(category, title, name) { return String(title || "").trim() || String(name || "").trim() || category || "Attachment"; }
async function marketingPutFile(record) {
  const db = await marketingOpenFileDb();
  await new Promise((resolve, reject) => { let tx; try { tx=db.transaction("resumes","readwrite"); tx.objectStore("resumes").put(record); tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error || new Error("The file could not be saved in this browser.")); tx.onabort=()=>reject(tx.error || new Error("The browser canceled saving the file. Check available storage and retry.")); } catch(error) { reject(error); } });
}
async function marketingDeleteFile(id) {
  const db = await marketingOpenFileDb();
  await new Promise((resolve, reject) => { let tx; try { tx=db.transaction("resumes","readwrite"); tx.objectStore("resumes").delete(id); tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error || new Error("The file could not be removed.")); tx.onabort=()=>reject(tx.error || new Error("The browser canceled removing the file.")); } catch(error) { reject(error); } });
}
async function marketingGetFile(id) {
  const db=await marketingOpenFileDb();
  return new Promise((resolve,reject)=>{let request;try{request=db.transaction("resumes","readonly").objectStore("resumes").get(id);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error||new Error("The file could not be read from this browser."));}catch(error){reject(error);}});
}
async function marketingSaveAttachment(roleId, file, category, title = "") {
  marketingValidateAttachment(file);
  if (!MARKETING_ATTACHMENT_CATEGORIES.includes(category)) throw new Error("Choose one of the listed attachment types.");
  const role = marketingRoleById(roleId);
  if (!role) throw new Error("This job record is no longer available. Refresh Marketing and try again.");
  const app = role.application || {};
  const id = globalThis.crypto?.randomUUID?.() || `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const fileId = marketingFileId(roleId, id);
  const metadata = { id, category, title: marketingAttachmentLabel(category, title, file.name), name: file.name, type: file.type || "application/octet-stream", size: file.size, savedAt: new Date().toISOString(), resumeVersion: category === "Résumé" ? String(app.resume_version || "").trim() : "" };
  try { await marketingPutFile({ id:fileId, roleId, attachmentId:id, name:file.name, type:file.type, size:file.size, blob:file }); }
  catch(error) { if (error?.name === "QuotaExceededError") throw new Error("Browser storage is full. Remove an old attachment or use a smaller file."); throw new Error(`File storage could not save this attachment: ${error?.message || "unavailable"}.`); }
  try {
    role.application ||= {};
    role.application.attachments = [...(Array.isArray(role.application.attachments) ? role.application.attachments : []), metadata];
    marketingWrite(marketingReadWithRole(roleId, role));
  } catch(error) {
    try { await marketingDeleteFile(fileId); } catch(cleanupError) { console.warn("KRYOS Marketing could not clean up an unsaved file.", cleanupError); }
    throw new Error(error?.name === "QuotaExceededError" ? "Browser storage is full. Remove an old attachment or use a smaller file." : "The attachment was not recorded. Check browser storage and retry.");
  }
  renderMarketingView();
}
function marketingReadWithRole(roleId, updatedRole) {
  const data = marketingRead();
  const role = data.batches.flatMap(batch => batch.roles).find(item => item.id === roleId);
  if (!role) throw new Error("This job record is no longer available.");
  role.application = updatedRole.application;
  return data;
}
async function marketingRemoveAttachment(roleId, attachmentId) {
  const role = marketingRoleById(roleId);
  if (!role) throw new Error("This job record is no longer available. Refresh Marketing and try again.");
  const attachment = (role.application?.attachments || []).find(item => item.id === attachmentId);
  if (!attachment) throw new Error("That attachment is no longer listed. Refresh Marketing and try again.");
  const fileId = marketingFileId(roleId, attachmentId);
  await marketingDeleteFile(fileId);
  const data = marketingRead();
  const current = data.batches.flatMap(batch => batch.roles).find(item => item.id === roleId);
  if (current?.application) current.application.attachments = (current.application.attachments || []).filter(item => item.id !== attachmentId);
  marketingWrite(data);
  renderMarketingView();
}
async function marketingClearFiles(modeName) {
  try {
    const prefix=`${getModeStorageKey(MARKETING_STORAGE_KEY,modeName)}::`,db=await marketingOpenFileDb();
    await new Promise((resolve,reject)=>{const tx=db.transaction("resumes","readwrite"),store=tx.objectStore("resumes"),request=store.openCursor();request.onsuccess=()=>{const cursor=request.result;if(!cursor)return;if(String(cursor.key).startsWith(prefix))cursor.delete();cursor.continue();};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
  } catch (error) { console.warn("KRYOS Marketing file cleanup could not complete.",error); }
}
function marketingFormatDate(value) {
  if (!value || value === "Date not available") return value || "Not provided";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, {month:"short", day:"numeric", year:"numeric"});
}
function marketingFormatBytes(value) {
  const size = Number(value);
  if (!Number.isFinite(size) || size <= 0) return "size unavailable";
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
const marketingExpandedRoles = new Set();
function marketingRoleCard(role) {
  const app = role.application || {};
  const chips = [role.work_mode, role.sponsorship].filter(Boolean);
  const expanded = marketingExpandedRoles.has(role.id);
  const statusClass = String(app.status || "To review").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const queryMatch = !marketingSearchQuery || JSON.stringify(role).toLowerCase().includes(marketingSearchQuery.toLowerCase());
  const statusMatch = marketingActiveFilter === "all" || app.status === marketingActiveFilter;
  const attachments = [
    ...(app.resume_attachment ? [{ id: "legacy", category: "Résumé", title: app.resume_attachment.name, name: app.resume_attachment.name, size: app.resume_attachment.size, legacy: true }] : []),
    ...(Array.isArray(app.attachments) ? app.attachments : []),
  ];
  const rawDescription = role.raw_description || "No description captured";
  return `<article class="marketing-role-row" data-marketing-role-row data-role-id="${marketingEscape(role.id)}" ${queryMatch&&statusMatch?"":"hidden"}>
    <button class="marketing-role-summary" type="button" aria-expanded="${expanded}" data-marketing-expand="${marketingEscape(role.id)}"><span class="marketing-role-title"><strong>${marketingEscape(role.company)}</strong><small>${marketingEscape(role.title)}</small><span>${chips.map(chip=>`<i>${marketingEscape(chip)}</i>`).join("")}</span></span><span>${marketingEscape(role.location || "Location unknown")}</span><span>${marketingEscape(marketingFormatDate(role.posted_at))}</span><span class="marketing-status-pill status-${marketingEscape(statusClass)}">${marketingEscape(app.status || "To review")}</span></button>
    <div class="marketing-role-details" ${expanded?"":"hidden"}>
      <header class="marketing-detail-hero"><div class="marketing-detail-identity"><span class="marketing-detail-company-mark" aria-hidden="true">${marketingEscape((role.company || "?").trim().charAt(0).toUpperCase())}</span><div><p class="marketing-detail-eyebrow">ROLE DETAILS</p><h3>${marketingEscape(role.title)}</h3><p class="marketing-detail-company">${marketingEscape(role.company)}</p></div></div><a class="marketing-source-action" href="${marketingEscape(marketingSafeUrl(role.source_url))}" target="_blank" rel="noopener noreferrer"><span>Open original posting</span><span aria-hidden="true">↗</span></a></header>
      <section class="marketing-detail-overview" aria-label="Role at a glance"><p class="marketing-detail-section-kicker">AT A GLANCE</p><div class="marketing-detail-facts"><div><span>Location</span><strong>${marketingEscape(role.location || "Not provided")}</strong></div><div><span>Salary</span><strong>${marketingEscape(role.salary || "Not provided")}</strong></div><div><span>Work arrangement</span><strong>${marketingEscape(role.work_mode || "Unknown")}</strong></div><div><span>Sponsorship</span><strong>${marketingEscape(role.sponsorship || "Unknown")}</strong></div><div><span>Posted</span><strong>${marketingEscape(marketingFormatDate(role.posted_at))}</strong></div><div><span>Captured</span><strong>${marketingEscape(role.captured_at || "Not recorded")}</strong></div></div></section>
      <div class="marketing-posting-content"><section class="marketing-posting-panel"><p class="marketing-detail-section-kicker">THE ROLE</p><div class="marketing-responsibility-grid"><div><h4>What you’ll do</h4><ul>${(role.responsibilities || []).map(item=>`<li>${marketingEscape(item)}</li>`).join("") || "<li>Not provided in the captured posting.</li>"}</ul></div><div><h4>What they’re looking for</h4><ul>${(role.requirements || []).map(item=>`<li>${marketingEscape(item)}</li>`).join("") || "<li>Not provided in the captured posting.</li>"}</ul></div></div><details class="marketing-original-posting"><summary><span>Read full captured posting</span><span class="marketing-disclosure-hint">Original source text</span></summary><p class="marketing-raw-description">${marketingEscape(rawDescription)}</p></details></section><aside class="marketing-verify-panel"><span class="marketing-verify-icon" aria-hidden="true">!</span><div><p class="marketing-detail-section-kicker">DOUBLE-CHECK</p><h4>Unknown or verify</h4></div><ul>${(role.unknown_information || []).map(item=>`<li>${marketingEscape(item)}</li>`).join("") || "<li>No open questions recorded.</li>"}</ul></aside></div>
      <section class="marketing-application-panel" aria-label="Your application record"><div class="marketing-application-heading"><div><p class="marketing-detail-section-kicker">YOUR RECORD</p><h3>Application details</h3><p>Save what you used so it’s easy to find later.</p></div><span class="marketing-application-status status-${marketingEscape(statusClass)}">${marketingEscape(app.status || "To review")}</span></div><div class="marketing-application-fields">
        <fieldset class="marketing-form-group"><legend>Progress</legend><label>Status<select data-marketing-field="status" data-role="${marketingEscape(role.id)}">${MARKETING_STATUSES.map(status=>`<option ${app.status===status?"selected":""}>${marketingEscape(status)}</option>`).join("")}</select></label><label>Applied date<input type="date" data-marketing-field="applied_date" data-role="${marketingEscape(role.id)}" value="${marketingEscape(app.applied_date)}"></label><label>Résumé version<input data-marketing-field="resume_version" data-role="${marketingEscape(role.id)}" value="${marketingEscape(app.resume_version)}" placeholder="e.g. Analyst-v3"></label></fieldset>
        <fieldset class="marketing-form-group"><legend>Contact details used</legend><label>Email used<input type="email" data-marketing-field="contact_email" data-role="${marketingEscape(role.id)}" value="${marketingEscape(app.contact_email)}"></label><label>Phone used<input type="tel" data-marketing-field="contact_phone" data-role="${marketingEscape(role.id)}" value="${marketingEscape(app.contact_phone)}"></label><label>LinkedIn URL<input type="url" data-marketing-field="linkedin_url" data-role="${marketingEscape(role.id)}" value="${marketingEscape(app.linkedin_url)}"></label></fieldset>
        <label class="marketing-notes-field">Notes<textarea data-marketing-field="notes" data-role="${marketingEscape(role.id)}" rows="3" placeholder="A short note to help future-you remember…">${marketingEscape(app.notes)}</textarea></label>
        <div class="marketing-resume-field marketing-attachments"><div class="marketing-attachments-heading"><strong>Files for this application</strong><p>Keep the exact résumé, cover letter, portfolio sample, or other file you used with this role.</p></div>${attachments.map(item=>`<div class="marketing-attachment-item"><span class="marketing-attachment-type">${marketingEscape(item.category || "Résumé")}</span><span class="marketing-attachment-name" title="${marketingEscape(item.name)}">${marketingEscape(item.title || item.name)}</span><small>${marketingEscape(item.name)} · ${marketingEscape(marketingFormatBytes(item.size))}${item.resumeVersion?` · ${marketingEscape(item.resumeVersion)}`:""}</small><button type="button" data-marketing-file-download="${marketingEscape(role.id)}" data-attachment-id="${marketingEscape(item.id)}" ${item.legacy?`data-legacy="true"`:""}>Download</button><button type="button" data-marketing-file-remove="${marketingEscape(role.id)}" data-attachment-id="${marketingEscape(item.id)}" ${item.legacy?`data-legacy="true"`:""}>Remove</button></div>`).join("")||`<span class="marketing-attachments-empty">No files saved for this role yet.</span>`}<div class="marketing-attachment-add"><label>File type<select data-marketing-file-category="${marketingEscape(role.id)}">${MARKETING_ATTACHMENT_CATEGORIES.map(category=>`<option>${marketingEscape(category)}</option>`).join("")}</select></label><label>Short label <span>(optional)</span><input type="text" maxlength="80" placeholder="e.g. tailored résumé v4" data-marketing-file-title="${marketingEscape(role.id)}"></label><label class="marketing-resume-upload">Choose file<input type="file" accept=".pdf,.doc,.docx,.rtf,.txt,.odt,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg" data-marketing-attachment="${marketingEscape(role.id)}"></label></div><small>Up to 10 MB each · saved only in this browser (not cloud-synced or backed up).</small></div>
      </div></section>
      <p class="marketing-demo-disclaimer">${role.demo || false ? "Fictional test posting. No real application was submitted." : "Marketing records are separate from Career and Rewards."} Browser-local only; not cloud-synced or in KRYOS JSON backups.</p>
    </div></article>`;
}

function marketingManualRoleForm() {
  if (!marketingShowRoleForm) return "";
  return `<form class="marketing-manual-role-form" data-marketing-role-form novalidate>
    <div class="marketing-manual-form-heading"><div><p class="marketing-detail-section-kicker">ADD A ROLE</p><h3>Capture one job posting</h3><p>Save the details you have now. You can fill in unknowns or attach your résumé after saving.</p></div><button type="button" class="marketing-form-close" aria-label="Close add role form" data-marketing-cancel-role>×</button></div>
    <p class="marketing-form-error" data-marketing-form-error role="alert" hidden></p>
    <fieldset class="marketing-form-group"><legend>Role basics</legend><div class="marketing-manual-grid"><label>Company <span>Required</span><input name="company" required maxlength="160" autocomplete="organization" placeholder="Company name"></label><label>Job title <span>Required</span><input name="title" required maxlength="180" placeholder="Role title"></label><label class="marketing-manual-wide">Original posting link<input name="source_url" type="url" inputmode="url" placeholder="https://company.com/careers/job"></label><label>Location<input name="location" maxlength="180" placeholder="City, state, or remote"></label><label>Salary, if listed<input name="salary" maxlength="120" placeholder="As shown in the posting"></label><label>Work arrangement<select name="work_mode"><option>Not stated</option><option>Remote</option><option>Hybrid</option><option>On-site</option><option>Contract</option><option>Other / verify</option></select></label><label>Sponsorship<select name="sponsorship"><option>Not stated</option><option>Yes — explicitly stated</option><option>No — explicitly stated</option><option>Unknown / verify</option></select></label><label>Posted date<input name="posted_at" type="date"></label><label>Tracking status<select name="status">${MARKETING_STATUSES.map(status => `<option>${marketingEscape(status)}</option>`).join("")}</select></label></div></fieldset>
    <fieldset class="marketing-form-group"><legend>Posting notes <span class="marketing-optional-label">Add what you have; unknowns can stay blank.</span></legend><div class="marketing-manual-grid"><label>Responsibilities <span>One item per line</span><textarea name="responsibilities" rows="3" placeholder="What the role asks you to do"></textarea></label><label>Requirements <span>One item per line</span><textarea name="requirements" rows="3" placeholder="Skills, experience, or qualifications"></textarea></label><label>Full captured posting<textarea class="marketing-manual-raw" name="raw_description" rows="5" placeholder="Paste the job-post text here so you can verify it later"></textarea></label><label>Unknown or verify <span>One question per line</span><textarea name="unknown_information" rows="3" placeholder="e.g. Sponsorship policy not stated"></textarea></label></div></fieldset>
    <div class="marketing-manual-form-actions"><span>Saved in this browser only · not cloud-synced</span><button type="button" class="secondary-button" data-marketing-cancel-role>Cancel</button><button type="submit" class="marketing-import-button">Save role</button></div>
  </form>`;
}

function renderMarketingView() {
  let data = marketingRead();
  if (!data.batches.length && getModeStorageValue(MARKETING_DEMO_DISMISSED_KEY) !== "true") {
    marketingImport({ format: "kryos-marketing-batch", version: 1, name: "10-role feature test batch", demo: true, roles: MARKETING_SAMPLE_ROLES.map(role => ({ ...role, demo: true })) });
    data = marketingRead();
  }
  const batch = data.batches.find(item => item.id === marketingActiveBatchId) || data.batches[0] || null;
  const roles = batch?.roles || [];
  const demo = Boolean(batch?.demo);
  const applied = roles.filter(role => ["Applied","Interview","Follow-up","Offer"].includes(role.application?.status)).length;
  const lastUpdated = batch ? marketingFormatDate(batch.importedAt.slice(0,10)) : "—";
  return `
    <div class="marketing-workspace">
      <header class="marketing-topbar"><button class="marketing-back" type="button" data-marketing-back><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7M8 12h12" /></svg><span>Career Launch</span></button><div class="marketing-wordmark" aria-label="Marketing workspace"><span class="marketing-mark">M</span><span><strong>MARKETING</strong><small>KRYOS WORKSPACE</small></span></div><div class="marketing-sync-wrap"><span class="marketing-sync-caption">KRYOS ACCOUNT</span><span class="global-cloud-state state-local" data-global-cloud-state role="status" aria-live="polite" title="KRYOS account sync status. Marketing batches and files are saved only in this browser."><i></i><span>Checking</span></span></div></header>
      <main class="marketing-content">
        <section class="marketing-intro"><div><p class="marketing-eyebrow"><span></span> CAREER LAUNCH / WORKSPACE</p><h1>Your search, held in one place.</h1><p class="marketing-intro-copy">Keep the roles you choose to track, application details, and the résumé version you used together—without turning every search into more admin.</p></div><div class="marketing-intro-note"><span aria-hidden="true">✦</span><p><strong>Built around your workflow</strong><br />Search and apply manually. Save only what you want to keep.</p></div></section>
        ${demo ? `<div class="marketing-demo-banner" role="status"><strong>DEMO BATCH · FICTIONAL DATA</strong><span>Saved on this browser only. It does not affect Career, Rewards, or the cloud.</span><button type="button" data-marketing-remove-demo>Remove demo batch</button></div>` : ""}
        <section class="marketing-batch-card" aria-labelledby="marketing-batch-title"><div class="marketing-batch-topline"><p class="marketing-section-label">CURRENT BATCH</p><span class="marketing-empty-badge ${batch?"has-batch":""}"><i></i>${batch ? `${demo?"Demo · ":""}${roles.length} roles imported` : "No active batch"}</span></div><div class="marketing-batch-main"><div class="marketing-batch-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM8 5V3m8 2V3M4 10h16M8 14h3m-3 3h7" /></svg></div><div><h2 id="marketing-batch-title">${marketingEscape(batch?.name || "Ready for your next batch")}</h2><p>${batch ? "Review complete posting details, mark real application progress, and keep the résumé version alongside each role." : "Import a complete filtered batch. Raw posting detail and unknown information stay available for your review."}</p></div></div><div class="marketing-batch-metrics"><div><strong>${batch?roles.length:"—"}</strong><span>Roles in batch</span></div><div><strong>${batch?applied:"—"}</strong><span>In application process</span></div><div><strong>${batch?lastUpdated:"—"}</strong><span>Imported</span></div></div><div class="marketing-import-controls"><label class="marketing-import-button">Import batch JSON<input type="file" accept="application/json,.json" data-marketing-import-file></label><button type="button" class="secondary-button" data-marketing-demo-import>Import 10 demo roles</button><button type="button" class="marketing-download-sample" data-marketing-download-sample>Download sample JSON</button></div><p class="marketing-batch-footnote"><span aria-hidden="true">↗</span> ${demo ? "Fictional test data stays in this browser and never changes Career, Rewards, or the cloud." : "Marketing batches and files stay in this browser; they are not cloud-synced or included in KRYOS backups."}</p></section>
        <section class="marketing-roles-card" aria-labelledby="marketing-roles-title"><div class="marketing-roles-heading"><div><p class="marketing-section-label">YOUR RECORDS</p><h2 id="marketing-roles-title">${demo?"Sample postings":"Batch roles"}</h2><p>${demo?"Ten fictional examples spanning the captured job and application fields.":"The imported batch remains intact while you review and track applications."}</p></div><div class="marketing-roles-heading-actions"><span class="marketing-count">${roles.length} <span>${roles.length===1?"role":"roles"}</span></span><button type="button" class="marketing-add-role-button" data-marketing-add-role aria-expanded="${marketingShowRoleForm}">${marketingShowRoleForm?"Close":"＋ Add a role"}</button></div></div>${marketingManualRoleForm()}${data.batches.length>1?`<label class="marketing-batch-picker">Current batch<select data-marketing-batch-select>${data.batches.map(item=>`<option value="${marketingEscape(item.id)}" ${item.id===batch.id?"selected":""}>${marketingEscape(item.name)} · ${item.roles.length} roles${item.demo?" · demo":""}</option>`).join("")}</select></label>`:""}<label class="marketing-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg><input id="marketing-role-search" type="search" autocomplete="off" placeholder="Search company, role, skills, or status" aria-label="Search roles" value="${marketingEscape(marketingSearchQuery)}" ${roles.length?"":"disabled"}/><kbd>⌕</kbd></label><div class="marketing-status-filters"><button type="button" class="${marketingActiveFilter==="all"?"is-active":""}" data-marketing-filter="all">All <span>${roles.length}</span></button>${MARKETING_STATUSES.map(status=>`<button type="button" class="${marketingActiveFilter===status?"is-active":""}" data-marketing-filter="${marketingEscape(status)}">${marketingEscape(status)}</button>`).join("")}</div><div class="marketing-list-head" aria-hidden="true"><span>COMPANY / ROLE</span><span>LOCATION</span><span>POSTED</span><span>STATUS</span></div><div class="marketing-role-list" id="marketing-role-list">${roles.map(marketingRoleCard).join("") || `<div class="marketing-list-empty"><span class="marketing-empty-illustration" aria-hidden="true">✦</span><strong>No roles in this batch yet</strong><span>Add one manually or import a complete batch.</span></div>`}</div><div class="marketing-search-hint" id="marketing-search-hint">${roles.length?"Select a role to see source details and application fields.":"Add a role or import a batch to get started."}</div></section>
        <footer class="marketing-footer"><span>MARKETING</span><i></i><span>Separate workspace · browser-local records · not cloud or backup-synced</span></footer>
      </main>
      <div class="marketing-toast" role="status" aria-live="polite" hidden></div>
    </div>`;
}

let marketingActiveFilter = "all";
function marketingToast(message) { const toast=document.querySelector(".marketing-toast"); if(!toast)return;toast.textContent=message;toast.hidden=false;clearTimeout(marketingToast.timer);marketingToast.timer=setTimeout(()=>toast.hidden=true,3500); }
function marketingRefreshWorkspace(focusCompany = false) {
  const root = document.querySelector("#marketing-view");
  if (!root) return;
  root.innerHTML = renderMarketingView();
  if (typeof updateGlobalCloudState === "function") updateGlobalCloudState();
  if (focusCompany) root.querySelector('[data-marketing-role-form] [name="company"]')?.focus();
}
document.addEventListener("click", async event => {
  const addRole=event.target.closest("[data-marketing-add-role]");
  if(addRole){marketingShowRoleForm=!marketingShowRoleForm;marketingRefreshWorkspace(marketingShowRoleForm);return;}
  if(event.target.closest("[data-marketing-cancel-role]")){marketingShowRoleForm=false;marketingRefreshWorkspace();return;}
  const downloadButton=event.target.closest("[data-marketing-download-sample]");
  if(downloadButton){const blob=new Blob([JSON.stringify({format:"kryos-marketing-batch",version:1,name:"Sample job batch",demo:true,roles:MARKETING_SAMPLE_ROLES.map(role=>({...role,demo:true}))},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download="kryos-marketing-sample-batch.json";anchor.click();URL.revokeObjectURL(url);return;}
  const demoButton=event.target.closest("[data-marketing-demo-import]");
  if(demoButton){try{marketingImport({format:"kryos-marketing-batch",version:1,name:"10-role feature test batch",demo:true,roles:MARKETING_SAMPLE_ROLES.map(role=>({...role,demo:true}))});marketingActiveFilter="all";marketingSearchQuery="";renderMarketingView();marketingToast("10 fictional roles imported on this browser.");}catch(error){marketingToast(error.message);}return;}
  const removeButton=event.target.closest("[data-marketing-remove-demo]");
  if(removeButton){const data=marketingRead();const removed=data.batches.filter(batch=>batch.demo);data.batches=data.batches.filter(batch=>!batch.demo);marketingWrite(data);if(!data.batches.length)setModeStorageValue(MARKETING_DEMO_DISMISSED_KEY,"true");if(removed.some(batch=>batch.id===marketingActiveBatchId))marketingActiveBatchId=data.batches[0]?.id||"";for(const role of removed.flatMap(batch=>batch.roles)){for(const item of role.application?.attachments||[])try{await marketingDeleteFile(marketingFileId(role.id,item.id));}catch(error){console.warn("Demo attachment cleanup could not complete.",error);}if(role.application?.resume_attachment)try{await marketingDeleteFile(marketingFileId(role.id));}catch(error){console.warn("Legacy demo résumé cleanup could not complete.",error);}}renderMarketingView();marketingToast("Fictional demo data removed. Other Marketing batches were kept.");return;}
  const fileDownload=event.target.closest("[data-marketing-file-download]");
  if(fileDownload){try{const roleId=fileDownload.dataset.marketingFileDownload,attachmentId=fileDownload.dataset.attachmentId;const item=await marketingGetFile(marketingFileId(roleId,fileDownload.dataset.legacy?"":attachmentId));if(!item)throw new Error("File not found in this browser. The browser may have cleared its local storage.");const url=URL.createObjectURL(item.blob);const anchor=document.createElement("a");anchor.href=url;anchor.download=item.name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){marketingToast(error.message||"This file could not be downloaded.");}return;}
  const fileRemove=event.target.closest("[data-marketing-file-remove]");
  if(fileRemove){try{const roleId=fileRemove.dataset.marketingFileRemove,attachmentId=fileRemove.dataset.attachmentId;if(fileRemove.dataset.legacy){await marketingDeleteFile(marketingFileId(roleId));marketingUpdateRole(roleId,"resume_attachment",null);}else await marketingRemoveAttachment(roleId,attachmentId);marketingToast("File removed from this browser.");}catch(error){marketingToast(error.message||"This file could not be removed.");}return;}
  const filter=event.target.closest("[data-marketing-filter]");
  if(filter){marketingActiveFilter=filter.dataset.marketingFilter;document.querySelectorAll("[data-marketing-filter]").forEach(button=>button.classList.toggle("is-active",button===filter));marketingApplyFilters();return;}
  const expand=event.target.closest("[data-marketing-expand]");
  if(expand){const detail=expand.closest(".marketing-role-row")?.querySelector(".marketing-role-details");const opening=detail?.hidden;detail.hidden=!opening;expand.setAttribute("aria-expanded",String(Boolean(opening)));if(opening)marketingExpandedRoles.add(expand.dataset.marketingExpand);else marketingExpandedRoles.delete(expand.dataset.marketingExpand);return;}
});
document.addEventListener("change", async event => {
  const batchSelect=event.target.closest("[data-marketing-batch-select]");
  if(batchSelect){marketingActiveBatchId=batchSelect.value;marketingActiveFilter="all";marketingSearchQuery="";renderMarketingView();return;}
  const fileInput=event.target.closest("[data-marketing-import-file]");
  if(fileInput?.files?.[0]){try{const batch=JSON.parse(await fileInput.files[0].text());marketingImport(batch);marketingActiveFilter="all";marketingSearchQuery="";renderMarketingView();marketingToast(`${batch.roles.length} roles imported.`);}catch(error){marketingToast(error.message || "That file could not be imported.");}finally{fileInput.value="";}return;}
  const field=event.target.closest("[data-marketing-field]");
  if(field){marketingUpdateRole(field.dataset.role,field.dataset.marketingField,field.value);marketingToast("Application detail saved on this browser.");}
  const attachment=event.target.closest("[data-marketing-attachment]");
  if(attachment){const file=attachment.files?.[0];if(!file)return;const roleId=attachment.dataset.marketingAttachment;try{const category=document.querySelector(`[data-marketing-file-category="${CSS.escape(roleId)}"]`)?.value||"Other";const title=document.querySelector(`[data-marketing-file-title="${CSS.escape(roleId)}"]`)?.value||"";await marketingSaveAttachment(roleId,file,category,title);marketingToast(`${category} saved with this role in this browser.`);}catch(error){marketingToast(error.message||"That file could not be saved.");}finally{attachment.value="";}}
});
document.addEventListener("submit", event => {
  const form = event.target.closest("[data-marketing-role-form]");
  if (!form) return;
  event.preventDefault();
  const value = name => form.elements.namedItem(name)?.value || "";
  try {
    const role = marketingCreateRole({
      company:value("company"), title:value("title"), source_url:value("source_url"), location:value("location"), salary:value("salary"),
      work_mode:value("work_mode"), sponsorship:value("sponsorship"), posted_at:value("posted_at"), status:value("status"),
      responsibilities:value("responsibilities"), requirements:value("requirements"), raw_description:value("raw_description"), unknown_information:value("unknown_information"),
    });
    marketingShowRoleForm = false;
    marketingRefreshWorkspace();
    marketingToast("Role saved. You can now add application details and attach the résumé you used.");
    document.querySelector(`[data-marketing-expand="${CSS.escape(role.id)}"]`)?.focus();
  } catch(error) {
    const message = form.querySelector("[data-marketing-form-error]");
    if(message){message.textContent=error.message || "The role could not be saved. Please try again.";message.hidden=false;}
  }
});
document.addEventListener("input", event => { if(event.target?.id==="marketing-role-search")marketingApplyFilters(); });
function marketingApplyFilters(){
  marketingSearchQuery=(document.querySelector("#marketing-role-search")?.value||"").trim().toLowerCase();
  const roles=marketingRead().batches.flatMap(batch=>batch.roles);
  const rows=[...document.querySelectorAll(".marketing-role-row")];
  rows.forEach(row=>{const role=roles.find(item=>item.id===row.dataset.roleId);const matchesStatus=marketingActiveFilter==="all"||role?.application?.status===marketingActiveFilter;const matchesQuery=!marketingSearchQuery||JSON.stringify(role).toLowerCase().includes(marketingSearchQuery);row.hidden=!(matchesStatus&&matchesQuery);});
  const hint=document.querySelector("#marketing-search-hint");
  if(hint)hint.textContent=rows.some(row=>!row.hidden)?"Select a role to see source details and application fields.":"No roles match this search. Try another term or status.";
}
