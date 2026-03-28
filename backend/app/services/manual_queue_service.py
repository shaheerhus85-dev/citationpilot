from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.models import DirectorySubmission, ManualSubmissionTask, ManualTaskStatus, SubmissionStatus


class ManualQueueService:
    """Service layer for manual queue operations."""

    @staticmethod
    def _ensure_manual_tasks(db: Session) -> None:
        submissions = (
            db.query(DirectorySubmission)
            .options(joinedload(DirectorySubmission.manual_task))
            .filter(DirectorySubmission.status == SubmissionStatus.MANUAL_REQUIRED.value)
            .all()
        )
        created = False
        for submission in submissions:
            if submission.manual_task:
                continue
            db.add(
                ManualSubmissionTask(
                    directory_submission_id=submission.id,
                    status=ManualTaskStatus.PENDING.value,
                    priority=100,
                )
            )
            created = True
        if created:
            db.commit()

    @staticmethod
    def list_manual_queue(db: Session, limit: int = 100, offset: int = 0) -> dict[str, Any]:
        ManualQueueService._ensure_manual_tasks(db)
        query = (
            db.query(ManualSubmissionTask)
            .options(
                joinedload(ManualSubmissionTask.directory_submission).joinedload(DirectorySubmission.directory),
                joinedload(ManualSubmissionTask.directory_submission).joinedload(DirectorySubmission.business_profile),
            )
            .order_by(ManualSubmissionTask.priority.asc(), ManualSubmissionTask.created_at.asc())
        )
        total = query.count()
        rows = query.offset(offset).limit(limit).all()

        items: list[dict[str, Any]] = []
        for task in rows:
            submission = task.directory_submission
            profile = submission.business_profile if submission else None
            directory = submission.directory if submission else None
            items.append(
                {
                    "id": submission.id if submission else None,
                    "task_id": task.id,
                    "directory_name": directory.name if directory else None,
                    "directory_url": directory.url if directory else None,
                    "error_message": submission.error_message if submission else None,
                    "captcha_type": submission.captcha_type if submission else None,
                    "created_at": task.created_at,
                    "business_data": {
                        "business_name": profile.business_name if profile else None,
                        "website": profile.website if profile else None,
                        "email": profile.email if profile else None,
                        "phone": profile.phone if profile else None,
                        "address_line1": profile.address_line1 if profile else None,
                        "address_line2": profile.address_line2 if profile else None,
                        "description": profile.description if profile else None,
                        "category": profile.category if profile else None,
                        "country": profile.country if profile else None,
                        "city": profile.city if profile else None,
                        "state": profile.state if profile else None,
                        "postal_code": profile.postal_code if profile else None,
                    },
                }
            )
        return {"total": total, "items": items}

    @staticmethod
    def mark_complete(db: Session, submission_id: int, success: bool, operator_notes: str | None = None) -> dict[str, Any]:
        submission = (
            db.query(DirectorySubmission)
            .options(joinedload(DirectorySubmission.manual_task))
            .filter(DirectorySubmission.id == submission_id)
            .first()
        )
        if not submission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

        task = submission.manual_task
        now = datetime.utcnow()
        submission.status = SubmissionStatus.SUBMITTED.value if success else SubmissionStatus.FAILED.value
        submission.submitted_at = submission.submitted_at or now
        submission.completed_at = now
        if operator_notes:
            submission.error_message = None if success else operator_notes

        if task:
            task.status = ManualTaskStatus.COMPLETED.value if success else ManualTaskStatus.FAILED.value
            task.operator_notes = operator_notes
            task.completed_at = now
            task.updated_at = now
            db.add(task)

        db.add(submission)
        db.commit()
        db.refresh(submission)
        return {
            "id": submission.id,
            "status": submission.status,
            "submitted_at": submission.submitted_at,
            "completed_at": submission.completed_at,
        }

    @staticmethod
    def get_queue_stats(db: Session) -> dict[str, Any]:
        ManualQueueService._ensure_manual_tasks(db)
        rows = (
            db.query(DirectorySubmission)
            .filter(DirectorySubmission.status == SubmissionStatus.MANUAL_REQUIRED.value)
            .all()
        )
        by_captcha_type: dict[str, int] = {}
        for row in rows:
            key = row.captcha_type or "unknown"
            by_captcha_type[key] = by_captcha_type.get(key, 0) + 1
        return {
            "total_pending": len(rows),
            "by_captcha_type": by_captcha_type,
            "estimated_time_minutes": len(rows) * 3,
        }
