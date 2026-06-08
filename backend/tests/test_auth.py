import pytest

def test_register_user(client):
    payload = {
        "name": "Amit Patel",
        "email": "amit@college.edu",
        "college_id": "CS-2023-099",
        "branch": "Computer Science",
        "year": 3,
        "password": "securepassword123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Amit Patel"
    assert data["email"] == "amit@college.edu"
    assert "id" in data
    assert data["role"] == "student"

def test_register_duplicate_email(client):
    payload = {
        "name": "Amit Patel",
        "email": "amit@college.edu",
        "college_id": "CS-2023-099",
        "branch": "Computer Science",
        "year": 3,
        "password": "securepassword123"
    }
    client.post("/api/auth/register", json=payload)
    
    # Try duplicate
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "exists" in response.json()["detail"]

def test_login_user(client):
    # Register first
    register_payload = {
        "name": "Amit Patel",
        "email": "amit@college.edu",
        "college_id": "CS-2023-099",
        "branch": "Computer Science",
        "year": 3,
        "password": "securepassword123"
    }
    client.post("/api/auth/register", json=register_payload)
    
    # Login
    login_payload = {
        "email": "amit@college.edu",
        "password": "securepassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_read_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
