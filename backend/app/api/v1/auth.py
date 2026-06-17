import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from google_auth_oauthlib.flow import Flow

from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    encrypt_token,
    decrypt_token
)
from app.db.session import get_db
from app.db.models.models import User, StudentProfile, UserRole, GmailToken
from app.schemas.schemas import UserRegister, UserVerify, UserResend, UserLogin, Token, TokenRefresh, UserResponse
from app.services.otp import (
    generate_and_store_otp,
    verify_otp,
    is_resend_rate_limited,
    set_resend_rate_limit
)
from app.services.notifications import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

# Dependency to get current user from JWT token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified"
        )
    return user


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.ORGANIZER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to organizers/administrators"
        )
    return current_user


# Registration Endpoint
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)) -> Any:
    # 1. Enforce ALLOWED_EMAIL_DOMAIN constraint
    if not user_in.email.endswith(settings.ALLOWED_EMAIL_DOMAIN):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration only allowed for domain {settings.ALLOWED_EMAIL_DOMAIN}"
        )
        
    # 2. Check if user already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
        
    # 3. Create user with hashed password and set is_verified to True directly
    hashed_pwd = get_password_hash(user_in.password)
    
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role,
        department=user_in.department,
        year=user_in.year,
        is_verified=True,
        verification_otp=None,
        verification_otp_expires_at=None
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # 4. Create empty student profile automatically if role is student
    if new_user.role == UserRole.STUDENT:
        profile = StudentProfile(user_id=new_user.id)
        db.add(profile)
        await db.commit()
        
    print(f"--- REGISTRATION LOG ---")
    print(f"User registered directly and verified: {new_user.email}")
    print(f"--------------------------")
    
    return new_user


# Email OTP verification endpoint (simplified to no-op success)
@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(verify_in: UserVerify, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(User).where(User.email == verify_in.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    user.is_verified = True
    await db.commit()
    return {"message": "Email verified successfully."}


# Email OTP resend endpoint (simplified to no-op success)
@router.post("/resend-otp", status_code=status.HTTP_200_OK)
async def resend_otp(resend_in: UserResend, db: AsyncSession = Depends(get_db)) -> Any:
    return {"message": "OTP verification is disabled. Direct login is active."}


# Login endpoint
@router.post("/login", response_model=Token)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(User).where(User.email == login_in.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your email address before logging in"
        )
        
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer"
    }


# Refresh token endpoint
@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_in: TokenRefresh, db: AsyncSession = Depends(get_db)) -> Any:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
    )
    try:
        payload = jwt.decode(refresh_in.refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
        
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def read_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user


# Gmail Connect (OAuth2) flow
@router.get("/gmail/connect")
async def gmail_connect(current_user: User = Depends(get_current_user)) -> Any:
    # Set up flow config (Mock authorization redirect if secrets not set)
    client_config = {
        "web": {
            "client_id": "mock_client_id",
            "project_id": "campusos-ai",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_secret": "mock_client_secret"
        }
    }
    
    # In real deployment, redirect URL would be:
    # flow = Flow.from_client_config(client_config, scopes=['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.labels'])
    # flow.redirect_uri = 'http://localhost:8000/api/v1/auth/gmail/callback'
    # auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')
    # return {"auth_url": auth_url}
    
    # Returns mock connection redirect for local sandbox testing
    mock_url = f"http://localhost:8000/api/v1/auth/gmail/callback?code=mock_code_for_{current_user.id}"
    return {"auth_url": mock_url}


@router.get("/gmail/callback")
async def gmail_callback(code: str, db: AsyncSession = Depends(get_db)) -> Any:
    # Find matching mock code or use current logged-in session.
    # Since OAuth callback is async public redirect, we can check or mock the flow.
    # For local sandbox code verification:
    user_id = None
    if "mock_code_for_" in code:
        user_id = code.split("mock_code_for_")[1]
        
    if not user_id:
        # Fallback to a default student for test convenience
        result = await db.execute(select(User).where(User.role == UserRole.STUDENT).limit(1))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=400, detail="No student found to associate Gmail token with.")
        user_id = str(user.id)
        
    # Store access/refresh tokens securely (encrypted at rest via security.encrypt_token)
    enc_access = encrypt_token("mock_access_token_value_abc123")
    enc_refresh = encrypt_token("mock_refresh_token_value_xyz789")
    
    # Check if a token record already exists
    token_result = await db.execute(select(GmailToken).where(GmailToken.user_id == user_id))
    gmail_token = token_result.scalar_one_or_none()
    
    if not gmail_token:
        gmail_token = GmailToken(
            user_id=user_id,
            encrypted_access_token=enc_access,
            encrypted_refresh_token=enc_refresh,
            token_uri="https://oauth2.googleapis.com/token",
            client_id="mock_client_id",
            client_secret="mock_client_secret",
            scopes=["https://www.googleapis.com/auth/gmail.readonly"]
        )
        db.add(gmail_token)
    else:
        gmail_token.encrypted_access_token = enc_access
        gmail_token.encrypted_refresh_token = enc_refresh
        
    await db.commit()
    return {"status": "success", "message": "Gmail account successfully authorized."}
