from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

templates = Jinja2Templates(directory="frontend")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

from pydantic import BaseModel

requests_db=[]

class RequestData(BaseModel):
    username:str
    email:str
    body:str

@app.post("/create_request")
def create_request(req:RequestData):

    requests_db.append({
        "username":req.username,
        "body":req.body
    })

    return {"status":"saved"}

@app.get("/requests")
def get_requests():
    return {"requests":requests_db}
