import pytest

@pytest.fixture
def auth_token(client):
    # Register and login a student user to retrieve JWT token
    user_payload = {
        "name": "Service Provider",
        "email": "provider@college.edu",
        "college_id": "CS-2023-100",
        "branch": "Computer Science",
        "year": 4,
        "password": "password123"
    }
    client.post("/api/auth/register", json=user_payload)
    
    login_payload = {
        "email": "provider@college.edu",
        "password": "password123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    return res.json()["access_token"]

def test_create_service(client, auth_token):
    service_payload = {
        "title": "Python Assignment Assistance",
        "description": "I will assist you in debugging Python and writing data structures programs.",
        "category": "Technical",
        "price": 500.0,
        "delivery_time": 2,
        "tags": "python, coding, help",
        "status": "available"
    }
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/services", json=service_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Python Assignment Assistance"
    assert data["price"] == 500.0
    assert data["provider_id"] is not None

def test_search_services(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Create a test listing
    client.post("/api/services", json={
        "title": "React Frontend Development",
        "description": "I build responsive React single-page applications.",
        "category": "Technical",
        "price": 800.0,
        "delivery_time": 3,
        "tags": "react, js, website",
        "status": "available"
    }, headers=headers)
    
    # Query all
    response = client.get("/api/services")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Search match
    response_search = client.get("/api/services?query=React")
    assert len(response_search.json()) == 1
    
    # Search mismatch
    response_mismatch = client.get("/api/services?query=Python")
    assert len(response_mismatch.json()) == 0
