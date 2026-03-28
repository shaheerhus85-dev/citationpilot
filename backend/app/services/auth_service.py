from __future__ import annotations

import secrets
import logging
from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.models import User
from app.services.email_service import send_verification_email

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Hash a plain text password."""
    return pwd_context.hash(password)


def get_password_hash(password: str) -> str:
    """Compatibility alias used by older services."""
    return hash_password(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_verification_token() -> str:
    """Create a random email verification token."""
    return secrets.token_urlsafe(24)


def _normalize_username(email: str, full_name: str | None = None) -> str:
    base = (full_name or email.split("@")[0]).strip().lower().replace(" ", "_")
    return "".join(ch for ch in base if ch.isalnum() or ch in {"_", "-"})[:40] or f"user_{secrets.token_hex(4)}"


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=settings.JWT_EXPIRATION_HOURS))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    """Create a refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def _build_auth_payload(user: User) -> dict[str, Any]:
    access_token = create_access_token({"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token({"sub": user.email, "user_id": user.id})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }


def signup(db: Session, email: str, password: str, full_name: str | None = None) -> tuple[User, bool, dict[str, Any] | None]:
    """Create a user account and attempt to send verification email.

    Returns:
        tuple[User, bool, dict | None]: user, email delivery flag, and optional auth payload when auto-verified.
    """
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    username = _normalize_username(email=email, full_name=full_name)
    suffix = 1
    while db.query(User).filter(User.username == username).first():
        suffix += 1
        username = f"{_normalize_username(email=email, full_name=full_name)}_{suffix}"

    now = datetime.utcnow()
    token = create_verification_token()
    user = User(
        email=email,
        username=username,
        full_name=full_name,
        hashed_password=hash_password(password),
        is_active=True,
        is_verified=False,
        verification_token=token,
        verification_sent_at=now,
        verification_expires_at=now + timedelta(minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES),
        updated_at=now,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    verify_url = f"{settings.FRONTEND_URL}/verify-email?user_id={user.id}&token={token}"
    email_sent = False
    auth_payload: dict[str, Any] | None = None
    try:
        send_verification_email(user.email, user.full_name or user.username, verify_url)
        email_sent = True
    except Exception as exc:
        # Keep user created but report delivery failure to API caller.
        logger.warning("Verification email delivery failed for user_id=%s: %s", user.id, exc)
        if settings.ALLOW_SIGNUP_WITHOUT_EMAIL_VERIFICATION:
            user.is_verified = True
            user.verification_token = None
            user.verification_expires_at = None
            user.updated_at = datetime.utcnow()
            db.add(user)
            db.commit()
            db.refresh(user)
            auth_payload = _build_auth_payload(user)

    return user, email_sent, auth_payload


def verify_email(db: Session, user_id: int, token: str) -> dict[str, Any]:
    """Validate verification token, activate account, and issue tokens."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_verified:
        return _build_auth_payload(user)
    if not user.verification_token or user.verification_token != token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")
    if user.verification_expires_at and user.verification_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token expired")

    user.is_verified = True
    user.verification_token = None
    user.verification_expires_at = None
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return _build_auth_payload(user)


def resend_verification_email(db: Session, email: str) -> dict[str, Any]:
    """Regenerate and resend verification email for an unverified account."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {
            "email_delivery": False,
            "reason": "not_found",
            "message": "If an account exists for this email, a verification message will be sent.",
            "retry_in_seconds": 0,
        }
    if user.is_verified:
        return {
            "email_delivery": True,
            "reason": "already_verified",
            "message": "This email is already verified. You can sign in now.",
            "retry_in_seconds": 0,
        }

    now = datetime.utcnow()
    if user.verification_sent_at and (now - user.verification_sent_at).total_seconds() < 60:
        retry_after = int(60 - (now - user.verification_sent_at).total_seconds())
        return {
            "email_delivery": False,
            "reason": "cooldown",
            "message": "Please wait before requesting another verification email.",
            "retry_in_seconds": max(1, retry_after),
        }

    user.verification_token = create_verification_token()
    user.verification_sent_at = now
    user.verification_expires_at = now + timedelta(minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES)
    user.updated_at = now
    db.add(user)
    db.commit()
    db.refresh(user)

    verify_url = f"{settings.FRONTEND_URL}/verify-email?user_id={user.id}&token={user.verification_token}"
    try:
        send_verification_email(user.email, user.full_name or user.username, verify_url)
        return {
            "email_delivery": True,
            "reason": "sent",
            "message": "Verification email sent. Please check Inbox, Spam, and Promotions.",
            "retry_in_seconds": 60,
        }
    except Exception as exc:
        logger.warning("Resend verification email failed for user_id=%s: %s", user.id, exc)
        return {
            "email_delivery": False,
            "reason": "delivery_failed",
            "message": "Could not send email right now. Please try again shortly.",
            "retry_in_seconds": 60,
        }


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Compatibility helper to authenticate by email or username."""
    user = db.query(User).filter((User.email == username) | (User.username == username)).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def login(db: Session, email: str, password: str) -> dict[str, Any]:
    """Authenticate a verified user and return token payload."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_verified:
        if settings.ALLOW_SIGNUP_WITHOUT_EMAIL_VERIFICATION:
            user.is_verified = True
            user.verification_token = None
            user.verification_expires_at = None
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email verification required")

    user.last_login_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return _build_auth_payload(user)


def refresh_access_token(db: Session, refresh_token: str) -> dict[str, Any]:
    """Refresh a valid refresh token pair."""
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _build_auth_payload(user)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Resolve current user from an access token."""
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token type")
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Require an active authenticated user."""
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user
