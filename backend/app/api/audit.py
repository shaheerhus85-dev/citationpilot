"""Citation audit API routes."""
from typing import cast

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import CitationAuditRequest, CitationAuditResponse
from app.services.auth_service import get_current_active_user
from app.services.submission_service import AuditService

router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


@router.post("/run", response_model=CitationAuditResponse)
async def run_audit(
    payload: CitationAuditRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Run a basic citation audit for the current user."""
    return AuditService.run_basic_audit(db, cast(int, current_user.id), payload)
