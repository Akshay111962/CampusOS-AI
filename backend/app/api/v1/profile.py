from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.models import User, StudentProfile, EventMatch, MatchStatus
from app.schemas.schemas import ProfileResponse, ProfileUpdate, MatchResponse
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

# Get current profile
@router.get("/me", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "interests": profile.interests,
        "skills": profile.skills,
        "past_events": profile.past_events or [],
        "career_goals": profile.career_goals,
        "notification_prefs": profile.notification_prefs,
        "department": current_user.department,
        "year": current_user.year
    }


# Update profile
@router.put("/me", response_model=ProfileResponse)
async def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
        
    profile.interests = profile_in.interests
    profile.skills = profile_in.skills
    profile.career_goals = profile_in.career_goals
    profile.notification_prefs = profile_in.notification_prefs
    
    if profile_in.department is not None:
        current_user.department = profile_in.department
    if profile_in.year is not None:
        current_user.year = profile_in.year
        
    await db.commit()
    await db.refresh(profile)
    await db.refresh(current_user)
    
    # Recalculate AI matching for this student immediately
    from app.services.ai_matching import run_matching_for_student
    await run_matching_for_student(db, current_user.email, recalculate=True)
    
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "interests": profile.interests,
        "skills": profile.skills,
        "past_events": profile.past_events or [],
        "career_goals": profile.career_goals,
        "notification_prefs": profile.notification_prefs,
        "department": current_user.department,
        "year": current_user.year
    }


# Recommendations shortcuts under profile (as specified in 5.2 / 9.0)
@router.get("/recommendations", response_model=list[MatchResponse])
async def get_profile_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    # Get active match recommendations (score > 0.0, ordered by relevance_score desc)
    matches_result = await db.execute(
        select(EventMatch)
        .where(
            EventMatch.student_id == profile.id,
            EventMatch.relevance_score >= 0.5, # default relevance threshold
            EventMatch.status != MatchStatus.DISMISSED
        )
        .order_by(EventMatch.relevance_score.desc())
    )
    matches = matches_result.scalars().all()
    return matches
