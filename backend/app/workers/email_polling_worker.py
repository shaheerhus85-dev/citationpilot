"""Background worker to poll temp inboxes and auto-verify directory submissions."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal
from app.models.models import DirectorySubmission, SubmissionAttemptLog, SubmissionStatus, TempEmailAccount
from app.services.submission_service import SubmissionService
from app.services.temp_email_service import TempEmailService
from automation.playwright_engine import get_automation_engine

logger = logging.getLogger(__name__)
settings = get_settings()


class EmailPollingWorker:
    """Poll temp email inboxes and execute verification links."""

    def __init__(self) -> None:
        self.running = False
        self.interval_seconds = max(10, settings.TEMP_EMAIL_POLL_INTERVAL_SECONDS)

    async def start(self) -> None:
        self.running = True
        logger.info("Temp email polling worker started (interval=%ss)", self.interval_seconds)
        while self.running:
            try:
                await self.run_cycle()
            except Exception as exc:  # pragma: no cover - worker guard
                logger.exception("Email polling cycle failed: %s", exc)
            await asyncio.sleep(self.interval_seconds)

    async def stop(self) -> None:
        self.running = False

    async def run_cycle(self) -> None:
        db = SessionLocal()
        try:
            accounts = (
                db.query(TempEmailAccount)
                .filter(TempEmailAccount.status == "active")
                .order_by(TempEmailAccount.created_at.asc())
                .all()
            )
            if not accounts:
                logger.info("Email polling cycle complete (active_accounts=0)")
                return

            processed_messages = 0
            for account in accounts:
                processed_messages += await self._process_account(db, account)
                db.commit()

            logger.info(
                "Email polling cycle complete (active_accounts=%s, processed_messages=%s)",
                len(accounts),
                processed_messages,
            )
        finally:
            db.close()

    async def _process_account(self, db: Session, account: TempEmailAccount) -> int:
        if not account.access_token:
            self._log_attempt(
                db=db,
                submission_id=account.directory_submission_id,
                phase="email_polling",
                outcome="failed",
                error_message="Missing temp email access token",
            )
            account.status = "error"
            db.add(account)
            return 0

        try:
            messages = TempEmailService.list_messages(account.access_token)
        except Exception as exc:
            logger.warning("Temp inbox poll failed for %s: %s", account.email_address, exc)
            self._log_attempt(
                db=db,
                submission_id=account.directory_submission_id,
                phase="email_polling",
                outcome="failed",
                error_message=f"Mailbox polling failed: {exc}",
            )
            if "401" in str(exc) or "403" in str(exc):
                account.status = "error"
                db.add(account)
            return 0

        if not messages:
            return 0

        processed = 0
        for message in messages:
            message_id = str(message.get("id") or "")
            if not message_id:
                continue
            if not self._message_targets_account(message, account.email_address):
                continue
            if self._already_processed_message(db, account.directory_submission_id, message_id):
                continue

            logger.info("Email received for %s (message_id=%s)", account.email_address, message_id)
            full_message = TempEmailService.get_message(account.access_token, message_id)
            html = str(full_message.get("html") or "")
            text = str(full_message.get("text") or "")
            content = f"{html}\n{text}"
            links = TempEmailService.extract_verification_links(content)
            logger.info("Extracted %s links from message_id=%s", len(links), message_id)

            if not links:
                self._log_attempt(
                    db=db,
                    submission_id=account.directory_submission_id,
                    phase="email_polling",
                    outcome="no_link",
                    error_message=f"[message_id:{message_id}] No verification link found",
                )
                processed += 1
                continue

            preferred_link = TempEmailService.extract_verification_link(content) or links[0]
            success, error_message = await self._verify_link(preferred_link)
            self._save_verification_result(
                db=db,
                submission_id=account.directory_submission_id,
                message_id=message_id,
                link=preferred_link,
                success=success,
                error_message=error_message,
            )
            processed += 1

        return processed

    def _message_targets_account(self, message: dict[str, Any], email_address: str) -> bool:
        """Match a polled email to the temp inbox via recipient email or account reference."""
        lowered_address = email_address.lower()
        recipient = message.get("to")
        if isinstance(recipient, dict):
            target = str(recipient.get("address") or "").lower()
            return not target or target == lowered_address
        if isinstance(recipient, str):
            return recipient.lower() == lowered_address
        return True

    async def _verify_link(self, verification_url: str) -> tuple[bool, str | None]:
        logger.info("Opening verification link: %s", verification_url)
        engine = await get_automation_engine()
        return await engine.verify_url(verification_url)

    def _save_verification_result(
        self,
        db: Session,
        submission_id: int,
        message_id: str,
        link: str,
        success: bool,
        error_message: str | None = None,
    ) -> None:
        submission = db.query(DirectorySubmission).filter(DirectorySubmission.id == submission_id).first()
        if not submission:
            self._log_attempt(
                db=db,
                submission_id=submission_id,
                phase="email_verification",
                outcome="failed",
                error_message=f"[message_id:{message_id}] Submission not found",
            )
            return

        if success:
            submission.status = SubmissionStatus.COMPLETED.value
            submission.error_message = None
            submission.submitted_at = submission.submitted_at or datetime.utcnow()
            submission.completed_at = datetime.utcnow()
            outcome = "success"
            logger.info("Verification success for submission_id=%s", submission_id)
        else:
            submission.status = SubmissionStatus.FAILED.value
            submission.error_message = error_message or "Email verification failed"
            submission.completed_at = datetime.utcnow()
            outcome = "failed"
            logger.warning("Verification failed for submission_id=%s: %s", submission_id, submission.error_message)

        db.add(submission)
        self._log_attempt(
            db=db,
            submission_id=submission_id,
            phase="email_verification",
            outcome=outcome,
            error_message=f"[message_id:{message_id}] link={link} error={error_message or ''}".strip(),
        )
        SubmissionService.refresh_campaign_metrics(db, submission.submission_request_id, commit=False)

    def _already_processed_message(self, db: Session, submission_id: int, message_id: str) -> bool:
        marker = f"[message_id:{message_id}]"
        found = (
            db.query(SubmissionAttemptLog.id)
            .filter(
                SubmissionAttemptLog.directory_submission_id == submission_id,
                SubmissionAttemptLog.phase.in_(["email_polling", "email_verification"]),
                SubmissionAttemptLog.error_message.contains(marker),
            )
            .first()
        )
        return found is not None

    def _log_attempt(
        self,
        db: Session,
        submission_id: int,
        phase: str,
        outcome: str,
        error_message: str | None = None,
        http_status: int | None = None,
    ) -> None:
        attempts = (
            db.query(SubmissionAttemptLog)
            .filter(SubmissionAttemptLog.directory_submission_id == submission_id)
            .count()
        )
        db.add(
            SubmissionAttemptLog(
                directory_submission_id=submission_id,
                attempt_number=max(1, attempts + 1),
                phase=phase,
                outcome=outcome,
                error_message=error_message,
                http_status=http_status,
            )
        )


async def run_worker() -> None:
    worker = EmailPollingWorker()
    await worker.start()


def run_worker_sync() -> None:
    asyncio.run(run_worker())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_worker())
