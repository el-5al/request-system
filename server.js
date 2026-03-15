const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'requests.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readRequests() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

function writeRequests(requests) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2), 'utf8');
}

// GET /api/requests — list all requests
app.get('/api/requests', (req, res) => {
  res.json(readRequests());
});

// POST /api/requests — create a new request
app.post('/api/requests', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }
  const requests = readRequests();
  const newRequest = {
    id: randomUUID(),
    title,
    description,
    priority: priority || 'medium',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  writeRequests(requests);
  res.status(201).json(newRequest);
});

// PATCH /api/requests/:id — update a request
app.patch('/api/requests/:id', (req, res) => {
  const requests = readRequests();
  const index = requests.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  const allowed = ['title', 'description', 'priority', 'status'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      requests[index][field] = req.body[field];
    }
  });
  writeRequests(requests);
  res.json(requests[index]);
});

// DELETE /api/requests/:id — delete a request
app.delete('/api/requests/:id', (req, res) => {
  const requests = readRequests();
  const index = requests.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  requests.splice(index, 1);
  writeRequests(requests);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Request System running at http://localhost:${PORT}`);
});
