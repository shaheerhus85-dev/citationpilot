"""Dashboard-focused API routes."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, cast

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import DashboardOverview, DashboardSnapshotResponse
from app.services.auth_service import get_current_active_user
from app.services.submission_service import SubmissionService

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

_SNAPSHOT_CACHE: dict[int, tuple[datetime, dict[str, Any]]] = {}


def _get_cached_snapshot(user_id: int) -> dict[str, Any] | None:
    cached = _SNAPSHOT_CACHE.get(user_id)
    if not cached:
        return None
    cached_at, payload = cached
    if datetime.utcnow() - cached_at > timedelta(seconds=30):
        _SNAPSHOT_CACHE.pop(user_id, None)
        return None
    return payload


def _set_cached_snapshot(user_id: int, payload: dict[str, Any]) -> None:
    _SNAPSHOT_CACHE[user_id] = (datetime.utcnow(), payload)


@router.get("/snapshot", response_model=DashboardSnapshotResponse)
def get_dashboard_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    user_id = cast(int, current_user.id)
    cached = _get_cached_snapshot(user_id)
    if cached:
        return DashboardSnapshotResponse(**cached)

    overview = SubmissionService.get_dashboard_overview(db, user_id)
    latest_campaign = overview["recent_campaigns"][0] if overview["recent_campaigns"] else None
    payload = {
        "total_campaigns": overview["stats"]["total_campaigns"],
        "total_submissions": overview["stats"]["total_submissions"],
        "success": overview["stats"]["success_count"],
        "pending": overview["stats"]["pending_count"],
        "in_progress": overview["stats"]["in_progress_count"],
        "failed": overview["stats"]["failed_count"],
        "manual_required": overview["stats"]["manual_required"],
        "latest_campaign": latest_campaign,
    }
    _set_cached_snapshot(user_id, payload)
    return DashboardSnapshotResponse(**payload)


@router.get("/overview", response_model=DashboardOverview)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return DashboardOverview(**SubmissionService.get_dashboard_overview(db, cast(int, current_user.id)))
