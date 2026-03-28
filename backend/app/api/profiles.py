"""Business profile API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, cast
from app.database import get_db
from app.schemas.schemas import BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileResponse
from app.services.auth_service import get_current_active_user
from app.services.submission_service import BusinessProfileService
from app.models.models import User

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])


@router.post("/", response_model=BusinessProfileResponse)
async def create_business_profile(
    profile_data: BusinessProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new business profile."""
    profile = BusinessProfileService.create_profile(db, cast(int, current_user.id), profile_data)
    return profile


@router.get("/", response_model=List[BusinessProfileResponse])
async def list_business_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all business profiles for current user."""
    profiles = BusinessProfileService.get_user_profiles(db, cast(int, current_user.id))
    return profiles


@router.get("/{profile_id}", response_model=BusinessProfileResponse)
async def get_business_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific business profile."""
    profile = BusinessProfileService.get_profile(db, profile_id, cast(int, current_user.id))
    return profile


@router.put("/{profile_id}", response_model=BusinessProfileResponse)
async def update_business_profile(
    profile_id: int,
    profile_data: BusinessProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update business profile."""
    profile = BusinessProfileService.update_profile(db, profile_id, cast(int, current_user.id), profile_data)
    return profile


@router.delete("/{profile_id}")
async def delete_business_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete business profile."""
    BusinessProfileService.delete_profile(db, profile_id, cast(int, current_user.id))
    return {"message": "Profile deleted successfully"}
