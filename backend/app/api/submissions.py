"""Submissions/Citations API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, cast
from app.database import get_db
from app.schemas.schemas import (
    SubmissionRequestCreate, SubmissionRequestResponse,
    DirectorySubmissionResponse, DirectorySubmissionBulkResponse,
    CitationProgress, DashboardOverview, CampaignSubmissionStatusResponse
)
from app.services.auth_service import get_current_active_user
from app.services.submission_service import SubmissionService
from app.services.directory_service import DirectoryService
from app.models.models import User, DirectorySubmission

router = APIRouter(prefix="/api/v1/submissions", tags=["submissions"])


@router.post("/request", response_model=SubmissionRequestResponse)
async def create_submission_request(
    request_data: SubmissionRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new citation submission request."""
    request = SubmissionService.create_submission_request(db, cast(int, current_user.id), request_data)
    return request


@router.get("/requests", response_model=List[SubmissionRequestResponse])
async def list_submission_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all submission requests for current user."""
    requests = SubmissionService.get_user_submission_requests(db, cast(int, current_user.id))
    return requests


@router.get("/requests/{request_id}", response_model=CitationProgress)
async def get_submission_progress(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get progress for a specific submission request."""
    progress = SubmissionService.get_submission_progress(db, request_id, cast(int, current_user.id))
    return progress


@router.get("/request/{request_id}/details", response_model=DirectorySubmissionBulkResponse)
async def get_submission_details(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed submission information."""
    # Verify request belongs to user
    SubmissionService.get_submission_request(db, request_id, cast(int, current_user.id))
    
    submissions = db.query(DirectorySubmission).filter(DirectorySubmission.submission_request_id == request_id).all()
    
    if not submissions:
        return DirectorySubmissionBulkResponse(
            total=0,
            submitted=0,
            pending=0,
            failed=0,
            manual_required=0,
            completion_percentage=0.0,
            submissions=[],
        )
    
    # Calculate stats
    total = len(submissions)
    submitted = sum(1 for s in submissions if s.status in {"submitted", "completed"})
    pending = sum(1 for s in submissions if s.status == "pending")
    failed = sum(1 for s in submissions if s.status == "failed")
    manual = sum(1 for s in submissions if s.status == "manual_required")
    
    return DirectorySubmissionBulkResponse(
        total=total,
        submitted=submitted,
        pending=pending,
        failed=failed,
        manual_required=manual,
        completion_percentage=((submitted + manual) / total * 100) if total > 0 else 0,
        submissions=[
            DirectorySubmissionResponse(
                id=s.id,
                directory_id=s.directory_id,
                directory_url=s.directory.url if s.directory else None,
                directory_name=s.directory.name if s.directory else None,
                status=s.status,
                error_message=s.error_message,
                captcha_type=s.captcha_type,
                screenshot_path=s.screenshot_path,
                captcha_confidence=s.captcha_confidence,
                submission_url=s.submission_url,
                timestamp=s.timestamp,
                completed_at=s.completed_at,
                retry_count=s.retry_count,
            )
            for s in submissions
        ]
    )


@router.get("/dashboard", response_model=DashboardOverview)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard statistics."""
    return DashboardOverview(**SubmissionService.get_dashboard_overview(db, cast(int, current_user.id)))


@router.post("/sync-directories")
async def sync_directories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Sync directories from CSV (admin only - in production add proper auth)."""
    try:
        count = DirectoryService.load_directories_from_csv(db)
        return {"message": f"Synced {count} new directories"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{campaign_id}", response_model=CampaignSubmissionStatusResponse)
async def get_campaign_status(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    MVP-compatible status endpoint.
    Returns safe payload even when campaign has no rows yet (never throws no-submission 404).
    """
    SubmissionService.get_submission_request(db, campaign_id, cast(int, current_user.id))
    submissions = db.query(DirectorySubmission).filter(DirectorySubmission.submission_request_id == campaign_id).all()

    total = len(submissions)
    pending = sum(1 for s in submissions if s.status in {"pending", "in_progress"})
    success = sum(1 for s in submissions if s.status in {"submitted", "completed"})
    failed = sum(1 for s in submissions if s.status == "failed")
    manual_required = sum(1 for s in submissions if s.status == "manual_required")

    return CampaignSubmissionStatusResponse(
        campaign_id=campaign_id,
        total=total,
        success=success,
        pending=pending,
        failed=failed,
        manual_required=manual_required,
        submissions=[
            {
                "directory_url": s.directory.url if s.directory else "",
                "status": s.status,
                "response_message": s.error_message,
            }
            for s in submissions
        ],
    )
