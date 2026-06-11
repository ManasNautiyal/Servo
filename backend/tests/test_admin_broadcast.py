import pytest
from app.database.models import User
from app.services.auth import hash_password, create_access_token

@pytest.fixture
def test_users(db):
    # Create an admin user
    admin = User(
        name="Admin User",
        email="admin@college.edu",
        password_hash=hash_password("adminpassword"),
        role="admin"
    )
    # Create two student users
    student1 = User(
        name="Student One",
        email="student1@college.edu",
        password_hash=hash_password("studentpassword"),
        role="student"
    )
    student2 = User(
        name="Student Two",
        email="student2@college.edu",
        password_hash=hash_password("studentpassword"),
        role="student"
    )
    db.add(admin)
    db.add(student1)
    db.add(student2)
    db.commit()
    return {
        "admin": admin,
        "student1": student1,
        "student2": student2
    }

def test_broadcast_email_success(client, test_users):
    # Generate admin token
    admin_token = create_access_token(
        data={"sub": test_users["admin"].email, "user_id": test_users["admin"].id, "role": "admin"}
    )
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    payload = {
        "subject": "Important platform update",
        "content": "Hello students,\n\nWe have updated the Servo platform details. Please check them out.\n\nBest,\nAdmin"
    }
    
    response = client.post("/api/admin/broadcast-email", json=payload, headers=headers)
    assert response.status_code == 200
    assert "initiated for 3 users" in response.json()["message"]

def test_broadcast_email_forbidden_for_student(client, test_users):
    # Generate student token
    student_token = create_access_token(
        data={"sub": test_users["student1"].email, "user_id": test_users["student1"].id, "role": "student"}
    )
    headers = {"Authorization": f"Bearer {student_token}"}
    
    payload = {
        "subject": "Hello",
        "content": "Hi there"
    }
    
    response = client.post("/api/admin/broadcast-email", json=payload, headers=headers)
    assert response.status_code == 403
    assert "administrative privileges" in response.json()["detail"]

def test_broadcast_email_unauthorized(client):
    payload = {
        "subject": "Hello",
        "content": "Hi there"
    }
    response = client.post("/api/admin/broadcast-email", json=payload)
    assert response.status_code == 401
