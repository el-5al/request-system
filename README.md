# request-system

A simple request-tracking system built with FastAPI and PostgreSQL, deployable via Docker.

## Features

- Create, read, update, and delete requests
- PostgreSQL database with SQLAlchemy ORM
- Auto-generated interactive API docs at `/docs`

## Quick Start

### With Docker Compose (recommended)

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`.

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```

3. Start a PostgreSQL instance and update `DATABASE_URL` in `.env`.

4. Run the server:
   ```bash
   uvicorn backend.main:app --reload
   ```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/requests` | Create a new request |
| GET | `/requests` | List all requests |
| GET | `/requests/{id}` | Get a request by ID |
| PATCH | `/requests/{id}` | Update a request |
| DELETE | `/requests/{id}` | Delete a request |

Interactive docs: `http://localhost:8000/docs`
