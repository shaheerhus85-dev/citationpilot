"""Business profile, campaign, and audit services."""
from __future__ import annotations

import logging
from typing import Any, cast

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import (
    BusinessProfile,
    CampaignStatus,
    CitationAuditRun,
    Directory,
    DirectorySubmission,
    SubmissionAttemptLog,
    SubmissionQueue,
    SubmissionRequest,
    SubmissionStatus,
)
from app.schemas.schemas import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    CitationAuditRequest,
    SubmissionRequestCreate,
)
from app.services.base_service import BaseService
from app.services.directory_service import DirectoryService

logger = logging.getLogger(__name__)


class BusinessProfileService(BaseService):
    """Service for business profile management."""

    @staticmethod
    def create_profile(db: Session, user_id: int, profile_data: BusinessProfileCreate) -> BusinessProfile:
        profile = BusinessProfile(
            user_id=user_id,
            business_name=profile_data.business_name,
            website=profile_data.website,
            email=profile_data.email,
            phone=profile_data.phone,
            address_line1=profile_data.address_line1,
            address_line2=profile_data.address_line2,
            description=profile_data.description,
            category=profile_data.category,
            country=profile_data.country,
            city=profile_data.city,
            state=profile_data.state,
            postal_code=profile_data.postal_code,
            is_primary=False,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def update_profile(db: Session, profile_id: int, user_id: int, profile_data: BusinessProfileUpdate) -> BusinessProfile:
        profile = db.query(BusinessProfile).filter(
            BusinessProfile.id == profile_id,
            BusinessProfile.user_id == user_id,
        ).first()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")

        for field, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)

        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def get_profile(db: Session, profile_id: int, user_id: int) -> BusinessProfile:
        profile = db.query(BusinessProfile).filter(
            BusinessProfile.id == profile_id,
            BusinessProfile.user_id == user_id,
        ).first()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")
        return profile

    @staticmethod
    def get_user_profiles(db: Session, user_id: int) -> list[BusinessProfile]:
        return db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).order_by(BusinessProfile.created_at.desc()).all()

    @staticmethod
    def delete_profile(db: Session, profile_id: int, user_id: int) -> None:
        profile = db.query(BusinessProfile).filter(
            BusinessProfile.id == profile_id,
            BusinessProfile.user_id == user_id,
        ).first()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")
        db.delete(profile)
        db.commit()


class SubmissionService(BaseService):
    """Service for managing citation campaigns and submissions."""

    @staticmethod
    def create_submission_request(db: Session, user_id: int, request_data: SubmissionRequestCreate) -> SubmissionRequest:
        try:
            profile = db.query(BusinessProfile).filter(
                BusinessProfile.id == request_data.business_profile_id,
                BusinessProfile.user_id == user_id,
            ).first()
            if not profile:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")

            submission_request = SubmissionRequest(
                user_id=user_id,
                business_profile_id=request_data.business_profile_id,
                requested_count=request_data.requested_count,
                status=CampaignStatus.PENDING.value,
                progress_percentage=0.0,
                success_rate=0.0,
                updated_at=SubmissionService.utcnow(),
            )
            db.add(submission_request)
            db.flush()

            directories = DirectoryService.get_directories_for_profile(db, profile, request_data.requested_count)
            if not directories:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No directories available for this campaign")

            created_rows = 0
            for directory in directories:
                submission = DirectorySubmission(
                    business_profile_id=request_data.business_profile_id,
                    directory_id=directory.id,
                    submission_request_id=submission_request.id,
                    status=SubmissionStatus.PENDING.value,
                )
                db.add(submission)
                db.flush()
                db.add(SubmissionQueue(directory_submission_id=submission.id))
                created_rows += 1

            if created_rows == 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No submissions were created for this campaign")

            db.commit()
            SubmissionService.refresh_campaign_metrics(db, submission_request.id)
            db.refresh(submission_request)
            SubmissionService.ensure_submission_worker_running()
            return submission_request
        except HTTPException:
            db.rollback()
            raise
        except Exception as exc:
            db.rollback()
            logger.exception("Failed to create submission request: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create submission request",
            ) from exc

    @staticmethod
    def create_custom_campaign(
        db: Session,
        user_id: int,
        business_profile_id: int,
        directory_ids: list[int] | None = None,
        requested_count: int | None = None,
    ) -> SubmissionRequest:
        profile = db.query(BusinessProfile).filter(
            BusinessProfile.id == business_profile_id,
            BusinessProfile.user_id == user_id,
        ).first()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")

        selected_ids = [item for item in (directory_ids or []) if item]
        count = requested_count or len(selected_ids) or 10
        if count < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one directory is required")

        try:
            submission_request = SubmissionRequest(
                user_id=user_id,
                business_profile_id=business_profile_id,
                requested_count=count,
                status=CampaignStatus.PENDING.value,
                progress_percentage=0.0,
                success_rate=0.0,
                updated_at=SubmissionService.utcnow(),
            )
            db.add(submission_request)
            db.flush()

            if selected_ids:
                directories = cast(
                    list[Directory],
                    db.query(Directory)
                    .filter(Directory.id.in_(selected_ids), Directory.is_active.is_(True))
                    .all(),
                )
                found_ids = {directory.id for directory in directories}
                missing_ids = [directory_id for directory_id in selected_ids if directory_id not in found_ids]
                if missing_ids:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Some directories were not found or inactive: {missing_ids}",
                    )
            else:
                directories = DirectoryService.get_directories_for_profile(db, profile, count)

            if not directories:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No directories available for this campaign")

            created_rows = 0
            for directory in directories:
                submission = DirectorySubmission(
                    business_profile_id=business_profile_id,
                    directory_id=directory.id,
                    submission_request_id=submission_request.id,
                    status=SubmissionStatus.PENDING.value,
                )
                db.add(submission)
                db.flush()
                db.add(SubmissionQueue(directory_submission_id=submission.id))
                created_rows += 1

            if created_rows == 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No submissions were created for this campaign")

            submission_request.requested_count = created_rows
            db.commit()
            SubmissionService.refresh_campaign_metrics(db, submission_request.id)
            db.refresh(submission_request)
            SubmissionService.ensure_submission_worker_running()
            return submission_request
        except HTTPException:
            db.rollback()
            raise
        except Exception as exc:
            db.rollback()
            logger.exception("Failed to create custom campaign: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create campaign",
            ) from exc

    @staticmethod
    def get_submission_request(db: Session, request_id: int, user_id: int) -> SubmissionRequest:
        request = db.query(SubmissionRequest).filter(
            SubmissionRequest.id == request_id,
            SubmissionRequest.user_id == user_id,
        ).first()
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission request not found")
        return request

    @staticmethod
    def get_user_submission_requests(db: Session, user_id: int) -> list[SubmissionRequest]:
        requests = (
            db.query(SubmissionRequest)
            .filter(SubmissionRequest.user_id == user_id)
            .order_by(SubmissionRequest.created_at.desc())
            .all()
        )
        for request in requests:
            SubmissionService.refresh_campaign_metrics(db, request.id, commit=False)
        db.commit()
        return requests

    @staticmethod
    def _count_statuses(submissions: list[DirectorySubmission]) -> dict[str, int]:
        counts = {
            SubmissionStatus.PENDING.value: 0,
            SubmissionStatus.IN_PROGRESS.value: 0,
            SubmissionStatus.SUBMITTED.value: 0,
            SubmissionStatus.FAILED.value: 0,
            SubmissionStatus.MANUAL_REQUIRED.value: 0,
            SubmissionStatus.COMPLETED.value: 0,
        }
        for submission in submissions:
            normalized = (submission.status or SubmissionStatus.PENDING.value).lower()
            counts[normalized] = counts.get(normalized, 0) + 1
        return counts

    @staticmethod
    def refresh_campaign_metrics(db: Session, request_id: int, commit: bool = True) -> SubmissionRequest:
        request = db.query(SubmissionRequest).filter(SubmissionRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission request not found")

        submissions = cast(
            list[DirectorySubmission],
            db.query(DirectorySubmission).filter(DirectorySubmission.submission_request_id == request_id).all(),
        )
        counts = SubmissionService._count_statuses(submissions)
        total = len(submissions)
        submitted = counts[SubmissionStatus.SUBMITTED.value] + counts[SubmissionStatus.COMPLETED.value]
        terminal = submitted + counts[SubmissionStatus.FAILED.value] + counts[SubmissionStatus.MANUAL_REQUIRED.value]

        request.progress_percentage = round((terminal / total) * 100, 2) if total else 0.0
        request.success_rate = round((submitted / total) * 100, 2) if total else 0.0
        request.updated_at = SubmissionService.utcnow()

        if total and counts[SubmissionStatus.PENDING.value] == 0 and counts[SubmissionStatus.IN_PROGRESS.value] == 0:
            request.status = CampaignStatus.COMPLETED.value
            request.completed_at = request.completed_at or SubmissionService.utcnow()
        elif total and terminal > 0:
            request.status = CampaignStatus.IN_PROGRESS.value
            request.completed_at = None
        else:
            request.status = CampaignStatus.PENDING.value
            request.completed_at = None

        db.add(request)
        if commit:
            db.commit()
            db.refresh(request)
        return request

    @staticmethod
    def get_submission_progress(db: Session, request_id: int, user_id: int) -> dict[str, Any]:
        request = SubmissionService.get_submission_request(db, request_id, user_id)
        request = SubmissionService.refresh_campaign_metrics(db, request.id)
        submissions = cast(
            list[DirectorySubmission],
            db.query(DirectorySubmission).filter(DirectorySubmission.submission_request_id == request_id).all(),
        )
        counts = SubmissionService._count_statuses(submissions)
        total = len(submissions)

        return {
            "submission_request_id": request_id,
            "campaign_status": request.status,
            "total_requested": request.requested_count,
            "total": total,
            "submitted": counts[SubmissionStatus.SUBMITTED.value] + counts[SubmissionStatus.COMPLETED.value],
            "pending": counts[SubmissionStatus.PENDING.value],
            "in_progress": counts[SubmissionStatus.IN_PROGRESS.value],
            "failed": counts[SubmissionStatus.FAILED.value],
            "manual_required": counts[SubmissionStatus.MANUAL_REQUIRED.value],
            "completed": counts[SubmissionStatus.COMPLETED.value],
            "completion_percentage": request.progress_percentage,
            "success_rate": request.success_rate,
            "statuses": counts,
        }

    @staticmethod
    def get_dashboard_stats(db: Session, user_id: int) -> dict[str, Any]:
        requests = cast(list[SubmissionRequest], db.query(SubmissionRequest).filter(SubmissionRequest.user_id == user_id).all())
        for request in requests:
            SubmissionService.refresh_campaign_metrics(db, request.id, commit=False)
        db.commit()

        submissions = cast(
            list[DirectorySubmission],
            db.query(DirectorySubmission)
            .join(SubmissionRequest)
            .filter(SubmissionRequest.user_id == user_id)
            .all(),
        )
        counts = SubmissionService._count_statuses(submissions)
        business_profiles = db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).count()
        total_submissions = len(submissions)
        success_count = counts[SubmissionStatus.SUBMITTED.value] + counts[SubmissionStatus.COMPLETED.value]
        success_rate = round((success_count / total_submissions) * 100, 2) if total_submissions else 0.0

        return {
            "total_campaigns": len(requests),
            "total_submissions": total_submissions,
            "success_count": success_count,
            "pending_count": counts[SubmissionStatus.PENDING.value],
            "in_progress_count": counts[SubmissionStatus.IN_PROGRESS.value],
            "failed_count": counts[SubmissionStatus.FAILED.value],
            "manual_required": counts[SubmissionStatus.MANUAL_REQUIRED.value],
            "business_profiles_count": business_profiles,
            "success_rate": success_rate,
        }

    @staticmethod
    def _extract_attempt_metadata(raw_message: str | None) -> tuple[str | None, str]:
        text = raw_message or ""
        captcha_type: str | None = None
        resolution_path = "auto"
        parts = [segment.strip() for segment in text.split("|")]
        for part in parts:
            lowered = part.lower()
            if lowered.startswith("captcha_type="):
                candidate = part.split("=", 1)[1].strip()
                captcha_type = candidate if candidate and candidate != "none" else None
            if lowered.startswith("resolution_path="):
                candidate = part.split("=", 1)[1].strip()
                if candidate:
                    resolution_path = candidate
        return captcha_type, resolution_path

    @staticmethod
    def get_dashboard_overview(db: Session, user_id: int) -> dict[str, Any]:
        stats = SubmissionService.get_dashboard_stats(db, user_id)
        recent_campaigns = cast(
            list[SubmissionRequest],
            db.query(SubmissionRequest)
            .join(BusinessProfile)
            .filter(SubmissionRequest.user_id == user_id)
            .order_by(SubmissionRequest.created_at.desc())
            .limit(6)
            .all(),
        )
        recent_activity = cast(
            list[DirectorySubmission],
            db.query(DirectorySubmission)
            .join(SubmissionRequest)
            .filter(SubmissionRequest.user_id == user_id)
            .order_by(DirectorySubmission.timestamp.desc())
            .limit(10)
            .all(),
        )
        recent_attempts = cast(
            list[SubmissionAttemptLog],
            db.query(SubmissionAttemptLog)
            .join(DirectorySubmission, SubmissionAttemptLog.directory_submission_id == DirectorySubmission.id)
            .join(SubmissionRequest, DirectorySubmission.submission_request_id == SubmissionRequest.id)
            .filter(SubmissionRequest.user_id == user_id)
            .order_by(SubmissionAttemptLog.created_at.desc())
            .limit(20)
            .all(),
        )

        return {
            "stats": stats,
            "recent_campaigns": [
                {
                    "id": item.id,
                    "requested_count": item.requested_count,
                    "created_at": item.created_at,
                    "completed_at": item.completed_at,
                    "business_name": item.business_profile.business_name if item.business_profile else None,
                    "status": item.status,
                    "progress_percentage": item.progress_percentage,
                    "success_rate": item.success_rate,
                }
                for item in recent_campaigns
            ],
            "recent_activity": [
                {
                    "id": item.id,
                    "directory_name": item.directory.name if item.directory else None,
                    "directory_url": item.directory.url if item.directory else None,
                    "status": item.status,
                    "timestamp": item.timestamp,
                    "submitted_at": item.submitted_at,
                    "error_message": item.error_message,
                }
                for item in recent_activity
            ],
            "recent_attempts": [
                {
                    "id": attempt.id,
                    "submission_id": attempt.directory_submission_id,
                    "directory_name": attempt.directory_submission.directory.name if attempt.directory_submission and attempt.directory_submission.directory else None,
                    "status": attempt.directory_submission.status if attempt.directory_submission else "unknown",
                    "captcha_type": SubmissionService._extract_attempt_metadata(attempt.error_message)[0]
                    or (attempt.directory_submission.captcha_type if attempt.directory_submission else None),
                    "resolution_path": SubmissionService._extract_attempt_metadata(attempt.error_message)[1],
                    "retries": attempt.directory_submission.retry_count if attempt.directory_submission else 0,
                    "outcome": attempt.outcome,
                    "timestamp": attempt.created_at,
                    "error_message": attempt.error_message,
                }
                for attempt in recent_attempts
            ],
        }

    @staticmethod
    def get_campaign_details(db: Session, campaign_id: int, user_id: int) -> dict[str, Any]:
        request = SubmissionService.get_submission_request(db, campaign_id, user_id)
        request = SubmissionService.refresh_campaign_metrics(db, request.id)
        submissions = cast(
            list[DirectorySubmission],
            db.query(DirectorySubmission)
            .filter(DirectorySubmission.submission_request_id == campaign_id)
            .order_by(DirectorySubmission.timestamp.asc())
            .all(),
        )
        counts = SubmissionService._count_statuses(submissions)

        return {
            "campaign": {
                "id": request.id,
                "name": request.business_profile.business_name if request.business_profile else f"Campaign #{request.id}",
                "status": request.status,
                "created_at": request.created_at,
                "requested_count": request.requested_count,
                "business_profile_id": request.business_profile_id,
                "progress_percentage": request.progress_percentage,
                "success_rate": request.success_rate,
            },
            "stats": {
                "total": len(submissions),
                "submitted": counts[SubmissionStatus.SUBMITTED.value] + counts[SubmissionStatus.COMPLETED.value],
                "pending": counts[SubmissionStatus.PENDING.value],
                "in_progress": counts[SubmissionStatus.IN_PROGRESS.value],
                "failed": counts[SubmissionStatus.FAILED.value],
                "manual_required": counts[SubmissionStatus.MANUAL_REQUIRED.value],
            },
            "submissions": [
                {
                    "id": row.id,
                    "directory_name": row.directory.name if row.directory else "Directory",
                    "directory_url": row.directory.url if row.directory else "",
                    "status": row.status,
                    "submitted_at": row.submitted_at,
                    "error": row.error_message,
                    "response_message": row.error_message,
                }
                for row in submissions
            ],
        }


class AuditService(BaseService):
    """Simple audit service for business citation checks."""

    @staticmethod
    def run_basic_audit(db: Session, user_id: int, payload: CitationAuditRequest) -> dict[str, Any]:
        directories = DirectoryService.list_directories(db, limit=80)
        website = (payload.website or "").lower()
        category = (payload.category or "").lower()
        country = (payload.country or "").lower()

        found: list[str] = []
        missing: list[str] = []
        competitor_signals: list[str] = []

        for directory in directories:
            directory_name = directory.name or "Directory"
            if website and website in (directory.url or "").lower():
                found.append(directory_name)
            elif category and category in (directory.category or "").lower():
                missing.append(directory_name)
            elif country and country in (directory.country or "").lower():
                competitor_signals.append(f"{directory_name} has strong {payload.country} market relevance")

        if not found:
            found = [item.name for item in directories[:3]]
        if not missing:
            missing = [item.name for item in directories[3:10]]

        inconsistencies: list[str] = []
        if payload.website and not payload.website.startswith(("http://", "https://")):
            inconsistencies.append("Store the website with a full protocol for consistent citation formatting.")
        if payload.business_name != payload.business_name.title():
            inconsistencies.append("Use a consistent business name format across all listings.")

        recommendations = [
            "Prioritize tier 1 directories in the first campaign batch.",
            "Keep NAP formatting identical across every listing.",
            "Review manual-required rows daily so campaigns keep moving.",
        ]

        db.add(
            CitationAuditRun(
                user_id=user_id,
                business_name=payload.business_name,
                website=payload.website,
                found_count=len(found),
                missing_count=len(missing),
                inconsistency_count=len(inconsistencies),
                recommendations="\n".join(recommendations),
            )
        )
        db.commit()

        return {
            "business_name": payload.business_name,
            "found_count": len(found),
            "missing_count": len(missing),
            "inconsistency_count": len(inconsistencies),
            "found_listings": found[:10],
            "missing_opportunities": missing[:12],
            "inconsistencies": inconsistencies,
            "competitor_signals": competitor_signals[:8],
            "recommendations": recommendations,
        }
