import asyncio
import pytest
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
import psycopg2
from sqlalchemy import text, create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app

# Disable app lifespan during testing to prevent seeding and engine disposal conflicts
from contextlib import asynccontextmanager
@asynccontextmanager
async def dummy_lifespan(app):
    yield
app.router.lifespan_context = dummy_lifespan

# Database URL for testing
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:akshay11@localhost:5432/campusos_test"

# Ensure test database exists synchronously
def setup_test_db():
    conn = psycopg2.connect(host="localhost", port=5432, user="postgres", password="akshay11")
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'campusos_test'")
    exists = cursor.fetchone()
    if not exists:
        cursor.execute("CREATE DATABASE campusos_test")
    cursor.close()
    conn.close()

setup_test_db()

# Create global engine for session with NullPool to avoid loop conflicts
engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest.fixture(scope="session", autouse=True)
def initialize_db():
    # Build tables once per session synchronously
    sync_url = "postgresql://postgres:akshay11@localhost:5432/campusos_test"
    sync_engine = create_engine(sync_url)
    Base.metadata.drop_all(sync_engine)
    Base.metadata.create_all(sync_engine)
    sync_engine.dispose()
    yield

@pytest.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    # Truncate tables before yielding the session for isolation
    async with TestSessionLocal() as session:
        await session.execute(text(
            "TRUNCATE users, student_profiles, events, event_matches, "
            "notifications_log, ingestion_logs, gmail_tokens CASCADE;"
        ))
        await session.commit()
        
    session = TestSessionLocal()
    try:
        yield session
    finally:
        try:
            await session.close()
        except Exception:
            pass

@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    # Override database dependency in FastAPI app
    async def override_get_db():
        yield db
        
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        yield ac
        
    app.dependency_overrides.clear()
