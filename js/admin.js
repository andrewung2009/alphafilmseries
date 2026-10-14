'use strict';

// ============================================================
//  Alpha Hub admin panel
//  Content editor that saves straight to GitHub via API.
// ============================================================

// ---------- tiny helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const REPO_API = 'https://api.github.com/repos/' + ADMIN_CONFIG.repo;

let token = '';
try { token = localStorage.getItem('adminToken') || ''; } catch (e) { token = ''; }
let dataState = null;   // parsed content of data.json
let weekSeq = 0;        // unique ids for week panels

// ---------- messages ----------
function toast(message, type) {
   const box = $('#toastBox');
   const el = document.createElement('div');
   el.className = 'toast-msg ' + (type || '');
   el.textContent = message;
   box.appendChild(el);
   setTimeout(() => el.remove(), 4500);
}

function showAlert(el, message) {
   el.textContent = message;
   el.classList.remove('d-none');
}
function hideAlert(el) {
   el.classList.add('d-none');
}

// ---------- GitHub API ----------
function authHeaders(extra) {
   const h = Object.assign({}, extra || {});
   if (token) {
      h['Authorization'] = 'Bearer ' + token;
      h['Accept'] = 'application/vnd.github+json';
      h['X-GitHub-Api-Version'] = '2022-11-28';
   }
   return h;
}

async function ghFetch(url, opts) {
   opts = opts || {};
   const res = await fetch(url, Object.assign({}, opts, { headers: authHeaders(opts.headers) }));
   if (!res.ok) {
      let detail = '';
      try { const body = await res.json(); detail = body.message || ''; } catch (e) { /* ignore */ }
      const err = new Error(detail || ('GitHub error ' + res.status));
      err.status = res.status;
      throw err;
   }
   return res.json();
}

function base64ToUtf8(b64) {
   const clean = b64.replace(/\n/g, '');
   const bin = atob(clean);
   const bytes = new Uint8Array(bin.length);
   for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
   return new TextDecoder('utf-8').decode(bytes);
}

function utf8ToBase64(text) {
   const bytes = new TextEncoder().encode(text);
   let bin = '';
   bytes.forEach(b => { bin += String.fromCharCode(b); });
   return btoa(bin);
}

async function loadContent() {
   const info = await ghFetch(REPO_API + '/contents/' + ADMIN_CONFIG.contentPath + '?ref=' + ADMIN_CONFIG.branch);
   const text = base64ToUtf8(info.content);
   dataState = JSON.parse(text);
   renderAll();
}

async function pushContent(jsonText, message) {
   const fresh = await ghFetch(REPO_API + '/contents/' + ADMIN_CONFIG.contentPath + '?ref=' + ADMIN_CONFIG.branch);
   const body = {
      message: message,
      content: utf8ToBase64(jsonText),
      sha: fresh.sha,
      branch: ADMIN_CONFIG.branch
   };
   return ghFetch(REPO_API + '/contents/' + ADMIN_CONFIG.contentPath, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
   });
}

// ---------- login ----------
function showPasswordStep() {
   $('#loginScreen').classList.remove('d-none');
   $('#stepPassword').classList.remove('d-none');
   $('#stepToken').classList.add('d-none');
   $('#passwordInput').focus();
}

function showTokenStep(message) {
   $('#loginScreen').classList.remove('d-none');
   $('#stepPassword').classList.add('d-none');
   $('#stepToken').classList.remove('d-none');
   if (message) showAlert($('#tokenError'), message); else hideAlert($('#tokenError'));
   $('#tokenInput').focus();
}

function unlock() {
   const value = $('#passwordInput').value;
   if (value === ADMIN_CONFIG.password) {
      hideAlert($('#passwordError'));
      try { sessionStorage.setItem('adminUnlocked', '1'); } catch (e) { /* ignore */ }
      if (token) { enterEditor(); } else { showTokenStep(); }
   } else {
      showAlert($('#passwordError'), 'Wrong password - please try again.');
      $('#passwordInput').value = '';
      $('#passwordInput').focus();
   }
}

async function connectToken() {
   const input = $('#tokenInput');
   const value = input.value.trim();
   if (!value) {
      showAlert($('#tokenError'), 'Please paste your GitHub token first.');
      return;
   }
   const btn = $('#tokenBtn');
   btn.disabled = true;
   btn.textContent = 'Checking...';
   const previous = token;
   token = value;
   try {
      await ghFetch('https://api.github.com/user');
      await ghFetch(REPO_API);
      try { localStorage.setItem('adminToken', value); } catch (e) { /* ignore */ }
      hideAlert($('#tokenError'));
      enterEditor();
   } catch (err) {
      token = previous;
      let msg = 'Could not sign in: ' + err.message;
      if (err.status === 401) msg = 'That token is invalid or has expired. Generate a new one (see the setup guide above).';
      if (err.status === 404) msg = 'This token cannot see the repository "' + ADMIN_CONFIG.repo + '". Check that it was created with access to that repository.';
      showAlert($('#tokenError'), msg);
   } finally {
      btn.disabled = false;
      btn.textContent = 'Sign in';
   }
}

async function enterEditor() {
   $('#loginScreen').classList.add('d-none');
   $('#editorScreen').classList.remove('d-none');
   $('#viewSiteLink').href = ADMIN_CONFIG.siteUrl;
   $('#saveStatus').innerHTML = '';
   const badge = $('#whoBadge');
   badge.textContent = 'connecting...';
   try {
      const user = await ghFetch('https://api.github.com/user');
      badge.textContent = 'signed in as ' + user.login;
   } catch (e) {
      badge.textContent = 'connected';
   }
   try {
      await loadContent();
   } catch (err) {
      handleLoadError(err);
   }
}

function handleLoadError(err) {
   if (err && err.status === 401) {
      signOut(true);
      showTokenStep('Your token is invalid or expired - please sign in again.');
      return;
   }
   showAlert($('#validationBox'), 'Could not load the website content: ' + err.message);
}

function signOut(silent) {
   try {
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUnlocked');
   } catch (e) { /* ignore */ }
   token = '';
   dataState = null;
   $('#editorScreen').classList.add('d-none');
   if (!silent) location.reload();
}

// ---------- row / card builders ----------
function setFields(root, obj) {
   $$('[data-field]', root).forEach(inp => {
      const v = obj[inp.dataset.field];
      inp.value = (v === undefined || v === null) ? '' : v;
   });
}

function makeRow(obj) {
   const div = document.createElement('div');
   div.className = 'edit-row';
   div.innerHTML =
      '<div class="row g-2 align-items-end">' +
      '<div class="col-md-5"><label class="form-label">Title</label>' +
      '<input class="form-control" data-field="title" placeholder="e.g. The Essentials"></div>' +
      '<div class="col-md-6"><label class="form-label">Link</label>' +
      '<input class="form-control" data-field="url" data-url placeholder="https://..."></div>' +
      '<div class="col-md-1 text-end"><button type="button" class="btn btn-outline-danger btn-sm btn-remove" title="Remove">&times;</button></div>' +
      '</div>';
   setFields(div, obj || {});
   return div;
}

const ICON_OPTIONS = [
   'fas fa-toolbox', 'fas fa-chalkboard-teacher', 'fas fa-bible', 'fas fa-mobile-alt',
   'fas fa-book-open', 'fas fa-video', 'fas fa-link', 'fas fa-external-link-alt',
   'fas fa-users', 'fas fa-heart', 'fas fa-hands-helping', 'fas fa-pray',
   'fas fa-globe', 'fas fa-envelope', 'fas fa-download', 'fas fa-lightbulb',
   'fas fa-question-circle', 'fas fa-star', 'fas fa-calendar-check', 'fas fa-clipboard-list'
];

function makeGuideRow(obj) {
   const div = document.createElement('div');
   div.className = 'edit-row';
   div.innerHTML =
      '<div class="row g-2">' +
      '<div class="col-md-4"><label class="form-label">Title</label>' +
      '<input class="form-control" data-field="title"></div>' +
      '<div class="col-md-7"><label class="form-label">Description</label>' +
      '<input class="form-control" data-field="description"></div>' +
      '<div class="col-md-1 text-end"><button type="button" class="btn btn-outline-danger btn-sm btn-remove" title="Remove">&times;</button></div>' +
      '</div>' +
      '<div class="row g-2 mt-1">' +
      '<div class="col-md-8"><label class="form-label">Link</label>' +
      '<input class="form-control" data-field="url" data-url placeholder="https://..."></div>' +
      '<div class="col-md-4"><label class="form-label">Icon</label>' +
      '<select class="form-select" data-field="icon"></select></div>' +
      '</div>';
   const select = div.querySelector('[data-field="icon"]');
   const current = (obj && obj.icon) || ICON_OPTIONS[0];
   const options = ICON_OPTIONS.slice();
   if (options.indexOf(current) === -1) options.unshift(current);
   options.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === current) opt.selected = true;
      select.appendChild(opt);
   });
   setFields(div, obj || {});
   select.value = current;
   return div;
}

function linkBlock(label, path) {
   return '<div class="row g-3 mt-1">' +
      '<div class="col-md-5"><label class="form-label">' + label + ' - title</label>' +
      '<input class="form-control" data-field="' + path + '.title"></div>' +
      '<div class="col-md-7"><label class="form-label">' + label + ' - link</label>' +
      '<input class="form-control" data-field="' + path + '.url" data-url placeholder="https://..."></div>' +
      '</div>';
}

function listBlock(label, path, heading) {
   return '<div class="row g-3 mt-1">' +
      '<div class="col-md-5"><label class="form-label">' + label + ' heading</label>' +
      '<input class="form-control" data-field="' + path + '.title"></div>' +
      '<div class="col-md-7"><label class="form-label">' + label + ' - one per line</label>' +
      '<textarea class="form-control" rows="4" data-field="' + path + '.content" placeholder="' + heading + '"></textarea></div>' +
      '</div>';
}

function makeWeekCard(w, origIndex) {
   w = w || {};
   const seq = weekSeq++;
   const id = 'weekPanel' + seq;
   const div = document.createElement('div');
   div.className = 'accordion-item week-card';
   if (origIndex !== null && origIndex !== undefined) div.dataset.origIndex = String(origIndex);
   div.innerHTML =
      '<h2 class="accordion-header">' +
      '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#' + id + '" aria-expanded="false">' +
      '<span class="week-badge" data-week-badge>Week</span><span data-week-label></span>' +
      '</button></h2>' +
      '<div id="' + id + '" class="accordion-collapse collapse" data-bs-parent="#weekList">' +
      '<div class="accordion-body">' +
      '<div class="row g-3">' +
      '<div class="col-md-2"><label class="form-label">Week number</label>' +
      '<input type="number" min="1" class="form-control" data-field="week"></div>' +
      '<div class="col-md-10"><label class="form-label">Week title</label>' +
      '<input class="form-control" data-field="title" placeholder="e.g. Who Is Jesus?"></div>' +
      '</div>' +
      linkBlock('Alpha talk', 'talk') +
      linkBlock('Host &amp; Helper briefing', 'briefing') +
      linkBlock('Guest guide', 'guide') +
      linkBlock('Team guide', 'teamGuide') +
      '<div class="week-block-label mt-3">Icebreaker</div>' +
      listBlock('Icebreaker', 'icebreaker', 'Say your name with an adjective...') +
      '<div class="week-block-label mt-3">Discussion questions</div>' +
      listBlock('Discussion', 'discussion', 'Ask the group a question...') +
      '<div class="week-block-label mt-3">Tips</div>' +
      listBlock('Tips', 'tips', 'Arrive early...') +
      '<div class="mt-3 d-flex gap-2">' +
      '<button type="button" class="btn btn-sm btn-outline-secondary" data-action="dup-week"><i class="far fa-copy me-1"></i>Duplicate</button>' +
      '<button type="button" class="btn btn-sm btn-outline-danger" data-action="del-week"><i class="far fa-trash-alt me-1"></i>Delete week</button>' +
      '</div>' +
      '</div></div>';

   const set = (field, value) => {
      const inp = div.querySelector('[data-field="' + field + '"]');
      if (inp) inp.value = (value === undefined || value === null) ? '' : value;
   };
   set('week', w.week);
   set('title', w.title);
   ['talk', 'briefing', 'guide', 'teamGuide'].forEach(key => {
      set(key + '.title', w[key] && w[key].title);
      set(key + '.url', w[key] && w[key].url);
   });
   const listLines = arr => (Array.isArray(arr) ? arr.join('\n') : '');
   set('icebreaker.title', (w.icebreaker && w.icebreaker.title) || 'Icebreaker');
   set('icebreaker.content', listLines(w.icebreaker && w.icebreaker.content));
   set('discussion.title', (w.discussion && w.discussion.title) || 'Discussion Questions');
   set('discussion.content', listLines(w.discussion && w.discussion.content));
   set('tips.title', (w.tips && w.tips.title) || 'Tips');
   set('tips.content', listLines(w.tips && w.tips.content));
   updateWeekLabel(div);
   return div;
}

function updateWeekLabel(card) {
   const num = card.querySelector('[data-field="week"]').value;
   const title = card.querySelector('[data-field="title"]').value;
   card.querySelector('[data-week-badge]').textContent = num ? 'Week ' + num : 'Week';
   card.querySelector('[data-week-label]').textContent = title || 'Untitled week';
}

function nextWeekNumber() {
   let max = 0;
   $$('#weekList [data-field="week"]').forEach(inp => {
      const n = parseInt(inp.value, 10);
      if (!isNaN(n) && n > max) max = n;
   });
   return max + 1;
}

// ---------- rendering ----------
function renderAll() {
   const videos = $('#videosList');
   videos.innerHTML = '';
   (dataState.trainingVideos || []).forEach(v => videos.appendChild(makeRow(v)));

   const weeks = $('#weekList');
   weeks.innerHTML = '';
   weekSeq = 0;
   (dataState.weeklyResources || []).forEach((w, i) => weeks.appendChild(makeWeekCard(w, i)));

   $('#weekendTitle').value = (dataState.weekendResources && dataState.weekendResources.title) || '';
   const wk = (dataState.weekendResources || {});
   fillList('#wkMainTalks', wk.mainTalks);
   fillList('#wkTraining', wk.trainingVideos);
   fillList('#wkGuides', wk.guides);
   fillList('#wkTeamGuides', wk.teamGuides);

   const guides = $('#guidesList');
   guides.innerHTML = '';
   (dataState.additionalGuides || []).forEach(g => guides.appendChild(makeGuideRow(g)));
}

function fillList(selector, arr) {
   const box = $(selector);
   box.innerHTML = '';
   (arr || []).forEach(item => box.appendChild(makeRow(item)));
}

// ---------- build JSON from the form ----------
function collectRows(container) {
   return $$('.edit-row', container).map(row => {
      const obj = {};
      $$('[data-field]', row).forEach(inp => { obj[inp.dataset.field] = inp.value.trim(); });
      return obj;
   });
}

function buildData() {
   const generated = {};

   generated.trainingVideos = collectRows($('#videosList'));

   generated.weeklyResources = $$('#weekList .week-card').map(card => {
      const origIndex = card.dataset.origIndex;
      const source = (origIndex !== undefined && dataState.weeklyResources && dataState.weeklyResources[origIndex])
         ? dataState.weeklyResources[origIndex]
         : {};
      const base = Object.assign({}, source);
      const get = field => {
         const inp = card.querySelector('[data-field="' + field + '"]');
         return inp ? inp.value.trim() : '';
      };
      const getLines = field => {
         const inp = card.querySelector('[data-field="' + field + '"]');
         return inp ? inp.value.split('\n').map(s => s.trim()).filter(Boolean) : [];
      };
      base.week = parseInt(get('week'), 10) || 0;
      base.title = get('title');
      ['talk', 'briefing', 'guide', 'teamGuide'].forEach(key => {
         base[key] = { title: get(key + '.title'), url: get(key + '.url') };
      });
      base.icebreaker = { title: get('icebreaker.title') || 'Icebreaker', content: getLines('icebreaker.content') };
      base.discussion = { title: get('discussion.title') || 'Discussion Questions', content: getLines('discussion.content') };
      base.tips = { title: get('tips.title') || 'Tips', content: getLines('tips.content') };
      return base;
   });

   const weekend = Object.assign({}, dataState.weekendResources || {});
   weekend.title = $('#weekendTitle').value.trim();
   weekend.mainTalks = collectRows($('#wkMainTalks'));
   weekend.trainingVideos = collectRows($('#wkTraining'));
   weekend.guides = collectRows($('#wkGuides'));
   weekend.teamGuides = collectRows($('#wkTeamGuides'));
   generated.weekendResources = weekend;

   generated.additionalGuides = collectRows($('#guidesList'));

   // Keep the original key order and any extra keys (_instructions etc.)
   const out = {};
   Object.keys(dataState).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(generated, key)) {
         out[key] = generated[key];
      } else {
         out[key] = dataState[key];
      }
   });
   Object.keys(generated).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(out, key)) out[key] = generated[key];
   });
   return out;
}

function buildJson() {
   return JSON.stringify(buildData(), null, 4) + '\n';
}

// ---------- validation ----------
function validate() {
   const errors = [];
   $$('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

   $$('[data-url]').forEach(inp => {
      const v = inp.value.trim();
      if (v && !/^https?:\/\/\S+$/i.test(v)) {
         inp.classList.add('is-invalid');
         errors.push('This link must start with http:// or https:// - got: ' + v);
      }
   });

   const seen = {};
   $$('#weekList .week-card').forEach(card => {
      const numInput = card.querySelector('[data-field="week"]');
      const titleInput = card.querySelector('[data-field="title"]');
      const n = parseInt(numInput.value, 10);
      if (!n || n < 1) {
         numInput.classList.add('is-invalid');
         errors.push('Every week needs a week number.');
      } else if (seen[n]) {
         numInput.classList.add('is-invalid');
         errors.push('Two weeks both have number ' + n + ' - please make them unique.');
      } else {
         seen[n] = true;
      }
      if (!titleInput.value.trim()) {
         titleInput.classList.add('is-invalid');
         errors.push('Week ' + (numInput.value || '?') + ' needs a title.');
      }
   });
   return errors;
}

function showValidation(errors) {
   const box = $('#validationBox');
   box.innerHTML = '';
   const heading = document.createElement('strong');
   heading.textContent = 'Please fix the following before saving:';
   box.appendChild(heading);
   const list = document.createElement('ul');
   list.className = 'mb-0';
   errors.forEach(msg => {
      const li = document.createElement('li');
      li.textContent = msg;
      list.appendChild(li);
   });
   box.appendChild(list);
   box.classList.remove('d-none');
   box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---------- save ----------
function buildStatusSuccess(commitUrl) {
   const box = $('#saveStatus');
   box.innerHTML = '';
   const div = document.createElement('div');
   div.className = 'save-success';
   div.appendChild(document.createTextNode('Saved! The website will refresh within about a minute. '));
   if (commitUrl) {
      const link = document.createElement('a');
      link.href = commitUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'View this change on GitHub';
      div.appendChild(link);
      div.appendChild(document.createTextNode(' (every save is a restore point).'));
   }
   box.appendChild(div);
}

function setSaving(busy) {
   const btn = $('#saveBtn');
   btn.disabled = busy;
   btn.innerHTML = busy
      ? '<span class="spinner-border spinner-border-sm me-1"></span>Saving...'
      : '<i class="fas fa-cloud-upload-alt me-1"></i> Save to website';
}

async function save() {
   if (!dataState) return;
   $('#validationBox').classList.add('d-none');
   $('#saveStatus').innerHTML = '';

   const errors = validate();
   if (errors.length) {
      showValidation(errors);
      return;
   }

   let json;
   try {
      json = buildJson();
      JSON.parse(json);
   } catch (err) {
      showAlert($('#validationBox'), 'Could not build valid content: ' + err.message);
      return;
   }

   setSaving(true);
   try {
      const result = await pushContent(json, 'Update content via admin panel');
      try { await loadContent(); } catch (e) { /* refresh sha; non-fatal */ }
      buildStatusSuccess(result && result.commit ? result.commit.html_url : '');
      toast('Saved successfully', 'success');
   } catch (err) {
      handleSaveError(err);
   } finally {
      setSaving(false);
   }
}

function handleSaveError(err) {
   if (err.status === 401) {
      signOut(true);
      showTokenStep('Your token is invalid or expired - please sign in again.');
      return;
   }
   if (err.status === 403) {
      showAlert($('#validationBox'), 'Your token does not have permission to save. Edit the token on GitHub and give it "Contents: Read and write" permission for this repository.');
      return;
   }
   if (err.status === 404) {
      showAlert($('#validationBox'), 'Repository or file not found. Check the settings in js/admin-config.js and that your token includes this repository.');
      return;
   }
   if (err.status === 409) {
      showAlert($('#validationBox'), 'Someone else saved while you were editing. Press Save again to save your version.');
      return;
  }
   showAlert($('#validationBox'), 'Save failed: ' + err.message);
}

function downloadBackup() {
   const json = buildJson();
   const blob = new Blob([json], { type: 'application/json' });
   const a = document.createElement('a');
   a.href = URL.createObjectURL(blob);
   a.download = 'data.json';
   document.body.appendChild(a);
   a.click();
   a.remove();
   URL.revokeObjectURL(a.href);
   toast('Backup downloaded', 'success');
}

// ---------- events ----------
function bindLogin() {
   $('#passwordBtn').addEventListener('click', unlock);
   $('#passwordInput').addEventListener('keydown', e => { if (e.key === 'Enter') unlock(); });
   $('#tokenBtn').addEventListener('click', connectToken);
   $('#tokenInput').addEventListener('keydown', e => { if (e.key === 'Enter') connectToken(); });
}

function bindEditor() {
   $('#tabButtons').addEventListener('click', e => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      $$('#tabButtons .nav-link').forEach(b => b.classList.toggle('active', b === btn));
      $$('.tab-pane').forEach(pane => {
         const on = pane.id === btn.dataset.tab;
         pane.classList.toggle('active', on);
         pane.classList.toggle('show', on);
      });
   });

   $('#addVideoBtn').addEventListener('click', () => $('#videosList').appendChild(makeRow({})));
   $('#addGuideBtn').addEventListener('click', () => $('#guidesList').appendChild(makeGuideRow({})));
   $('#addWeekBtn').addEventListener('click', () => {
      const card = makeWeekCard({ week: nextWeekNumber(), title: '' }, null);
      $('#weekList').appendChild(card);
      card.querySelector('.accordion-button').click();
   });

   $$('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => $('#' + btn.dataset.add).appendChild(makeRow({})));
   });

   $('#saveBtn').addEventListener('click', save);
   $('#downloadBtn').addEventListener('click', downloadBackup);
   $('#signOutBtn').addEventListener('click', () => signOut(false));

   // Delegated row controls
   document.addEventListener('click', e => {
      const remove = e.target.closest('.btn-remove');
      if (remove) {
         const row = remove.closest('.edit-row');
         if (row) row.remove();
         return;
      }
      const dup = e.target.closest('[data-action="dup-week"]');
      if (dup) {
         const card = dup.closest('.week-card');
         const clone = card.cloneNode(true);
         const panel = clone.querySelector('.accordion-collapse');
         const button = clone.querySelector('.accordion-button');
         const newId = 'weekPanel' + weekSeq++;
         panel.id = newId;
         panel.classList.remove('show');
         button.setAttribute('data-bs-target', '#' + newId);
         button.classList.add('collapsed');
         button.setAttribute('aria-expanded', 'false');
         delete clone.dataset.origIndex;
         clone.querySelector('[data-field="week"]').value = nextWeekNumber();
         updateWeekLabel(clone);
         card.after(clone);
         return;
      }
      const del = e.target.closest('[data-action="del-week"]');
      if (del) {
         const card = del.closest('.week-card');
         const label = card.querySelector('[data-field="title"]').value || 'this week';
         if (window.confirm('Delete "' + label + '"? This cannot be undone until you press Save (or never, if you do not save).')) {
            card.remove();
         }
      }
   });

   // Live header labels
   document.addEventListener('input', e => {
      const card = e.target.closest('.week-card');
      if (card) updateWeekLabel(card);
   });
}

function init() {
   bindLogin();
   bindEditor();

   let unlocked = false;
   try { unlocked = sessionStorage.getItem('adminUnlocked') === '1'; } catch (e) { /* ignore */ }

   if (!unlocked) {
      showPasswordStep();
      return;
   }
   if (token) {
      enterEditor();
   } else {
      showTokenStep();
   }
}

if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', init);
} else {
   init();
}
