from typing import Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.models import Event, EventCategory
from app.schemas.schemas import EventResponse
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/events", tags=["events"])

# List events (with search filters and pagination)
@router.get("", response_model=list[EventResponse])
async def list_events(
    category: Optional[EventCategory] = None,
    department: Optional[str] = None,
    upcoming_only: bool = Query(True, description="Filter only events with start date in future"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(get_current_user)  # Enforces JWT Authentication
) -> Any:
    query = select(Event)
    
    # Filter by category
    if category:
        query = query.where(Event.category == category)
        
    # Filter by eligible department
    if department:
        # Matches if the list of eligible departments contains the target department or is null/empty
        query = query.where(
            (Event.eligible_departments.contains([department])) | 
            (Event.eligible_departments == None)
        )
        
    # Filter by upcoming
    if upcoming_only:
        query = query.where(Event.start_date >= datetime.now())
        
    # Order by date
    query = query.order_by(Event.start_date.asc())
    
    # Pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    events = result.scalars().all()
    return events
