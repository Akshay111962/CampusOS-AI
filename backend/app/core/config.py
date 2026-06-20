import os
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusOS AI Backend"
    API_V1_STR: str = "/api/v1"
    
    # Database and Cache config
    DATABASE_URL: str = "postgresql+asyncpg://postgres@localhost:5433/campusos"
    REDIS_URL: str = "redis://localhost:6379/0"
    POSTGRES_POOL_SIZE: int = 5
    POSTGRES_MAX_OVERFLOW: int = 10
    
    # JWT security config
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Fernet symmetric encryption key (must be 32 URL-safe base64-encoded bytes)
    FERNET_KEY: str
    
    # Third-party API keys
    GEMINI_API_KEY: str = ""
    
    # Auth and Domain Restriction
    ALLOWED_EMAIL_DOMAIN: str = "@dau.ac.in"
    
    # CORS allowed origins — set to your Vercel URL in production
    # e.g. ALLOWED_ORIGINS=https://campusos.vercel.app
    ALLOWED_ORIGINS: str = "*"
    
    # Notification & OTP SMTP Configuration
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@dau.ac.in"
    
    # Twilio API Mock Configurations
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None

    @model_validator(mode="after")
    def validate_database_url(self) -> "Settings":
        url = self.DATABASE_URL
        # In production (Railway), the URL starts with postgresql:// or postgres://
        # We must rewrite it to postgresql+asyncpg:// for asyncpg connection
        if url.startswith("postgresql://"):
            self.DATABASE_URL = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            self.DATABASE_URL = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return self

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

def get_cors_origins() -> List[str]:
    """
    Parse ALLOWED_ORIGINS env var into a list.
    Supports '*' (wildcard) or comma-separated URLs.
    e.g. "https://campusos.vercel.app,https://www.campusos.vercel.app"
    """
    raw = settings.ALLOWED_ORIGINS.strip()
    if raw == "*":
        return ["*"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]
