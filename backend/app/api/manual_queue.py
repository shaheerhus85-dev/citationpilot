from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import get_current_active_user
from app.services.manual_queue_service import ManualQueueService
from app.services.temp_email_service import TempEmailService

router = APIRouter(prefix="/api/v1/submissions", tags=["manual-queue"])


class ManualCompletionRequest(BaseModel):
    success: bool
    operator_notes: str | None = None


@router.get("/manual-queue")
def get_manual_queue(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return ManualQueueService.list_manual_queue(db, limit=limit, offset=offset)


@router.post("/{submission_id}/mark-complete")
def mark_complete(
    submission_id: int,
    payload: ManualCompletionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return ManualQueueService.mark_complete(db, submission_id, payload.success, payload.operator_notes)


@router.get("/{submission_id}/temp-email")
def get_temp_email(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TempEmailService.create_account(db=db, submission_id=submission_id)


@router.get("/manual-queue/stats")
def queue_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return ManualQueueService.get_queue_stats(db)
