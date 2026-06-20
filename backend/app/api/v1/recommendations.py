from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.models import User, StudentProfile, EventMatch, MatchStatus, Event
from app.schemas.schemas import MatchResponse, FeedbackCreate
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

# Get personalized recommendation feed
@router.get("", response_model=list[MatchResponse])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    # 1. Fetch student profile
    profile_result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
        
    # 2. Query matches with status recommended/notified/clicked (exclude dismissed/registered)
    # and filter for only upcoming events (start_date >= datetime.now())
    matches_result = await db.execute(
        select(EventMatch)
        .join(Event, EventMatch.event_id == Event.id)
        .where(
            EventMatch.student_id == profile.id,
            EventMatch.status.in_([MatchStatus.RECOMMENDED, MatchStatus.NOTIFIED, MatchStatus.CLICKED]),
            Event.start_date >= datetime.now()
        )
        .order_by(EventMatch.relevance_score.desc())
    )
    matches = matches_result.scalars().all()
    
    # Load relationships (event) to serialize correctly
    for m in matches:
        await db.refresh(m, ["event"])
        
    return matches


# Give feedback on a recommendation (mark interested, dismissed, registered, etc.)
@router.post("/{match_id}/feedback", response_model=MatchResponse)
async def submit_feedback(
    match_id: str,
    feedback: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    # 1. Fetch student profile
    profile_result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
        
    # 2. Fetch match and verify it belongs to this student
    match_result = await db.execute(
        select(EventMatch).where(
            EventMatch.id == match_id,
            EventMatch.student_id == profile.id
        )
    )
    match = match_result.scalar_one_or_none()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation match record not found"
        )
        
    # 3. Update status
    match.status = feedback.status
    
    # 4. If registered, add to past_events array in student_profile
    if feedback.status == MatchStatus.REGISTERED:
        current_past_events = list(profile.past_events or [])
        if match.event_id not in current_past_events:
            current_past_events.append(match.event_id)
            profile.past_events = current_past_events
            
    await db.commit()
    await db.refresh(match, ["event"])
    return match
