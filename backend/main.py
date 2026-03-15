from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Request(BaseModel):
    username: str
    email: str
    body: str

@app.get("/")
def home():
    return {"status": "request system running"}

@app.post("/create_request")
def create_request(req: Request):
    return {
        "message": "request received",
        "user": req.username,
        "body": req.body
    }
