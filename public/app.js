const form = document.getElementById('request-form');
const container = document.getElementById('requests-container');

const STATUS_CYCLE = {
  pending: 'in-progress',
  'in-progress': 'resolved',
  resolved: 'pending',
};

const STATUS_LABEL = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

async function fetchRequests() {
  const res = await fetch('/api/requests');
  if (!res.ok) throw new Error('Failed to load requests');
  return res.json();
}

async function createRequest(data) {
  const res = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create request');
  }
  return res.json();
}

async function updateRequest(id, data) {
  const res = await fetch(`/api/requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function deleteRequest(id) {
  await fetch(`/api/requests/${id}`, { method: 'DELETE' });
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderRequests(requests) {
  if (!requests.length) {
    container.innerHTML = '<p class="empty-msg">No requests yet.</p>';
    return;
  }

  container.innerHTML = requests
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(
      (r) => `
      <div class="request-card" data-id="${r.id}">
        <div class="request-header">
          <span class="request-title">${escapeHtml(r.title)}</span>
          <div>
            <span class="badge badge-priority-${r.priority}">${r.priority}</span>
            <span class="badge badge-status-${r.status}">${STATUS_LABEL[r.status] || r.status}</span>
          </div>
        </div>
        <p class="request-description">${escapeHtml(r.description)}</p>
        <p class="request-meta">Submitted: ${formatDate(r.createdAt)}</p>
        <div class="request-actions">
          <button class="btn btn-status" onclick="cycleStatus('${r.id}', '${r.status}')">
            Mark as ${STATUS_LABEL[STATUS_CYCLE[r.status]] || 'Pending'}
          </button>
          <button class="btn btn-danger" onclick="removeRequest('${r.id}')">Delete</button>
        </div>
      </div>
    `
    )
    .join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function cycleStatus(id, currentStatus) {
  const nextStatus = STATUS_CYCLE[currentStatus] || 'pending';
  await updateRequest(id, { status: nextStatus });
  await loadAndRender();
}

async function removeRequest(id) {
  if (!confirm('Delete this request?')) return;
  await deleteRequest(id);
  await loadAndRender();
}

async function loadAndRender() {
  try {
    const requests = await fetchRequests();
    renderRequests(requests);
  } catch (_) {
    container.innerHTML = '<p class="empty-msg">Failed to load requests.</p>';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const priority = document.getElementById('priority').value;

  try {
    await createRequest({ title, description, priority });
    form.reset();
    await loadAndRender();
  } catch (err) {
    alert(err.message);
  }
});

loadAndRender();
