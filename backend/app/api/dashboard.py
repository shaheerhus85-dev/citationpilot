"""Dashboard-focused API routes."""
from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any, cast

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import DashboardOverview, DashboardSnapshotResponse
from app.services.auth_service import get_current_active_user
from app.services.submission_service import SubmissionService

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])
logger = logging.getLogger(__name__)

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

    try:
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
    except Exception as exc:  # defensive fallback for production resilience
        logger.exception("Dashboard snapshot failed for user_id=%s: %s", user_id, exc)
        payload = {
            "total_campaigns": 0,
            "total_submissions": 0,
            "success": 0,
            "pending": 0,
            "in_progress": 0,
            "failed": 0,
            "manual_required": 0,
            "latest_campaign": None,
        }
    _set_cached_snapshot(user_id, payload)
    return DashboardSnapshotResponse(**payload)


@router.get("/overview", response_model=DashboardOverview)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    user_id = cast(int, current_user.id)
    try:
        return DashboardOverview(**SubmissionService.get_dashboard_overview(db, user_id))
    except Exception as exc:  # defensive fallback for production resilience
        logger.exception("Dashboard overview failed for user_id=%s: %s", user_id, exc)
        return DashboardOverview(
            stats={
                "total_campaigns": 0,
                "total_submissions": 0,
                "success_count": 0,
                "pending_count": 0,
                "in_progress_count": 0,
                "failed_count": 0,
                "manual_required": 0,
                "business_profiles_count": 0,
                "success_rate": 0.0,
            },
            recent_campaigns=[],
            recent_activity=[],
            recent_attempts=[],
        )
