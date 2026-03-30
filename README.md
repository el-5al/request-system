# Request System

A lightweight, browser-based request management application. No server or build step required — open `index.html` directly in any modern browser.

## Features

- **Submit requests** with title, category, priority, and description
- **Track status** — Pending → In Progress → Resolved
- **Filter** requests by status and category
- **Persistent storage** via `localStorage` — data survives page refreshes
- **XSS-safe** — all user content is HTML-escaped before rendering
- **Responsive** layout that works on desktop and mobile

## Getting Started

1. Clone or download this repository.
2. Open `index.html` in your browser.
3. Start submitting and managing requests immediately — no installation needed.

## Project Structure

```
request-system/
├── index.html   # Application markup (form + table)
├── style.css    # Styles and responsive layout
├── app.js       # Application logic (CRUD, rendering, filters)
├── .gitignore   # Common ignored artifacts
└── README.md    # This file

```

## Request Lifecycle

```
Pending  ──Start──▶  In Progress  ──Resolve──▶  Resolved
```

Requests can be deleted at any stage using the **Delete** button.

## Categories

IT · HR · Finance · Facilities · Other

## Priorities

Low · Medium · High · Critical