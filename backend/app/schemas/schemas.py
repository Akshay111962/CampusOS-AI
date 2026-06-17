import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from app.db.models.models import UserRole, EventCategory, EventSource, MatchStatus, IngestionSource, IngestionStatus

# User & Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.STUDENT
    department: Optional[str] = None
    year: Optional[int] = None

class UserVerify(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class UserResend(BaseModel):
    email: EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefresh(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: UserRole
    department: Optional[str] = None
    year: Optional[int] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Student Profile schemas
class ProfileUpdate(BaseModel):
    interests: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    career_goals: Optional[str] = None
    notification_prefs: Dict[str, Any] = Field(
        default_factory=lambda: {"channels": ["email"], "quiet_hours": None}
    )
    department: Optional[str] = None
    year: Optional[int] = None

class ProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    interests: List[str]
    skills: List[str]
    past_events: List[uuid.UUID]
    career_goals: Optional[str] = None
    notification_prefs: Dict[str, Any]
    department: Optional[str] = None
    year: Optional[int] = None

    class Config:
        from_attributes = True


# Event schemas
class EventCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str
    category: EventCategory
    eligible_departments: List[str] = Field(default_factory=list)
    eligible_years: List[int] = Field(default_factory=list)
    start_date: datetime
    registration_deadline: datetime
    registration_link: Optional[str] = None

class EventResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    category: EventCategory
    eligible_departments: List[str]
    eligible_years: List[int]
    start_date: datetime
    registration_deadline: datetime
    registration_link: Optional[str] = None
    source: EventSource
    extraction_confidence: float
    created_at: datetime

    class Config:
        from_attributes = True


# Match schemas
class MatchResponse(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    student_id: uuid.UUID
    relevance_score: float
    reason: str
    status: MatchStatus
    created_at: datetime
    event: EventResponse

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    status: MatchStatus


# Ingestion log schemas
class IngestionLogResponse(BaseModel):
    id: uuid.UUID
    source: IngestionSource
    raw_payload: str
    extracted_event_id: Optional[uuid.UUID] = None
    status: IngestionStatus
    created_at: datetime

    class Config:
        from_attributes = True


# Analytics schemas
class AnalyticsOverview(BaseModel):
    total_opportunities: int
    total_matches: int
    click_through_rate: float
    registration_rate: float
    popular_categories: Dict[str, int]
    department_heatmap: Dict[str, int]
