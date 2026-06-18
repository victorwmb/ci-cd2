import pytest
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)


import server

class MockCursor:
    def __init__(self, data=None):
        self.data = data or []
        self.lastrowid = 1
        self.executed_query = ""

    def execute(self, query, params=None):
        self.executed_query = query
        if "SELECT * FROM utilisateurs WHERE email" in query:
            if params and params[0] == "admin@test.com" and params[1] == "adminpass":
                self.data = [{"id": 1, "email": "admin@test.com", "is_admin": True}]
            else:
                self.data = []
        elif "SELECT * FROM utilisateurs" in query:
            self.data = [
                {"id": 1, "nom": "Doe", "prenom": "John", "email": "john@test.com", "birthDate": "2000-01-01", "city": "Paris", "postalCode": "75000", "is_admin": False}
            ]

    def fetchone(self):
        return self.data[0] if self.data else None

    def fetchall(self):
        return self.data

class MockConnection:
    def cursor(self, dictionary=False):
        return MockCursor()
    def commit(self):
        pass
    def close(self):
        pass

def mock_get_db_connection():
    return MockConnection()

server.get_db_connection = mock_get_db_connection

def test_login_success():
    response = client.post("/login", json={"email": "admin@test.com", "password": "adminpass"})
    assert response.status_code == 200
    assert response.json()["success"] == True
    assert response.json()["isAdmin"] == True

def test_login_failure():
    response = client.post("/login", json={"email": "wrong@test.com", "password": "wrongpass"})
    assert response.status_code == 401

def test_get_users_public():
    response = client.get("/users")
    assert response.status_code == 200
    users = response.json()["utilisateurs"]
    assert len(users) == 1
    assert "birthDate" not in users[0]

def test_get_users_admin():
    response = client.get("/users", headers={"Authorization": "Bearer admin-token-secret"})
    assert response.status_code == 200
    users = response.json()["utilisateurs"]
    assert len(users) == 1
    assert "birthDate" in users[0]

def test_create_user():
    response = client.post("/users", json={
        "lastName": "Smith",
        "firstName": "Jane",
        "email": "jane@test.com",
        "birthDate": "1990-01-01",
        "city": "Lyon",
        "postalCode": "69000"
    })
    assert response.status_code == 200
    assert response.json()["success"] == True

def test_delete_user_unauthorized():
    response = client.delete("/users/1")
    assert response.status_code == 403

def test_delete_user_authorized():
    response = client.delete("/users/1", headers={"Authorization": "Bearer admin-token-secret"})
    assert response.status_code == 200
    assert response.json()["success"] == True
