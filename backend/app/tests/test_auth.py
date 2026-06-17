import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.models import User

@pytest.mark.asyncio
async def test_user_registration_domain_restriction(client: AsyncClient):
    # Reject email not matching ALLOWED_EMAIL_DOMAIN (@dau.ac.in)
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@gmail.com",
            "password": "securepassword123",
            "role": "student"
        }
    )
    assert response.status_code == 400
    assert "Registration only allowed for domain" in response.json()["detail"]


@pytest.mark.asyncio
async def test_auth_direct_registration_flow(client: AsyncClient, db: AsyncSession):
    test_email = "teststudent@dau.ac.in"
    
    # 1. Register user
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "password": "securepassword123",
            "role": "student",
            "department": "Computer Science",
            "year": 2
        }
    )
    assert register_response.status_code == 201
    assert register_response.json()["email"] == test_email
    assert register_response.json()["is_verified"] is True
    
    # 2. Login immediately should succeed
    login_ok_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_email,
            "password": "securepassword123"
        }
    )
    assert login_ok_response.status_code == 200
    data = login_ok_response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    
    # 3. Test Refresh Token
    refresh_response = await client.post(
        "/api/v1/auth/refresh",
        json={
            "refresh_token": data["refresh_token"]
        }
    )
    assert refresh_response.status_code == 200
    refresh_data = refresh_response.json()
    assert "access_token" in refresh_data
    assert "refresh_token" in refresh_data


@pytest.mark.asyncio
async def test_auth_verify_email_no_op(client: AsyncClient):
    test_email = "nooptest@dau.ac.in"
    
    # Register first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "password": "securepassword123",
            "role": "student",
            "department": "Computer Science",
            "year": 2
        }
    )
    
    # Call verify-email
    verify_response = await client.post(
        "/api/v1/auth/verify-email",
        json={
            "email": test_email,
            "otp": "000000"
        }
    )
    assert verify_response.status_code == 200
    assert "verified successfully" in verify_response.json()["message"]


@pytest.mark.asyncio
async def test_auth_resend_otp_no_op(client: AsyncClient):
    # Call resend-otp
    resend_response = await client.post(
        "/api/v1/auth/resend-otp",
        json={"email": "nooptest@dau.ac.in"}
    )
    assert resend_response.status_code == 200
    assert "OTP verification is disabled" in resend_response.json()["message"]
