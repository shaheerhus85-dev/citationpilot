"""Campaign endpoints for MVP flow."""
from __future__ import annotations

from typing import cast

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import CampaignDetailsResponse, CitationProgress, SubmissionRequestCreate, SubmissionRequestResponse
from app.services.auth_service import get_current_active_user
from app.services.intelligent_directory_selection_service import IntelligentDirectorySelectionService
from app.services.submission_service import SubmissionService

router = APIRouter(prefix="/api/v1/campaigns", tags=["campaigns"])


class CampaignCreateRequest(BaseModel):
    business_profile_id: int
    directory_ids: list[int] = Field(default_factory=list)
    campaign_name: str | None = None
    requested_count: int | None = Field(default=None, ge=10, le=50)
    target_country: str | None = None


@router.post("/", response_model=SubmissionRequestResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=SubmissionRequestResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_campaign(
    payload: CampaignCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a campaign using selected directories or a requested count fallback."""
    if payload.directory_ids:
        return SubmissionService.create_custom_campaign(
            db,
            cast(int, current_user.id),
            business_profile_id=payload.business_profile_id,
            directory_ids=payload.directory_ids,
            requested_count=payload.requested_count,
            target_country=payload.target_country,
        )
    target_count = payload.requested_count or 10
    selection = IntelligentDirectorySelectionService.select_for_business(
        db=db,
        business_id=payload.business_profile_id,
        limit=target_count,
        country_override=payload.target_country,
        user_id=cast(int, current_user.id),
    )
    selected_ids = [item["id"] for item in selection["directories"]]
    if selected_ids:
        return SubmissionService.create_custom_campaign(
            db,
            cast(int, current_user.id),
            business_profile_id=payload.business_profile_id,
            directory_ids=selected_ids,
            requested_count=target_count,
            target_country=payload.target_country,
        )

    fallback = SubmissionRequestCreate(
        business_profile_id=payload.business_profile_id,
        requested_count=target_count,
        target_country=payload.target_country,
    )
    return SubmissionService.create_submission_request(db, cast(int, current_user.id), fallback)


@router.get("/", response_model=list[SubmissionRequestResponse])
@router.get("", response_model=list[SubmissionRequestResponse], include_in_schema=False)
def list_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return SubmissionService.get_user_submission_requests(db, cast(int, current_user.id))


@router.get("/{campaign_id}/details", response_model=CampaignDetailsResponse)
def get_campaign_details(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CampaignDetailsResponse(**SubmissionService.get_campaign_details(db, campaign_id, cast(int, current_user.id)))


@router.get("/{campaign_id}/progress", response_model=CitationProgress)
def get_campaign_progress(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return CitationProgress(**SubmissionService.get_submission_progress(db, campaign_id, cast(int, current_user.id)))
