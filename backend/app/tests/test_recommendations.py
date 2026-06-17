import pytest
import datetime
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.models import User, StudentProfile, Event, EventCategory, EventSource, EventMatch, MatchStatus
from app.services.ai_matching import run_matching_for_student

@pytest.mark.asyncio
async def test_recommendations_retrieval(client: AsyncClient, db: AsyncSession):
    test_email = "recommendationstudent@dau.ac.in"
    
    # 1. Register student
    register_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "password": "securepassword123",
            "role": "student",
            "department": "Computer Science",
            "year": 3
        }
    )
    assert register_res.status_code == 201
    
    # 2. Add some test events to match against
    event1 = Event(
        title="Python ML Workshop",
        description="Learn machine learning using python.",
        category=EventCategory.WORKSHOP,
        eligible_departments=["Computer Science"],
        eligible_years=[3],
        start_date=datetime.datetime.now() + datetime.timedelta(days=2),
        registration_deadline=datetime.datetime.now() + datetime.timedelta(days=1),
        source=EventSource.MANUAL,
        extraction_confidence=0.9
    )
    
    event2 = Event(
        title="Clay Sculpting Session",
        description="Learn pottery.",
        category=EventCategory.WORKSHOP,
        eligible_departments=["Computer Science"],
        eligible_years=[3],
        start_date=datetime.datetime.now() + datetime.timedelta(days=3),
        registration_deadline=datetime.datetime.now() + datetime.timedelta(days=2),
        source=EventSource.MANUAL,
        extraction_confidence=0.8
    )
    
    db.add_all([event1, event2])
    await db.commit()
    await db.refresh(event1)
    await db.refresh(event2)
    
    # 3. Update student profile interests to match event1
    user_res = await db.execute(select(User).where(User.email == test_email))
    db_user = user_res.scalar_one()
    profile_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == db_user.id))
    db_profile = profile_res.scalar_one()
    db_profile.interests = ["machine learning"]
    db_profile.skills = ["python"]
    await db.commit()
    
    # 4. Trigger manual matching trigger function
    match_count = await run_matching_for_student(db, test_email)
    assert match_count > 0
    
    # 5. Login to get token
    login_res = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_email,
            "password": "securepassword123"
        }
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 6. GET /api/v1/recommendations
    rec_res = await client.get("/api/v1/recommendations", headers=headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) >= 1
    
    # Sort order validation: first event should be Python ML Workshop (higher score due to keyword match)
    first_match = recs[0]
    assert first_match["event"]["title"] == "Python ML Workshop"
    assert first_match["relevance_score"] > 0.5
