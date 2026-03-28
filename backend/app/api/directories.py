from __future__ import annotations

from typing import cast

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import BusinessProfile, Directory
from app.schemas.schemas import DirectoryResponse
from app.services.auth_service import get_current_active_user
from app.services.directory_service import DirectoryService
from app.services.intelligent_directory_selection_service import IntelligentDirectorySelectionService

router = APIRouter(prefix="/api/v1/directories", tags=["directories"])


class IntelligentDirectoryItem(BaseModel):
    id: int
    name: str
    url: str
    category: str | None = None
    country: str | None = None
    tier: str
    score: float
    success_rate: float
    captcha_probability: float
    estimated_completion_minutes: float


class IntelligentDirectorySelectionResponse(BaseModel):
    business_id: int
    criteria: dict[str, str | int]
    used_fallback_category: bool
    fallback_reason: str | None = None
    directories: list[IntelligentDirectoryItem]
    estimated_success_rate: float
    estimated_completion_time_minutes: int


@router.get("/", response_model=list[DirectoryResponse])
def list_directories(
    vertical: str | None = Query(default=None),
    country: str | None = Query(default=None),
    tier: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    rows = DirectoryService.list_directories(db, limit=500)
    filtered = rows
    if vertical:
        filtered = [row for row in filtered if vertical.lower() in (row.category or "").lower()]
    if country:
        filtered = [row for row in filtered if country.lower() in (row.country or "").lower()]
    if tier:
        filtered = [row for row in filtered if (getattr(row.tier, "value", str(row.tier))).lower() == tier.lower()]
    return [DirectoryResponse.model_validate(row) for row in filtered]


@router.get("/recommended", response_model=list[DirectoryResponse])
def recommended_directories(
    vertical: str,
    country: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    rows = DirectoryService.get_directories_for_campaign(db, vertical, 25)
    if country:
        local = [row for row in rows if country.lower() in (row.country or "").lower()]
        if local:
            rows = local
    return [DirectoryResponse.model_validate(row) for row in rows]


@router.get("/intelligent-select", response_model=IntelligentDirectorySelectionResponse)
def intelligent_select(
    business_id: int,
    limit: int = Query(default=50, ge=1, le=50),
    category: str | None = Query(default=None),
    country: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    business = cast(
        BusinessProfile | None,
        db.query(BusinessProfile).filter(BusinessProfile.id == business_id).first(),
    )
    if not business or business.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")

    result = IntelligentDirectorySelectionService.select_for_business(
        db=db,
        business_id=business_id,
        limit=limit,
        category_override=category,
        country_override=country,
        user_id=current_user.id,
    )
    return IntelligentDirectorySelectionResponse.model_validate(result)


@router.get("/{directory_id}", response_model=DirectoryResponse)
def get_directory(
    directory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    row = cast(Directory | None, db.query(Directory).filter(Directory.id == directory_id).first())
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Directory not found")
    return DirectoryResponse.model_validate(row)
