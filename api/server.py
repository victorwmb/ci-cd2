import mysql.connector
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connexion à la base de données via les variables d'environnement
conn = mysql.connector.connect(
    database=os.getenv("MYSQL_DATABASE"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_ROOT_PASSWORD"),
    port=3306,
    host=os.getenv("MYSQL_HOST")
)

@app.get("/users")
async def get_users():
    cursor = conn.cursor(dictionary=True) # dictionary=True permet d'avoir un affichage JSON propre
    cursor.execute("SELECT * FROM utilisateurs")
    records = cursor.fetchall()
    return {'utilisateurs': records}