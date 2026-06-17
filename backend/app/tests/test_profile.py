import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.models import User, StudentProfile

@pytest.mark.asyncio
async def test_student_profile_flow(client: AsyncClient, db: AsyncSession):
    test_email = "profilestudent@dau.ac.in"
    
    # 1. Register a student
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "password": "securepassword123",
            "role": "student",
            "department": "Computer Science",
            "year": 1
        }
    )
    assert register_response.status_code == 201
    
    # 2. Login to get token
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_email,
            "password": "securepassword123"
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. GET /profile/me
    get_response = await client.get("/api/v1/profile/me", headers=headers)
    assert get_response.status_code == 200
    profile_data = get_response.json()
    assert profile_data["department"] == "Computer Science"
    assert profile_data["year"] == 1
    assert profile_data["interests"] == []
    assert profile_data["skills"] == []
    
    # 4. PUT /profile/me to update
    put_response = await client.put(
        "/api/v1/profile/me",
        headers=headers,
        json={
            "interests": ["AI", "Robotics"],
            "skills": ["Python", "C++"],
            "department": "Information Technology",
            "year": 2,
            "career_goals": "Build smart robotics systems"
        }
    )
    assert put_response.status_code == 200
    updated_data = put_response.json()
    assert updated_data["interests"] == ["AI", "Robotics"]
    assert updated_data["skills"] == ["Python", "C++"]
    assert updated_data["department"] == "Information Technology"
    assert updated_data["year"] == 2
    assert updated_data["career_goals"] == "Build smart robotics systems"
    
    # 5. Direct database verification
    # Clear session/expire cache to fetch fresh from DB
    db.expire_all()
    
    # Check User table
    user_res = await db.execute(select(User).where(User.email == test_email))
    db_user = user_res.scalar_one()
    assert db_user.department == "Information Technology"
    assert db_user.year == 2
    
    # Check StudentProfile table
    profile_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == db_user.id))
    db_profile = profile_res.scalar_one()
    assert db_profile.interests == ["AI", "Robotics"]
    assert db_profile.skills == ["Python", "C++"]
    assert db_profile.career_goals == "Build smart robotics systems"
