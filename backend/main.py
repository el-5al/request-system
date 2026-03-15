from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from datetime import datetime, timezone
import os
import uuid

app = FastAPI()

BASE_DIR = os.path.dirname(__file__)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# In-memory store: list of dicts
_requests: list[dict] = []


class RequestModel(BaseModel):
    username: str
    email: str
    body: str


# ── HTML routes ──────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "total": len(_requests)},
    )


@app.get("/submit", response_class=HTMLResponse)
def submit_form(request: Request):
    return templates.TemplateResponse("submit.html", {"request": request, "error": None})


@app.post("/submit", response_class=HTMLResponse)
def submit_request(
    request: Request,
    username: str = Form(...),
    email: str = Form(...),
    body: str = Form(...),
):
    entry = {
        "id": str(uuid.uuid4()),
        "username": username,
        "email": email,
        "body": body,
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "status": "open",
    }
    _requests.append(entry)
    return templates.TemplateResponse(
        "success.html",
        {"request": request, "entry": entry},
    )


@app.get("/requests", response_class=HTMLResponse)
def list_requests(request: Request):
    return templates.TemplateResponse(
        "requests.html",
        {"request": request, "requests": list(reversed(_requests))},
    )


@app.get("/requests/{request_id}", response_class=HTMLResponse)
def request_detail(request: Request, request_id: str):
    entry = next((r for r in _requests if r["id"] == request_id), None)
    if entry is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return templates.TemplateResponse(
        "request_detail.html",
        {"request": request, "entry": entry},
    )


# ── JSON API (backwards-compatible) ──────────────────────────────────────────

@app.post("/create_request")
def create_request(req: RequestModel):
    entry = {
        "id": str(uuid.uuid4()),
        "username": req.username,
        "email": req.email,
        "body": req.body,
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "status": "open",
    }
    _requests.append(entry)
    return {
        "message": "request received",
        "user": req.username,
        "body": req.body,
    }
