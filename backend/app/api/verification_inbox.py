"""Verification inbox API routes."""
from __future__ import annotations

from typing import cast

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, VerificationEmail
from app.schemas.schemas import ForwardingAddressResponse, VerificationInboxResponse, VerificationEmailResponse
from app.services.auth_service import get_current_active_user
from app.services.email_verification_service import EmailVerificationService

router = APIRouter(prefix="/api/v1/verification-inbox", tags=["verification-inbox"])


@router.get("/forwarding-address", response_model=ForwardingAddressResponse)
async def get_forwarding_address(
    current_user: User = Depends(get_current_active_user),
):
    _ = current_user
    return ForwardingAddressResponse(forwarding_address=EmailVerificationService.get_forwarding_address())


@router.get("/", response_model=VerificationInboxResponse)
async def list_verification_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    rows = EmailVerificationService.list_for_user(db, cast(int, current_user.id))
    return VerificationInboxResponse(
        items=[VerificationEmailResponse.model_validate(row) for row in rows],
        total=len(rows),
    )


@router.post("/{email_id}/verify-now")
async def verify_now(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    row = (
        db.query(VerificationEmail)
        .filter(VerificationEmail.id == email_id, VerificationEmail.user_id == cast(int, current_user.id))
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification email not found")

    EmailVerificationService.trigger_single_verification_background(email_id=email_id, user_id=cast(int, current_user.id))
    return {"message": "Verification worker started", "email_id": email_id}

