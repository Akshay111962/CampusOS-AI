import uuid
from datetime import datetime
from enum import Enum as PyEnum
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Text, ForeignKey, DateTime, Boolean, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

# Enums
class UserRole(str, PyEnum):
    STUDENT = "student"
    ORGANIZER = "organizer"
    ADMIN = "admin"

class EventCategory(str, PyEnum):
    WORKSHOP = "workshop"
    HACKATHON = "hackathon"
    LECTURE = "lecture"
    ALUMNI_MEET = "alumni_meet"
    COMPETITION = "competition"
    SUMMER_SCHOOL = "summer_school"

class EventSource(str, PyEnum):
    WEBSITE = "website"
    EMAIL = "email"
    MANUAL = "manual"

class MatchStatus(str, PyEnum):
    RECOMMENDED = "recommended"
    NOTIFIED = "notified"
    CLICKED = "clicked"
    REGISTERED = "registered"
    DISMISSED = "dismissed"

class NotificationChannel(str, PyEnum):
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    PUSH = "push"

class NotificationStatus(str, PyEnum):
    SENT = "sent"
    FAILED = "failed"
    DELIVERED = "delivered"
    READ = "read"

class IngestionStatus(str, PyEnum):
    SUCCESS = "success"
    FAILED = "failed"
    DUPLICATE = "duplicate"

class IngestionSource(str, PyEnum):
    SCRAPER = "scraper"
    GMAIL = "gmail"


# Database Models
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(String(50), default=UserRole.STUDENT, nullable=False)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_otp: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    verification_otp_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_otp_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    
    profile: Mapped[Optional["StudentProfile"]] = relationship("StudentProfile", back_populates="user", cascade="all, delete-orphan")
    gmail_token: Mapped[Optional["GmailToken"]] = relationship("GmailToken", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    interests: Mapped[Optional[dict]] = mapped_column(JSONB, default=list, nullable=True) # e.g. ["AI", "robotics"]
    skills: Mapped[Optional[dict]] = mapped_column(JSONB, default=list, nullable=True)
    past_events: Mapped[Optional[List[uuid.UUID]]] = mapped_column(ARRAY(UUID(as_uuid=True)), default=list, nullable=True)
    career_goals: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notification_prefs: Mapped[Optional[dict]] = mapped_column(JSONB, default=lambda: {"channels": ["email"], "quiet_hours": None}, nullable=True)
    
    user: Mapped["User"] = relationship("User", back_populates="profile")
    matches: Mapped[List["EventMatch"]] = relationship("EventMatch", back_populates="student", cascade="all, delete-orphan")
    notifications: Mapped[List["NotificationLog"]] = relationship("NotificationLog", back_populates="student", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[EventCategory] = mapped_column(String(100), nullable=False)
    eligible_departments: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)
    eligible_years: Mapped[Optional[List[int]]] = mapped_column(ARRAY(Integer), nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    registration_deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    registration_link: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    source: Mapped[EventSource] = mapped_column(String(50), nullable=False)
    raw_source_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extraction_confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    
    matches: Mapped[List["EventMatch"]] = relationship("EventMatch", back_populates="event", cascade="all, delete-orphan")
    notifications: Mapped[List["NotificationLog"]] = relationship("NotificationLog", back_populates="event", cascade="all, delete-orphan")
    ingestion_logs: Mapped[List["IngestionLog"]] = relationship("IngestionLog", back_populates="event")


class EventMatch(Base):
    __tablename__ = "event_matches"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    relevance_score: Mapped[float] = mapped_column(Float, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[MatchStatus] = mapped_column(String(50), default=MatchStatus.RECOMMENDED, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    
    event: Mapped["Event"] = relationship("Event", back_populates="matches")
    student: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="matches")


class NotificationLog(Base):
    __tablename__ = "notifications_log"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    channel: Mapped[NotificationChannel] = mapped_column(String(50), nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    status: Mapped[NotificationStatus] = mapped_column(String(50), default=NotificationStatus.SENT, nullable=False)
    
    student: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="notifications")
    event: Mapped["Event"] = relationship("Event", back_populates="notifications")


class IngestionLog(Base):
    __tablename__ = "ingestion_logs"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source: Mapped[IngestionSource] = mapped_column(String(50), nullable=False)
    raw_payload: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_event_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[IngestionStatus] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    
    event: Mapped[Optional["Event"]] = relationship("Event", back_populates="ingestion_logs")


class GmailToken(Base):
    __tablename__ = "gmail_tokens"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    encrypted_access_token: Mapped[str] = mapped_column(Text, nullable=False)
    encrypted_refresh_token: Mapped[str] = mapped_column(Text, nullable=False)
    token_uri: Mapped[str] = mapped_column(String(512), nullable=False)
    client_id: Mapped[str] = mapped_column(String(512), nullable=False)
    client_secret: Mapped[str] = mapped_column(String(512), nullable=False)
    scopes: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    user: Mapped["User"] = relationship("User", back_populates="gmail_token")


class Club(Base):
    __tablename__ = "clubs"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    how_to_join: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    contact_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_link: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

