/**
 * Request System – app.js
 * Manages request data stored in localStorage and renders the UI.
 */

const STORAGE_KEY = 'requestSystem_requests';
let _idCounter = 0;

// ── State ──────────────────────────────────────────────────────────────────
let requests = loadRequests();

// ── Persistence ────────────────────────────────────────────────────────────
function loadRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const loaded = raw ? JSON.parse(raw) : [];
    // Sync counter so new IDs are always greater than any stored ID
    loaded.forEach((r) => { if (r.id >= _idCounter) _idCounter = r.id + 1; });
    return loaded;
  } catch {
    return [];
  }
}

function saveRequests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

// ── CRUD ───────────────────────────────────────────────────────────────────
function addRequest(title, category, priority, description) {
  const request = {
    id: _idCounter++,
    title: title.trim(),
    category,
    priority,
    description: description.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  requests.unshift(request);
  saveRequests();
  return request;
}

function updateStatus(id, status) {
  const req = requests.find((r) => r.id === id);
  if (req) {
    req.status = status;
    saveRequests();
  }
}

// ── Rendering ──────────────────────────────────────────────────────────────
function statusBadge(status) {
  const classMap = {
    Pending: 'badge-pending',
    'In Progress': 'badge-progress',
    Resolved: 'badge-resolved',
  };
  return `<span class="badge ${classMap[status] || ''}">${escapeHtml(status)}</span>`;
}

function priorityLabel(priority) {
  const classMap = {
    Low: 'priority-low',
    Medium: 'priority-medium',
    High: 'priority-high',
    Critical: 'priority-critical',
  };
  return `<span class="${classMap[priority] || ''}">${escapeHtml(priority)}</span>`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTable() {
  const tbody = document.getElementById('requests-body');
  const emptyMsg = document.getElementById('empty-message');
  const filterStatus = document.getElementById('filter-status').value;
  const filterCategory = document.getElementById('filter-category').value;

  const filtered = requests.filter((r) => {
    return (
      (!filterStatus || r.status === filterStatus) &&
      (!filterCategory || r.category === filterCategory)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');

  tbody.innerHTML = filtered
    .map((r, index) => {
      const canStart = r.status === 'Pending';
      const canResolve = r.status !== 'Resolved';

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(r.title)}</td>
          <td>${escapeHtml(r.category)}</td>
          <td>${priorityLabel(r.priority)}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${formatDate(r.createdAt)}</td>
          <td class="actions">
            <button class="btn btn-action action-btn"
              data-id="${r.id}" data-status="In Progress"
              ${canStart ? '' : 'disabled'}>Start</button>
            <button class="btn btn-action action-btn"
              data-id="${r.id}" data-status="Resolved"
              ${canResolve ? '' : 'disabled'}>Resolve</button>
          </td>
        </tr>`;
    })
    .join('');
}

// ── Event handlers ─────────────────────────────────────────────────────────
// Use event delegation on the tbody instead of inline onclick handlers
document.getElementById('requests-body').addEventListener('click', (e) => {
  const btn = e.target.closest('.action-btn');
  if (!btn || btn.disabled) return;
  const id = parseInt(btn.dataset.id, 10);
  const status = btn.dataset.status;
  if (!Number.isFinite(id) || !status) return;
  updateStatus(id, status);
  renderTable();
});

function validateForm(title, category, priority) {
  let valid = true;

  const titleEl = document.getElementById('title');
  const categoryEl = document.getElementById('category');
  const priorityEl = document.getElementById('priority');

  [titleEl, categoryEl, priorityEl].forEach((el) => el.classList.remove('invalid'));

  if (!title.trim()) { titleEl.classList.add('invalid'); valid = false; }
  if (!category)      { categoryEl.classList.add('invalid'); valid = false; }
  if (!priority)      { priorityEl.classList.add('invalid'); valid = false; }

  return valid;
}

document.getElementById('request-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const title       = document.getElementById('title').value;
  const category    = document.getElementById('category').value;
  const priority    = document.getElementById('priority').value;
  const description = document.getElementById('description').value;

  if (!validateForm(title, category, priority)) return;

  addRequest(title, category, priority, description);
  e.target.reset();
  renderTable();
});

document.getElementById('filter-status').addEventListener('change', renderTable);
document.getElementById('filter-category').addEventListener('change', renderTable);

document.getElementById('clear-filters').addEventListener('click', () => {
  document.getElementById('filter-status').value = '';
  document.getElementById('filter-category').value = '';
  renderTable();
});

// ── Boot ───────────────────────────────────────────────────────────────────
renderTable();
