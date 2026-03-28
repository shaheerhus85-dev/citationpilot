from __future__ import annotations

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    ResendVerificationRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
    VerifyEmailRequest,
)
from app.services.auth_service import (
    get_current_active_user,
    login as login_user,
    resend_verification_email,
    refresh_access_token,
    signup,
    verify_email,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup_endpoint(payload: SignupRequest, db: Session = Depends(get_db)):
    user, email_sent = signup(db, payload.email, payload.password, payload.full_name)
    content = {
        "user_id": user.id,
        "message": "Verification email sent" if email_sent else "Account created. Verification email could not be delivered right now.",
        "email_delivery": email_sent,
        "verification_expires_in_minutes": settings.EMAIL_VERIFICATION_EXPIRE_MINUTES,
    }
    return JSONResponse(
        status_code=status.HTTP_201_CREATED if email_sent else status.HTTP_202_ACCEPTED,
        content=content,
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_compat(payload: SignupRequest, db: Session = Depends(get_db)):
    return signup_endpoint(payload, db)


@router.post("/verify-email", response_model=TokenResponse)
def verify_email_endpoint(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    result = verify_email(db, payload.user_id, payload.token)
    return TokenResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=UserResponse.model_validate(result["user"]),
    )


@router.post("/resend-verification")
def resend_verification_endpoint(payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    result = resend_verification_email(db, payload.email)
    return JSONResponse(
        status_code=status.HTTP_200_OK if result["email_delivery"] else status.HTTP_202_ACCEPTED,
        content={
            "message": result["message"],
            "reason": result["reason"],
            "email_delivery": result["email_delivery"],
            "retry_in_seconds": result["retry_in_seconds"],
            "verification_expires_in_minutes": settings.EMAIL_VERIFICATION_EXPIRE_MINUTES,
        },
    )


@router.post("/login", response_model=TokenResponse)
def login_endpoint(payload: LoginRequest, db: Session = Depends(get_db)):
    result = login_user(db, payload.email, payload.password)
    return TokenResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=UserResponse.model_validate(result["user"]),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_endpoint(payload: RefreshRequest, db: Session = Depends(get_db)):
    result = refresh_access_token(db, payload.refresh_token)
    return TokenResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=UserResponse.model_validate(result["user"]),
    )


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_active_user)):
    return UserResponse.model_validate(current_user)
