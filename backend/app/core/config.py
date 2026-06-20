import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusOS AI Backend"
    API_V1_STR: str = "/api/v1"
    
    # Database and Cache config
    DATABASE_URL: str = "postgresql+asyncpg://postgres@localhost:5433/campusos"
    REDIS_URL: str = "redis://localhost:6379/0"
    
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

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

import subprocess
def get_wsl_ip() -> str:
    try:
        out = subprocess.check_output(["wsl", "hostname", "-I"], timeout=2)
        ips = out.decode().strip().split()
        if ips:
            return ips[0]
    except Exception:
        pass
    return "127.0.0.1"

# Dynamically resolve WSL IP for Redis
if "localhost" in settings.REDIS_URL or "127.0.0.1" in settings.REDIS_URL:
    wsl_ip = get_wsl_ip()
    settings.REDIS_URL = settings.REDIS_URL.replace("localhost", wsl_ip).replace("127.0.0.1", wsl_ip)

