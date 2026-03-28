"""Background worker for processing submission queue."""
import asyncio
import logging
import random
from datetime import datetime

from app.config import get_settings
from app.database import SessionLocal
from app.models.models import (
    BusinessProfile,
    Directory,
    DirectorySubmission,
    ManualSubmissionTask,
    SubmissionAttemptLog,
    SubmissionQueue,
    SubmissionStatus,
)
from automation.playwright_engine import get_automation_engine

logger = logging.getLogger(__name__)
settings = get_settings()


class SubmissionWorker:
    """Background worker for processing submissions."""

    def __init__(self):
        self.running = False

    async def start(self) -> None:
        self.running = True
        logger.info("Submission worker started")
        try:
            await self._process_loop()
        except Exception as exc:
            logger.error("Worker error: %s", exc)
            self.running = False

    async def stop(self) -> None:
        self.running = False
        logger.info("Submission worker stopped")

    async def _process_loop(self) -> None:
        while self.running:
            try:
                processed = await self._process_batch()
                logger.info("Submission worker cycle complete. Processed %s submissions.", processed)
            except Exception as exc:
                logger.error("Error processing submission batch: %s", exc)
            await asyncio.sleep(settings.WORKER_INTERVAL_SECONDS)

    async def _process_batch(self) -> int:
        db = SessionLocal()
        try:
            queue_items = (
                db.query(SubmissionQueue)
                .join(DirectorySubmission, SubmissionQueue.directory_submission_id == DirectorySubmission.id)
                .filter(DirectorySubmission.status == SubmissionStatus.PENDING.value)
                .order_by(SubmissionQueue.created_at.asc())
                .limit(settings.WORKER_BATCH_SIZE)
                .all()
            )
            if not queue_items:
                return 0

            processed_campaigns: set[int] = set()
            processed = 0
            for queue_item in queue_items:
                submission = db.query(DirectorySubmission).filter(DirectorySubmission.id == queue_item.directory_submission_id).first()
                if not submission:
                    db.delete(queue_item)
                    db.commit()
                    continue

                directory = db.query(Directory).filter(Directory.id == submission.directory_id).first()
                business = db.query(BusinessProfile).filter(BusinessProfile.id == submission.business_profile_id).first()

                submission.status = SubmissionStatus.IN_PROGRESS.value
                submission.error_message = None
                submission.timestamp = datetime.utcnow()
                db.add(submission)
                db.commit()

                if not directory or not business:
                    submission.status = SubmissionStatus.FAILED.value
                    submission.error_message = "Missing directory or business profile"
                    submission.submitted_at = datetime.utcnow()
                    submission.completed_at = datetime.utcnow()
                    db.add(submission)
                    db.add(
                        SubmissionAttemptLog(
                            directory_submission_id=submission.id,
                            attempt_number=submission.retry_count + 1,
                            phase="preflight",
                            outcome="failed",
                            error_message=submission.error_message,
                        )
                    )
                    db.delete(queue_item)
                    db.commit()
                    processed_campaigns.add(submission.submission_request_id)
                    processed += 1
                    continue

                logger.info("Processing submission #%s to %s", submission.id, directory.url)
                await asyncio.sleep(random.uniform(0.4, 1.1))
                final_status, error_message, captcha_type, resolution_path = await self._inspect_directory(directory.url, business)
                now = datetime.utcnow()
                submission.status = final_status
                submission.error_message = error_message
                submission.submission_url = directory.url
                submission.submitted_at = now
                submission.completed_at = now
                submission.captcha_type = captcha_type
                can_retry = final_status == SubmissionStatus.FAILED.value and submission.retry_count < settings.MAX_SUBMISSION_RETRIES
                if final_status == SubmissionStatus.FAILED.value:
                    submission.retry_count += 1
                if final_status == SubmissionStatus.MANUAL_REQUIRED.value:
                    existing_task = (
                        db.query(ManualSubmissionTask)
                        .filter(ManualSubmissionTask.directory_submission_id == submission.id)
                        .first()
                    )
                    if not existing_task:
                        db.add(ManualSubmissionTask(directory_submission_id=submission.id))

                db.add(
                    SubmissionAttemptLog(
                        directory_submission_id=submission.id,
                        attempt_number=max(submission.retry_count, 1),
                        phase="inspect_directory",
                        outcome=final_status,
                        error_message=f"{error_message or ''} | captcha_type={captcha_type or 'none'} | resolution_path={resolution_path}",
                    )
                )

                db.add(submission)
                if can_retry:
                    submission.status = SubmissionStatus.PENDING.value
                    submission.completed_at = None
                    db.add(submission)
                    await asyncio.sleep(random.uniform(0.7, 1.8))
                else:
                    db.delete(queue_item)
                db.commit()
                processed_campaigns.add(submission.submission_request_id)
                processed += 1

            for campaign_id in processed_campaigns:
                from app.services.submission_service import SubmissionService

                SubmissionService.refresh_campaign_metrics(db, campaign_id)

            return processed
        finally:
            db.close()

    async def _inspect_directory(
        self,
        directory_url: str,
        business: BusinessProfile,
    ) -> tuple[str, str | None, str | None, str]:
        engine = await get_automation_engine()
        business_data = {
            "business_name": business.business_name,
            "website": business.website,
            "email": business.email,
            "phone": business.phone,
            "description": business.description,
            "category": business.category,
            "country": business.country,
            "city": business.city,
            "state": business.state,
        }
        success, error_message, captcha_type, _screenshot_path, _confidence = await engine.submit_to_directory(
            directory_url=directory_url,
            business_data=business_data,
        )

        complex_captcha = {"recaptcha", "hcaptcha", "cloudflare", "turnstile", "challenge"}
        if success:
            resolution_path = "auto_solved" if captcha_type in {"image", "math"} else "auto"
            return SubmissionStatus.SUBMITTED.value, None, captcha_type, resolution_path

        if captcha_type in complex_captcha:
            return (
                SubmissionStatus.MANUAL_REQUIRED.value,
                error_message or "CAPTCHA requires manual action",
                captcha_type,
                "manual_queue",
            )

        if captcha_type in {"image", "math"}:
            return (
                SubmissionStatus.FAILED.value,
                error_message or "Simple CAPTCHA auto-solve failed",
                captcha_type,
                "auto_failed_retry",
            )

        return SubmissionStatus.FAILED.value, error_message or "Submission failed", captcha_type, "auto_failed_retry"


async def run_worker():
    worker = SubmissionWorker()
    await worker.start()


def run_worker_sync():
    asyncio.run(run_worker())
