from datetime import datetime, timedelta, timezone
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.models import User, Event, IngestionLog, IngestionStatus, EventSource
from app.schemas.schemas import EventCreate, EventResponse, IngestionLogResponse
from app.api.v1.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

# Manually create event (Admin / Organizer)
@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_manual_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
) -> Any:
    # Check if duplicate exists (simple title + start date check)
    existing_result = await db.execute(
        select(Event).where(
            Event.title == event_in.title,
            Event.start_date == event_in.start_date
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An event with the same title and start date already exists"
        )
        
    db_event = Event(
        title=event_in.title,
        description=event_in.description,
        category=event_in.category,
        eligible_departments=event_in.eligible_departments,
        eligible_years=event_in.eligible_years,
        start_date=event_in.start_date,
        registration_deadline=event_in.registration_deadline,
        registration_link=event_in.registration_link,
        source=EventSource.MANUAL,
        extraction_confidence=1.0  # manually created, high confidence
    )
    
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    
    # Audit log (Simple print as specified in Security Requirements)
    print(f"AUDIT LOG: Admin User {admin_user.email} created manual event ID {db_event.id}")
    
    return db_event


# Review AI extraction ingestion logs (Admin / Organizer)
@router.get("/ingestion-logs", response_model=List[IngestionLogResponse])
async def get_ingestion_logs(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
) -> Any:
    result = await db.execute(
        select(IngestionLog).order_by(IngestionLog.created_at.desc()).limit(100)
    )
    logs = result.scalars().all()
    return logs


# Approve a failed or low-confidence ingestion manually (Admin / Organizer)
@router.post("/ingestion-logs/{log_id}/approve", response_model=EventResponse)
async def approve_ingestion_manually(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
) -> Any:
    # 1. Fetch IngestionLog
    log_result = await db.execute(
        select(IngestionLog).where(IngestionLog.id == log_id)
    )
    log = log_result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Ingestion log record not found")
        
    if log.status == IngestionStatus.SUCCESS and log.extracted_event_id:
        raise HTTPException(status_code=400, detail="Ingestion was already successfully processed")
        
    # 2. Extract metadata manually or mock fallback creating the event
    # In real pipeline, admin reviews the raw payload and overrides.
    # We will parsed and create a fallback event from raw payload info.
    import json
    try:
        payload = json.loads(log.raw_payload)
    except Exception:
        # If payload is raw text, create standard fields
        payload = {
            "title": f"Approved Opportunity ({log.source.upper()})",
            "description": log.raw_payload,
            "category": "workshop",
            "eligible_departments": ["Computer Science"],
            "eligible_years": [1, 2, 3, 4],
            "start_date": datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=5),
            "registration_deadline": datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=2),
            "registration_link": "http://approved-link.com"
        }
        
    start_date_val = payload.get("start_date")
    if isinstance(start_date_val, str):
        start_date_val = datetime.fromisoformat(start_date_val)
    elif start_date_val is None:
        start_date_val = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=5)

    deadline_val = payload.get("registration_deadline")
    if isinstance(deadline_val, str):
        deadline_val = datetime.fromisoformat(deadline_val)
    elif deadline_val is None:
        deadline_val = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=2)

    db_event = Event(
        title=payload.get("title", "Override Event"),
        description=payload.get("description", "Manual override description"),
        category=payload.get("category", "workshop"),
        eligible_departments=payload.get("eligible_departments", []),
        eligible_years=payload.get("eligible_years", []),
        start_date=start_date_val,
        registration_deadline=deadline_val,
        registration_link=payload.get("registration_link"),
        source=EventSource.MANUAL,
        raw_source_text=log.raw_payload,
        extraction_confidence=1.0
    )
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    
    # 3. Update log
    log.status = IngestionStatus.SUCCESS
    log.extracted_event_id = db_event.id
    await db.commit()
    
    print(f"AUDIT LOG: Admin User {admin_user.email} approved failed ingestion ID {log.id}")
    return db_event
