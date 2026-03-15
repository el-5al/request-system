# Request System

A simple web-based request management system that allows users to submit and track requests.

## Features

- Submit new requests with title, description, and priority
- View all submitted requests with their current status
- Update request status (Pending → In Progress → Resolved)
- Delete requests
- Persistent storage via a JSON file

## Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- npm (comes with Node.js)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourrepo/request-system.git
cd request-system

# Install dependencies
npm install

# Start the server
npm start
```

The app will be available at **http://localhost:3000**.

## Development

```bash
# Start the server with auto-reload
npm run dev
```

## Project Structure

```
request-system/
├── public/
│   ├── index.html   # Frontend UI
│   ├── style.css    # Styles
│   └── app.js       # Frontend logic
├── data/
│   └── requests.json  # Persistent data store
├── server.js        # Express server & REST API
├── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | List all requests |
| POST | `/api/requests` | Create a new request |
| PATCH | `/api/requests/:id` | Update a request |
| DELETE | `/api/requests/:id` | Delete a request |

## License

MIT