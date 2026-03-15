from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/requestdb")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


Base.metadata.create_all(bind=engine)


class RequestCreate(BaseModel):
    title: str
    description: Optional[str] = None


class RequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class RequestOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


app = FastAPI(title="Request System")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"status": "request system running"}


@app.post("/requests", response_model=RequestOut, status_code=201)
def create_request(payload: RequestCreate, db: Session = Depends(get_db)):
    req = Request(title=payload.title, description=payload.description)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@app.get("/requests", response_model=list[RequestOut])
def list_requests(db: Session = Depends(get_db)):
    return db.query(Request).all()


@app.get("/requests/{request_id}", response_model=RequestOut)
def get_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


@app.patch("/requests/{request_id}", response_model=RequestOut)
def update_request(request_id: int, payload: RequestUpdate, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if payload.title is not None:
        req.title = payload.title
    if payload.description is not None:
        req.description = payload.description
    if payload.status is not None:
        req.status = payload.status
    db.commit()
    db.refresh(req)
    return req


@app.delete("/requests/{request_id}", status_code=204)
def delete_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(req)
    db.commit()

