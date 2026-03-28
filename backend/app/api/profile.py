"""Authenticated user profile endpoints."""
from __future__ import annotations

from typing import cast

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import ChangePasswordRequest, MessageResponse, ProfileResponse, ProfileUpdateRequest
from app.services.auth_service import get_current_active_user, get_password_hash, verify_password

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


@router.get("/", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_active_user)):
    return ProfileResponse(
        id=current_user.id,
        name=current_user.full_name or current_user.username,
        email=current_user.email,
        created_at=current_user.created_at,
    )


@router.put("/", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if payload.name is not None:
        normalized = payload.name.strip()
        if not normalized:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name cannot be empty")
        current_user.full_name = normalized

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return ProfileResponse(
        id=current_user.id,
        name=current_user.full_name or current_user.username,
        email=current_user.email,
        created_at=current_user.created_at,
    )


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password and confirmation do not match")

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    return MessageResponse(message="Password changed successfully")
