from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import os

app = FastAPI()

BASE_DIR = os.path.dirname(__file__)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))


class RequestModel(BaseModel):
    username: str
    email: str
    body: str


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


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
    return templates.TemplateResponse(
        "success.html",
        {"request": request, "username": username, "email": email, "body": body},
    )


@app.post("/create_request")
def create_request(req: RequestModel):
    return {
        "message": "request received",
        "user": req.username,
        "body": req.body,
    }
