"""Background worker to poll Gmail and auto-process verification links."""
from __future__ import annotations

import asyncio
import logging

from app.config import get_settings
from app.services.email_verification_service import EmailVerificationService

logger = logging.getLogger(__name__)
settings = get_settings()


class EmailPollerWorker:
    """Poll Gmail inbox and process verification emails."""

    def __init__(self) -> None:
        self.running = False

    async def start(self) -> None:
        self.running = True
        logger.info("Email poller worker started")
        while self.running:
            try:
                added = EmailVerificationService.poll_gmail_once()
                processed = await EmailVerificationService.process_pending_auto_verifications()
                logger.info("Email poll cycle complete (new=%s, processed=%s)", added, processed)
            except Exception as exc:
                logger.exception("Email poll cycle failed: %s", exc)
            await asyncio.sleep(max(settings.EMAIL_POLL_INTERVAL_SECONDS, 30))

    async def stop(self) -> None:
        self.running = False


async def run_worker() -> None:
    worker = EmailPollerWorker()
    await worker.start()


def run_worker_sync() -> None:
    asyncio.run(run_worker())

