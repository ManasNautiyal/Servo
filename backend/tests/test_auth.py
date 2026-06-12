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


def test_forgot_password_user_not_found(client):
    response = client.post("/api/auth/forgot-password/send-otp", json={"email": "nonexistent@college.edu"})
    assert response.status_code == 404


def test_forgot_password_send_otp_success(client, db):
    # Register a user first
    register_payload = {
        "name": "Amit Patel",
        "email": "amit@college.edu",
        "college_id": "CS-2023-099",
        "branch": "Computer Science",
        "year": 3,
        "password": "securepassword123"
    }
    client.post("/api/auth/register", json=register_payload)
    
    # Request OTP
    response = client.post("/api/auth/forgot-password/send-otp", json={"email": "amit@college.edu"})
    assert response.status_code == 200
    
    # Verify OTP verification record exists in DB
    from app.database.models import OTPVerification
    otp_record = db.query(OTPVerification).filter(OTPVerification.email == "amit@college.edu").first()
    assert otp_record is not None
    assert len(otp_record.otp_code) == 6


def test_forgot_password_reset_invalid_otp(client):
    # Register a user first
    register_payload = {
        "name": "Amit Patel",
        "email": "amit@college.edu",
        "college_id": "CS-2023-099",
        "branch": "Computer Science",
        "year": 3,
        "password": "securepassword123"
    }
    client.post("/api/auth/register", json=register_payload)
    
    # Send OTP request to establish record in DB
    client.post("/api/auth/forgot-password/send-otp", json={"email": "amit@college.edu"})
    
    # Attempt reset with wrong OTP
    reset_payload = {
        "email": "amit@college.edu",
        "otp": "999999",
        "new_password": "newsecurepassword123"
    }
    response = client.post("/api/auth/forgot-password/reset", json=reset_payload)
    assert response.status_code == 400
    assert "Invalid" in response.json()["detail"]


def test_forgot_password_reset_success_and_login(client, db):
    # Register a user first
    register_payload = {
        "name": "Amit Patel",
        "email": "amit@college.edu",
        "college_id": "CS-2023-099",
        "branch": "Computer Science",
        "year": 3,
        "password": "securepassword123"
    }
    client.post("/api/auth/register", json=register_payload)
    
    # Request OTP to generate database record
    client.post("/api/auth/forgot-password/send-otp", json={"email": "amit@college.edu"})
    
    # Fetch the generated OTP from the test database
    from app.database.models import OTPVerification
    otp_record = db.query(OTPVerification).filter(OTPVerification.email == "amit@college.edu").first()
    assert otp_record is not None
    real_otp = otp_record.otp_code

    # Reset password using the actual OTP code
    reset_payload = {
        "email": "amit@college.edu",
        "otp": real_otp,
        "new_password": "newsecurepassword123"
    }
    response = client.post("/api/auth/forgot-password/reset", json=reset_payload)
    assert response.status_code == 200
    
    # Try logging in with old password (should fail)
    login_payload_old = {
        "email": "amit@college.edu",
        "password": "securepassword123"
    }
    login_response_old = client.post("/api/auth/login", json=login_payload_old)
    assert login_response_old.status_code == 401
    
    # Try logging in with new password (should succeed)
    login_payload_new = {
        "email": "amit@college.edu",
        "password": "newsecurepassword123"
    }
    login_response_new = client.post("/api/auth/login", json=login_payload_new)
    assert login_response_new.status_code == 200
    assert "access_token" in login_response_new.json()

