/**
 * Request System – client-side application
 * Persistence : localStorage
 * Security    : all user content escaped via escapeHtml before DOM insertion
 */

const STORAGE_KEY = 'request_system_v1';
const STATUS_FLOW = { 'Pending': 'In Progress', 'In Progress': 'Resolved' };

/* ── Utilities ──────────────────────────────────────────────── */

/**
 * Escape a string for safe HTML insertion.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format an ISO date string to a short local date/time.
 * @param {string} iso
 * @returns {string}
 */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/* ── Storage ────────────────────────────────────────────────── */

function loadRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { counter: 0, items: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.items)) return { counter: 0, items: [] };
    return parsed;
  } catch {
    return { counter: 0, items: [] };
  }
}

function saveRequests(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ── State ──────────────────────────────────────────────────── */

let state = loadRequests();

// Sync counter with max existing ID to avoid collisions after manual storage edits
if (state.items.length > 0) {
  const maxId = state.items.reduce((m, r) => Math.max(m, r.id), 0);
  if (maxId > state.counter) state.counter = maxId;
}

/* ── CRUD ───────────────────────────────────────────────────── */

/**
 * Add a new request and persist.
 * @param {{ title: string, category: string, priority: string, description: string }} fields
 * @returns {object} The created request object.
 */
function addRequest(fields) {
  state.counter += 1;
  const request = {
    id: state.counter,
    title: fields.title.trim(),
    category: fields.category,
    priority: fields.priority,
    description: fields.description.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  state.items.push(request);
  saveRequests(state);
  return request;
}

/**
 * Advance a request to the next status in the flow, or no-op if already resolved.
 * @param {number} id
 */
function advanceStatus(id) {
  const req = state.items.find(r => r.id === id);
  if (!req) return;
  const next = STATUS_FLOW[req.status];
  if (next) {
    req.status = next;
    saveRequests(state);
  }
}

/**
 * Delete a request by id.
 * @param {number} id
 */
function deleteRequest(id) {
  state.items = state.items.filter(r => r.id !== id);
  saveRequests(state);
}

/* ── Rendering ──────────────────────────────────────────────── */

const statusBadgeClass = {
  'Pending':     'badge-pending',
  'In Progress': 'badge-in-progress',
  'Resolved':    'badge-resolved'
};

const priorityBadgeClass = {
  'Low':      'badge-low',
  'Medium':   'badge-medium',
  'High':     'badge-high',
  'Critical': 'badge-critical'
};

/**
 * Build the action buttons HTML for a given request status.
 * @param {number} id
 * @param {string} status
 * @returns {string}
 */
function buildActionsHtml(id, status) {
  const safeId = escapeHtml(String(id));
  const safeStatus = escapeHtml(status);
  let html = '';

  if (status === 'Pending') {
    html += `<button class="btn btn-start action-btn" data-id="${safeId}" data-action="advance" aria-label="Start request ${safeId}">Start</button>`;
  } else if (status === 'In Progress') {
    html += `<button class="btn btn-resolve action-btn" data-id="${safeId}" data-action="advance" aria-label="Resolve request ${safeId}">Resolve</button>`;
  }

  html += `<button class="btn btn-delete action-btn" data-id="${safeId}" data-action="delete" aria-label="Delete request ${safeId}">Delete</button>`;
  return html;
}

/**
 * Re-render the requests table based on current filters.
 */
function renderTable() {
  const tbody = document.getElementById('requests-body');
  const emptyMsg = document.getElementById('empty-message');
  const filterStatus = document.getElementById('filter-status').value;
  const filterCategory = document.getElementById('filter-category').value;

  const filtered = state.items.filter(r => {
    return (!filterStatus || r.status === filterStatus) &&
           (!filterCategory || r.category === filterCategory);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  const rows = filtered.map(r => {
    const statusClass = statusBadgeClass[r.status] || '';
    const priorityClass = priorityBadgeClass[r.priority] || '';
    return `
      <tr>
        <td>${escapeHtml(String(r.id))}</td>
        <td class="td-title" title="${escapeHtml(r.description)}">${escapeHtml(r.title)}</td>
        <td>${escapeHtml(r.category)}</td>
        <td><span class="badge ${priorityClass}">${escapeHtml(r.priority)}</span></td>
        <td><span class="badge ${statusClass}">${escapeHtml(r.status)}</span></td>
        <td>${escapeHtml(formatDate(r.createdAt))}</td>
        <td class="td-actions">${buildActionsHtml(r.id, r.status)}</td>
      </tr>
    `;
  });

  tbody.innerHTML = rows.join('');
}

/* ── Event handlers ─────────────────────────────────────────── */

// Form submission
document.getElementById('request-form').addEventListener('submit', e => {
  e.preventDefault();
  const errorEl = document.getElementById('form-error');
  errorEl.textContent = '';

  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const priority = document.getElementById('priority').value;
  const description = document.getElementById('description').value.trim();

  if (!title || !category || !priority || !description) {
    errorEl.textContent = 'Please fill in all required fields.';
    return;
  }

  addRequest({ title, category, priority, description });
  e.target.reset();
  renderTable();
});

// Delegated click handler for action buttons in the table
document.getElementById('requests-body').addEventListener('click', e => {
  const btn = e.target.closest('.action-btn');
  if (!btn || btn.disabled) return;

  const id = parseInt(btn.dataset.id, 10);
  const action = btn.dataset.action;

  if (!Number.isFinite(id) || !action) return;

  if (action === 'advance') {
    advanceStatus(id);
  } else if (action === 'delete') {
    if (confirm('Delete this request?')) {
      deleteRequest(id);
    }
  }

  renderTable();
});

// Filter change handlers
document.getElementById('filter-status').addEventListener('change', renderTable);
document.getElementById('filter-category').addEventListener('change', renderTable);

/* ── Init ────────────────────────────────────────────────────── */
renderTable();
