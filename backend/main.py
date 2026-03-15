import os
import psycopg2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "requestdb")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")


def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )


def init_db():
    conn = get_connection()
    try:
        cur = conn.cursor()
        try:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS requests (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    body TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()
        finally:
            cur.close()
    finally:
        conn.close()


@app.on_event("startup")
def startup():
    init_db()


class Request(BaseModel):
    username: str
    email: str
    body: str


@app.get("/")
def home():
    return {"status": "request system running"}


@app.post("/create_request")
def create_request(req: Request):
    conn = get_connection()
    try:
        cur = conn.cursor()
        try:
            cur.execute(
                "INSERT INTO requests (username, email, body) VALUES (%s, %s, %s) RETURNING id",
                (req.username, req.email, req.body),
            )
            new_id = cur.fetchone()[0]
            conn.commit()
        finally:
            cur.close()
    finally:
        conn.close()
    return {
        "message": "request received",
        "id": new_id,
        "user": req.username,
        "body": req.body,
    }


@app.get("/requests")
def get_requests(limit: int = 20, offset: int = 0):
    conn = get_connection()
    try:
        cur = conn.cursor()
        try:
            cur.execute(
                "SELECT id, username, email, body, created_at FROM requests ORDER BY id LIMIT %s OFFSET %s",
                (limit, offset),
            )
            rows = cur.fetchall()
        finally:
            cur.close()
    finally:
        conn.close()
    return [
        {
            "id": row[0],
            "username": row[1],
            "email": row[2],
            "body": row[3],
            "created_at": row[4],
        }
        for row in rows
    ]


@app.get("/requests/{request_id}")
def get_request(request_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        try:
            cur.execute(
                "SELECT id, username, email, body, created_at FROM requests WHERE id = %s",
                (request_id,),
            )
            row = cur.fetchone()
        finally:
            cur.close()
    finally:
        conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return {
        "id": row[0],
        "username": row[1],
        "email": row[2],
        "body": row[3],
        "created_at": row[4],
    }
