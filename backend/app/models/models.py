from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class DirectoryTier(str, Enum):
    TIER_1 = "tier_1"
    TIER_2 = "tier_2"
    TIER_3 = "tier_3"


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    FAILED = "failed"
    MANUAL_REQUIRED = "manual_required"
    COMPLETED = "completed"


class CampaignStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class VerificationEmailStatus(str, Enum):
    PENDING = "pending"
    AUTO_VERIFIED = "auto_verified"
    MANUAL = "manual"


class ManualTaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class TempEmailStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    ERROR = "error"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False, index=True)
    verification_token = Column(String, unique=True, nullable=True, index=True)
    verification_sent_at = Column(DateTime, nullable=True)
    verification_expires_at = Column(DateTime, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, nullable=True)

    business_profiles = relationship("BusinessProfile", back_populates="user", cascade="all, delete-orphan")
    submission_requests = relationship("SubmissionRequest", back_populates="user", cascade="all, delete-orphan")
    verification_emails = relationship("VerificationEmail", back_populates="user", cascade="all, delete-orphan")
    contact_messages = relationship("ContactMessage", back_populates="user")
    manual_tasks = relationship("ManualSubmissionTask", back_populates="assigned_to_user")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="contact_messages")


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    business_name = Column(String, nullable=False, index=True)
    website = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    category = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="business_profiles")
    submission_requests = relationship("SubmissionRequest", back_populates="business_profile", cascade="all, delete-orphan")
    submissions = relationship("DirectorySubmission", back_populates="business_profile", cascade="all, delete-orphan")


class Directory(Base):
    __tablename__ = "directories"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    country = Column(String, nullable=True, index=True)
    tier = Column(SAEnum(DirectoryTier), nullable=False, default=DirectoryTier.TIER_2, index=True)
    submission_method = Column(String, nullable=False, default="web_form")
    requires_verification = Column(Boolean, nullable=False, default=True)
    credibility_score = Column(Float, nullable=False, default=0.5)
    is_active = Column(Boolean, nullable=False, default=True)
    validation_notes = Column(Text, nullable=True)
    last_validation_status = Column(String, nullable=False, default="unknown")
    last_tested = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submissions = relationship("DirectorySubmission", back_populates="directory", cascade="all, delete-orphan")
    validation_runs = relationship("DirectoryValidationRun", back_populates="directory", cascade="all, delete-orphan")


class SubmissionRequest(Base):
    __tablename__ = "submission_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"), nullable=False, index=True)
    requested_count = Column(Integer, nullable=False)
    target_country = Column(String, nullable=True, index=True)
    status = Column(String, nullable=False, default=CampaignStatus.PENDING.value, index=True)
    progress_percentage = Column(Float, nullable=False, default=0.0)
    success_rate = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="submission_requests")
    business_profile = relationship("BusinessProfile", back_populates="submission_requests")
    submissions = relationship("DirectorySubmission", back_populates="submission_request", cascade="all, delete-orphan")


class DirectorySubmission(Base):
    __tablename__ = "directory_submissions"

    id = Column(Integer, primary_key=True, index=True)
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"), nullable=False, index=True)
    directory_id = Column(Integer, ForeignKey("directories.id"), nullable=False, index=True)
    submission_request_id = Column(Integer, ForeignKey("submission_requests.id"), nullable=False, index=True)
    status = Column(String, nullable=False, default=SubmissionStatus.PENDING.value, index=True)
    error_message = Column(Text, nullable=True)
    captcha_type = Column(String, nullable=True)
    screenshot_path = Column(String, nullable=True)
    captcha_confidence = Column(Float, nullable=True)
    submission_url = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    submitted_at = Column(DateTime, nullable=True, index=True)
    completed_at = Column(DateTime, nullable=True)
    retry_count = Column(Integer, nullable=False, default=0)

    business_profile = relationship("BusinessProfile", back_populates="submissions")
    directory = relationship("Directory", back_populates="submissions")
    submission_request = relationship("SubmissionRequest", back_populates="submissions")
    queue_item = relationship("SubmissionQueue", back_populates="directory_submission", uselist=False, cascade="all, delete-orphan")
    verification_emails = relationship("VerificationEmail", back_populates="directory_submission")
    manual_task = relationship("ManualSubmissionTask", back_populates="directory_submission", uselist=False, cascade="all, delete-orphan")
    temp_email_account = relationship("TempEmailAccount", back_populates="directory_submission", uselist=False, cascade="all, delete-orphan")
    attempt_logs = relationship("SubmissionAttemptLog", back_populates="directory_submission", cascade="all, delete-orphan")


class SubmissionQueue(Base):
    __tablename__ = "submission_queue"

    id = Column(Integer, primary_key=True, index=True)
    directory_submission_id = Column(Integer, ForeignKey("directory_submissions.id"), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    directory_submission = relationship("DirectorySubmission", back_populates="queue_item")


class ManualSubmissionTask(Base):
    __tablename__ = "manual_submission_tasks"

    id = Column(Integer, primary_key=True, index=True)
    directory_submission_id = Column(Integer, ForeignKey("directory_submissions.id"), nullable=False, unique=True, index=True)
    status = Column(String, nullable=False, default=ManualTaskStatus.PENDING.value, index=True)
    priority = Column(Integer, nullable=False, default=100, index=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    operator_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    directory_submission = relationship("DirectorySubmission", back_populates="manual_task")
    assigned_to_user = relationship("User", back_populates="manual_tasks")


class TempEmailAccount(Base):
    __tablename__ = "temp_email_accounts"

    id = Column(Integer, primary_key=True, index=True)
    directory_submission_id = Column(Integer, ForeignKey("directory_submissions.id"), nullable=False, unique=True, index=True)
    provider = Column(String, nullable=False, default="mail_tm")
    email_address = Column(String, nullable=False, unique=True, index=True)
    access_token = Column(Text, nullable=True)
    mailbox_password = Column(String, nullable=True)
    status = Column(String, nullable=False, default=TempEmailStatus.ACTIVE.value, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)

    directory_submission = relationship("DirectorySubmission", back_populates="temp_email_account")


class SubmissionAttemptLog(Base):
    __tablename__ = "submission_attempt_logs"

    id = Column(Integer, primary_key=True, index=True)
    directory_submission_id = Column(Integer, ForeignKey("directory_submissions.id"), nullable=False, index=True)
    attempt_number = Column(Integer, nullable=False, default=1)
    phase = Column(String, nullable=False)
    outcome = Column(String, nullable=False)
    error_message = Column(Text, nullable=True)
    http_status = Column(Integer, nullable=True)
    screenshot_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    directory_submission = relationship("DirectorySubmission", back_populates="attempt_logs")


class CitationAuditRun(Base):
    __tablename__ = "citation_audit_runs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    business_name = Column(String, nullable=False)
    website = Column(String, nullable=True)
    found_count = Column(Integer, nullable=False, default=0)
    missing_count = Column(Integer, nullable=False, default=0)
    inconsistency_count = Column(Integer, nullable=False, default=0)
    recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class DirectoryValidationRun(Base):
    __tablename__ = "directory_validation_runs"

    id = Column(Integer, primary_key=True, index=True)
    directory_id = Column(Integer, ForeignKey("directories.id"), nullable=False, index=True)
    status = Column(String, nullable=False, default="unknown")
    notes = Column(Text, nullable=True)
    http_status = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    directory = relationship("Directory", back_populates="validation_runs")


class VerificationEmail(Base):
    __tablename__ = "verification_emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    submission_request_id = Column(Integer, ForeignKey("submission_requests.id"), nullable=True, index=True)
    directory_submission_id = Column(Integer, ForeignKey("directory_submissions.id"), nullable=True, index=True)
    campaign_name = Column(String, nullable=False, default="Campaign")
    directory_name = Column(String, nullable=False, default="Directory")
    sender = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    received_time = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    status = Column(SAEnum(VerificationEmailStatus), nullable=False, default=VerificationEmailStatus.PENDING, index=True)
    verification_url = Column(String, nullable=True)
    body_preview = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    imap_uid = Column(String, nullable=True, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="verification_emails")
    directory_submission = relationship("DirectorySubmission", back_populates="verification_emails")
