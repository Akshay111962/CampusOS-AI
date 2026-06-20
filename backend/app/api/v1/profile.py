from datetime import datetime
import asyncio
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db, SessionLocal
from app.db.models.models import User, StudentProfile, EventMatch, MatchStatus, Event
from app.schemas.schemas import ProfileResponse, ProfileUpdate, MatchResponse
from app.api.v1.auth import get_current_user


async def _run_matching_background(email: str) -> None:
    """
    Runs AI matching for a student in-process as an asyncio task.
    Opens its own DB session so it is safe to run independently.
    """
    from app.services.ai_matching import run_matching_for_student
    try:
        async with SessionLocal() as db:
            count = await run_matching_for_student(db, email, recalculate=True)
            print(f"[Direct Matching] Completed for {email}. {count} match(es) persisted to event_matches.")
    except Exception as exc:
        print(f"[Direct Matching] Failed for {email}: {exc}")


def trigger_matching(email: str) -> None:
    """
    Schedules AI matching for a student.
    Called by FastAPI BackgroundTasks (runs in a thread pool after response).
    Tries Celery first, then falls back to running matching directly in a new event loop.
    """
    celery_dispatched = False
    try:
        from app.workers.celery_app import celery_app
        with celery_app.connection_for_write() as conn:
            conn.connect()
        workers = celery_app.control.ping(timeout=0.5)
        if not workers:
            raise RuntimeError("No active Celery workers online")
        from app.workers.tasks import task_recalculate_matching
        result = task_recalculate_matching.apply_async(args=[email], retry=False)
        print(f"[Celery] Matching task dispatched for {email}. Task ID: {result.id}")
        celery_dispatched = True
    except Exception as celery_err:
        print(f"[Celery/Redis] Offline ({celery_err}). Falling back to direct async matching.")

    if not celery_dispatched:
        try:
            # Check if we are running in an active event loop
            loop = asyncio.get_running_loop()
            loop.create_task(_run_matching_background(email))
            print(f"[Direct Matching] Dispatched task on running event loop for {email}.")
        except RuntimeError:
            # No running loop (e.g., in a background thread pool)
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    loop.run_until_complete(_run_matching_background(email))
                    print(f"[Direct Matching] Completed in background thread for {email}.")
                finally:
                    loop.close()
            except Exception as err:
                print(f"[Direct Matching] Error in background thread: {err}")

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
    background_tasks: BackgroundTasks,
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
    
    # Recalculate AI matching — run in background thread pool so it does not block request
    background_tasks.add_task(trigger_matching, current_user.email)

    
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
        .join(Event, EventMatch.event_id == Event.id)
        .where(
            EventMatch.student_id == profile.id,
            EventMatch.relevance_score >= 0.5, # default relevance threshold
            EventMatch.status != MatchStatus.DISMISSED,
            Event.start_date >= datetime.now()
        )
        .order_by(EventMatch.relevance_score.desc())
    )
    matches = matches_result.scalars().all()
    
    # Load relationships (event) to serialize correctly
    for m in matches:
        await db.refresh(m, ["event"])
        
    return matches
