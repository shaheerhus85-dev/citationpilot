"""Helpers for keeping the submission worker running."""
from __future__ import annotations

import logging
import threading

logger = logging.getLogger(__name__)

_worker_thread: threading.Thread | None = None
_email_worker_thread: threading.Thread | None = None
_temp_email_worker_thread: threading.Thread | None = None
_worker_lock = threading.Lock()


def get_submission_service():
    from app.services.submission_service import SubmissionService

    return SubmissionService()


def ensure_submission_worker_running() -> bool:
    """Start the submission worker once and keep it alive as a daemon thread."""
    global _worker_thread

    with _worker_lock:
        if _worker_thread and _worker_thread.is_alive():
            return False

        from app.workers.submission_worker import run_worker_sync

        _worker_thread = threading.Thread(
            target=run_worker_sync,
            name="submission-worker",
            daemon=True,
        )
        _worker_thread.start()
        logger.info("Submission worker thread started")
        return True


def ensure_email_poller_worker_running() -> bool:
    """Start email poller worker once and keep it alive as daemon."""
    global _email_worker_thread

    with _worker_lock:
        if _email_worker_thread and _email_worker_thread.is_alive():
            return False

        from app.workers.email_poller_worker import run_worker_sync as run_email_worker_sync

        _email_worker_thread = threading.Thread(
            target=run_email_worker_sync,
            name="email-poller-worker",
            daemon=True,
        )
        _email_worker_thread.start()
        logger.info("Email poller worker thread started")
        return True


def ensure_email_polling_worker_running() -> bool:
    """Start temp-email polling worker once and keep it alive as daemon."""
    global _temp_email_worker_thread

    with _worker_lock:
        if _temp_email_worker_thread and _temp_email_worker_thread.is_alive():
            return False

        from app.workers.email_polling_worker import run_worker_sync as run_temp_email_worker_sync

        _temp_email_worker_thread = threading.Thread(
            target=run_temp_email_worker_sync,
            name="temp-email-polling-worker",
            daemon=True,
        )
        _temp_email_worker_thread.start()
        logger.info("Temp email polling worker thread started")
        return True
