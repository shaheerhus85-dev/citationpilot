from __future__ import annotations

from typing import cast

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.business import BusinessRequest, BusinessResponse
from app.schemas.schemas import BusinessProfileUpdate
from app.services.auth_service import get_current_active_user
from app.services.submission_service import BusinessProfileService

router = APIRouter(prefix="/api/v1/businesses", tags=["businesses"])


@router.post("/", response_model=BusinessResponse)
def create_business(
    payload: BusinessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    profile = BusinessProfileService.create_profile(db, cast(int, current_user.id), payload)
    return BusinessResponse.model_validate(profile)


@router.get("/", response_model=list[BusinessResponse])
def list_businesses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    rows = BusinessProfileService.get_user_profiles(db, cast(int, current_user.id))
    return [BusinessResponse.model_validate(row) for row in rows]


@router.get("/{business_id}", response_model=BusinessResponse)
def get_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    row = BusinessProfileService.get_profile(db, business_id, cast(int, current_user.id))
    return BusinessResponse.model_validate(row)


@router.put("/{business_id}", response_model=BusinessResponse)
def update_business(
    business_id: int,
    payload: BusinessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    row = BusinessProfileService.update_profile(
        db,
        business_id,
        cast(int, current_user.id),
        BusinessProfileUpdate(**payload.model_dump()),
    )
    return BusinessResponse.model_validate(row)


@router.delete("/{business_id}")
def delete_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    BusinessProfileService.delete_profile(db, business_id, cast(int, current_user.id))
    return {"message": "Business deleted successfully"}
