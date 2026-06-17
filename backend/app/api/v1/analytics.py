import json
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.core.config import settings
from app.db.session import get_db
from app.db.models.models import User, Event, EventMatch, MatchStatus
from app.schemas.schemas import AnalyticsOverview
from app.api.v1.auth import get_current_admin

router = APIRouter(prefix="/admin/analytics", tags=["analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
) -> Any:
    cache_key = "analytics:overview"
    
    # 1. Try fetching from Redis cache
    try:
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        cached_data = await r.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        # Fallback to DB if Redis fails
        print(f"Redis cache connection failed: {e}")
        r = None

    # 2. Database aggregations
    # Total opportunities
    total_events_res = await db.execute(select(func.count(Event.id)))
    total_events = total_events_res.scalar_one()
    
    # Total matches
    total_matches_res = await db.execute(select(func.count(EventMatch.id)))
    total_matches = total_matches_res.scalar_one()
    
    # Click-through rate: matches with clicked/registered/dismissed / total matches
    clicked_matches_res = await db.execute(
        select(func.count(EventMatch.id)).where(EventMatch.status.in_([MatchStatus.CLICKED, MatchStatus.REGISTERED, MatchStatus.DISMISSED]))
    )
    clicked_matches = clicked_matches_res.scalar_one()
    ctr = (clicked_matches / total_matches) if total_matches > 0 else 0.0
    
    # Registration rate: matches with status registered / total matches
    registered_matches_res = await db.execute(
        select(func.count(EventMatch.id)).where(EventMatch.status == MatchStatus.REGISTERED)
    )
    registered_matches = registered_matches_res.scalar_one()
    reg_rate = (registered_matches / total_matches) if total_matches > 0 else 0.0
    
    # Popular categories
    popular_categories = {}
    categories_res = await db.execute(
        select(Event.category, func.count(Event.id)).group_by(Event.category)
    )
    for row in categories_res:
        popular_categories[str(row[0])] = row[1]
        
    # Department matches heatmap
    department_heatmap = {}
    heatmap_res = await db.execute(
        select(User.department, func.count(EventMatch.id))
        .join(User, User.id == EventMatch.student_id) # (Note: student_id links to student_profile, which has user_id)
        # Wait, student_id maps to StudentProfile. Let's write the join correctly:
        # select User.department, count(EventMatch.id) from EventMatch join StudentProfile on StudentProfile.id = EventMatch.student_id join User on User.id = StudentProfile.user_id group by User.department
    )
    # Let's perform the join correctly:
    heatmap_query = (
        select(User.department, func.count(EventMatch.id))
        .select_from(EventMatch)
        .join(EventMatch.student)
        .join(User, User.id == StudentProfile.user_id)
        .group_by(User.department)
    )
    heatmap_res = await db.execute(heatmap_query)
    for row in heatmap_res:
        dept = row[0] or "General"
        department_heatmap[dept] = row[1]

    data = {
        "total_opportunities": total_events,
        "total_matches": total_matches,
        "click_through_rate": ctr,
        "registration_rate": reg_rate,
        "popular_categories": popular_categories,
        "department_heatmap": department_heatmap
    }

    # 3. Cache inside Redis with 60 seconds TTL (short TTL)
    if r:
        try:
            await r.setex(cache_key, 60, json.dumps(data))
        except Exception as e:
            print(f"Failed to write to Redis cache: {e}")
            
    return data
