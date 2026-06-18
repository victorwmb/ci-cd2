import mysql.connector
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "L'API Python est bien en ligne !"}

def get_db_connection():
    return mysql.connector.connect(
        database=os.getenv("MYSQL_DATABASE"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_ROOT_PASSWORD"),
        port=3306,
        host=os.getenv("MYSQL_HOST")
    )

class UserCreate(BaseModel):
    lastName: str
    firstName: str
    email: str
    birthDate: str
    city: str
    postalCode: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM utilisateurs WHERE email = %s AND password = %s AND is_admin = TRUE", (req.email, req.password))
    admin = cursor.fetchone()
    conn.close()
    if admin:
        return {"success": True, "isAdmin": True, "token": "admin-token-secret"}
    raise HTTPException(status_code=401, detail="Invalid credentials or not an admin")

@app.get("/users")
async def get_users(request: Request):
    token = request.headers.get("Authorization")
    is_admin = token == "Bearer admin-token-secret"
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM utilisateurs")
    records = cursor.fetchall()
    conn.close()
    
    users = []
    for r in records:
        if is_admin:
            users.append({
                "id": r["id"],
                "lastName": r["nom"],
                "firstName": r["prenom"],
                "email": r["email"],
                "birthDate": r["birthDate"],
                "city": r["city"],
                "postalCode": r["postalCode"],
                "isAdmin": bool(r["is_admin"])
            })
        else:
            users.append({
                "id": r["id"],
                "lastName": r["nom"],
                "firstName": r["prenom"],
                "email": r["email"]
            })
    return {'utilisateurs': users}

@app.post("/users")
async def create_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO utilisateurs (nom, prenom, email, birthDate, city, postalCode) VALUES (%s, %s, %s, %s, %s, %s)",
            (user.lastName, user.firstName, user.email, user.birthDate, user.city, user.postalCode)
        )
        conn.commit()
        user_id = cursor.lastrowid
    except mysql.connector.Error as err:
        conn.close()
        raise HTTPException(status_code=400, detail=str(err))
    
    conn.close()
    return {"success": True, "id": user_id}

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, request: Request):
    token = request.headers.get("Authorization")
    if token != "Bearer admin-token-secret":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM utilisateurs WHERE id = %s", (user_id,))
    conn.commit()
    conn.close()
    return {"success": True}