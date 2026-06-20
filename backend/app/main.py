from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func

from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.db.models.models import User, StudentProfile, Event, UserRole, EventCategory, EventSource
from app.core.security import get_password_hash
from app.api.v1 import auth, profile, events, recommendations, admin, analytics, assistant

# Seed database with mock startup data if empty
async def seed_data(db):
    # 1. Check if admin exists
    admin_result = await db.execute(select(User).where(User.email == "admin@dau.ac.in"))
    if not admin_result.scalar_one_or_none():
        admin_user = User(
            email="admin@dau.ac.in",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_verified=True,
            department="Administration"
        )
        db.add(admin_user)
        print("SEED: Admin user created (admin@dau.ac.in / admin123)")
        
    # 2. Check if mock student exists
    student_result = await db.execute(select(User).where(User.email == "akshay@dau.ac.in"))
    if not student_result.scalar_one_or_none():
        student_user = User(
            email="akshay@dau.ac.in",
            hashed_password=get_password_hash("student123"),
            role=UserRole.STUDENT,
            is_verified=True,
            department="Computer Science",
            year=3
        )
        db.add(student_user)
        await db.commit()
        
        # Add profile
        profile = StudentProfile(
            user_id=student_user.id,
            interests=["machine learning", "react", "ai/ml", "artificial intelligence"],
            skills=["python", "typescript", "figma", "react"],
            career_goals="Build high-scale machine learning products and study edge computing models."
        )
        db.add(profile)
        print("SEED: Student user created (akshay@dau.ac.in / student123)")

    # 3. Check if events exist
    events_count_res = await db.execute(select(func.count(Event.id)))
    if events_count_res.scalar_one() == 0:
        from datetime import timedelta
        mock_events = [
            Event(
                title="AI DevFest Hackathon 2026",
                description="A 24-hour sprint to build AI-powered solutions. Mentorship from industry specialists and $5,000 in prizes.",
                category=EventCategory.HACKATHON,
                eligible_departments=["Computer Science", "Data Science"],
                eligible_years=[2, 3, 4],
                start_date=datetime.now() + timedelta(days=2),
                registration_deadline=datetime.now() + timedelta(days=1),
                registration_link="https://dau.ac.in/smart-campus",
                source=EventSource.WEBSITE,
                extraction_confidence=0.98
            ),
            Event(
                title="UI/UX Design Intensive Workshop",
                description="Learn modern auto-layout, component states, and design system creation in Figma from a senior designer at Notion.",
                category=EventCategory.WORKSHOP,
                eligible_departments=["Design", "Computer Science"],
                eligible_years=[1, 2, 3, 4],
                start_date=datetime.now() + timedelta(days=3),
                registration_deadline=datetime.now() + timedelta(days=2),
                registration_link="https://dau.ac.in/figma-workshop",
                source=EventSource.WEBSITE,
                extraction_confidence=0.95
            )
        ]
        db.add_all(mock_events)
        print("SEED: Seeded mock events")
        
    await db.commit()


async def run_initial_matching() -> None:
    """
    Runs AI matching on startup for all student profiles that already have
    interests/skills populated. Skips students with empty profiles.
    Persists results to the event_matches table using recalculate=False
    so it only fills in missing matches and never overwrites REGISTERED status.
    """
    from app.services.ai_matching import run_matching_for_student
    try:
        async with SessionLocal() as db:
            profiles_res = await db.execute(select(StudentProfile))
            profiles = profiles_res.scalars().all()
            for profile in profiles:
                # Skip profiles with no interests and no skills
                if not (profile.interests or profile.skills):
                    continue
                user_res = await db.execute(select(User).where(User.id == profile.user_id))
                user = user_res.scalar_one_or_none()
                if not user:
                    continue
                count = await run_matching_for_student(db, user.email, recalculate=False)
                print(f"[Startup Matching] {user.email} → {count} new match(es) saved to event_matches.")
    except Exception as exc:
        print(f"[Startup Matching] Error during initial matching: {exc}")


async def run_startup_club_scraper() -> None:
    """
    Runs the clubs and committees scraper in the background on startup
    so it doesn't block application boot.
    """
    from app.services.club_scraper import run_club_scraper_pipeline
    try:
        async with SessionLocal() as db:
            print("Startup: Running clubs and committees scraper in background...")
            await run_club_scraper_pipeline(db)
    except Exception as e:
        print(f"Startup: Failed to scrape clubs: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized successfully.")
    
    # 2. Seed data
    async with SessionLocal() as db:
        await seed_data(db)

    # Run club scraper in the background so it doesn't block application startup
    import asyncio
    asyncio.create_task(run_startup_club_scraper())

    # 3. Run initial matching for all seeded/existing student profiles in the background
    print("Running startup AI matching for existing student profiles in background...")
    asyncio.create_task(run_initial_matching())
    print("Startup matching background task scheduled.")
        
    yield
    # Shutdown logic
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware (configured for React dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database": "connected",
        "timestamp": datetime.now().isoformat()
    }
