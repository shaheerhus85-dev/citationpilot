"""Shared service helpers used across the backend service layer."""
from __future__ import annotations

import logging
from datetime import datetime


class BaseService:
    """Common helpers for service modules."""

    logger = logging.getLogger("app.services")

    @staticmethod
    def utcnow() -> datetime:
        return datetime.utcnow()

    @staticmethod
    def ensure_submission_worker_running() -> bool:
        from app.workers.worker_manager import ensure_submission_worker_running

        return ensure_submission_worker_running()
