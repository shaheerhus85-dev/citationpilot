from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.models import DirectoryTier, SubmissionStatus, VerificationEmailStatus


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase, ORMModel):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactResponse(BaseModel):
    message: str
    delivered: bool = True


class BusinessProfileBase(BaseModel):
    business_name: str
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    category: str
    country: str
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None


class BusinessProfileCreate(BusinessProfileBase):
    pass


class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    category: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    is_primary: Optional[bool] = None


class BusinessProfileResponse(BusinessProfileBase, ORMModel):
    id: int
    user_id: int
    is_primary: bool
    created_at: datetime


class SubmissionRequestCreate(BaseModel):
    business_profile_id: int
    requested_count: int = Field(default=10, ge=10, le=50)
    target_country: Optional[str] = None


class SubmissionRequestResponse(ORMModel):
    id: int
    user_id: int
    business_profile_id: int
    requested_count: int
    target_country: Optional[str] = None
    status: str
    progress_percentage: float
    success_rate: float
    created_at: datetime
    completed_at: Optional[datetime] = None


class DirectorySubmissionResponse(ORMModel):
    id: int
    directory_id: int
    directory_url: Optional[str] = None
    directory_name: Optional[str] = None
    status: SubmissionStatus
    error_message: Optional[str] = None
    captcha_type: Optional[str] = None
    screenshot_path: Optional[str] = None
    captcha_confidence: Optional[float] = None
    submission_url: Optional[str] = None
    timestamp: datetime
    completed_at: Optional[datetime] = None
    retry_count: int


class DirectorySubmissionBulkResponse(BaseModel):
    total: int
    submitted: int
    pending: int
    failed: int
    manual_required: int
    completion_percentage: float
    submissions: list[DirectorySubmissionResponse]


class CitationProgress(BaseModel):
    submission_request_id: int
    campaign_status: str
    total_requested: int
    total: int
    submitted: int
    pending: int
    in_progress: int
    failed: int
    manual_required: int
    completed: int
    completion_percentage: float
    success_rate: float
    statuses: dict[str, int]


class DashboardStats(BaseModel):
    total_campaigns: int = 0
    total_submissions: int = 0
    success_count: int = 0
    pending_count: int = 0
    in_progress_count: int = 0
    failed_count: int = 0
    manual_required: int = 0
    business_profiles_count: int = 0
    success_rate: float = 0.0


class DashboardCampaignItem(BaseModel):
    id: int
    requested_count: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    business_name: Optional[str] = None
    status: str
    progress_percentage: float
    success_rate: float


class DashboardActivityItem(BaseModel):
    id: int
    directory_name: Optional[str] = None
    directory_url: Optional[str] = None
    status: str
    timestamp: datetime
    submitted_at: Optional[datetime] = None
    error_message: Optional[str] = None


class DashboardAttemptItem(BaseModel):
    id: int
    submission_id: int
    directory_name: Optional[str] = None
    status: str
    captcha_type: Optional[str] = None
    resolution_path: str
    retries: int
    outcome: str
    timestamp: datetime
    error_message: Optional[str] = None


class DashboardOverview(BaseModel):
    stats: DashboardStats
    recent_campaigns: list[DashboardCampaignItem]
    recent_activity: list[DashboardActivityItem]
    recent_attempts: list[DashboardAttemptItem] = []


class DirectoryResponse(ORMModel):
    id: int
    url: str
    name: str
    category: str
    country: Optional[str] = None
    tier: DirectoryTier
    submission_method: str
    requires_verification: bool
    credibility_score: float
    is_active: bool
    validation_notes: Optional[str] = None
    last_validation_status: str
    last_tested: Optional[datetime] = None
    created_at: datetime


class DirectoryAdminUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    country: Optional[str] = None
    tier: Optional[DirectoryTier] = None
    submission_method: Optional[str] = None
    requires_verification: Optional[bool] = None
    credibility_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    is_active: Optional[bool] = None
    validation_notes: Optional[str] = None
    last_validation_status: Optional[str] = None


class CitationAuditRequest(BaseModel):
    business_name: str
    website: Optional[str] = None
    category: Optional[str] = None
    country: Optional[str] = None


class CitationAuditResponse(BaseModel):
    business_name: str
    found_count: int
    missing_count: int
    inconsistency_count: int
    found_listings: list[str]
    missing_opportunities: list[str]
    inconsistencies: list[str]
    competitor_signals: list[str]
    recommendations: list[str]


class ForwardingAddressResponse(BaseModel):
    forwarding_address: str


class VerificationEmailResponse(ORMModel):
    id: int
    campaign_name: str
    directory_name: str
    sender: Optional[str] = None
    subject: str
    received_time: datetime
    status: VerificationEmailStatus
    verification_url: Optional[str] = None
    error_message: Optional[str] = None


class VerificationInboxResponse(BaseModel):
    items: list[VerificationEmailResponse]
    total: int


class CampaignSubmissionItem(BaseModel):
    id: int | None = None
    directory_name: Optional[str] = None
    directory_url: str
    status: str
    response_message: Optional[str] = None
    submitted_at: Optional[datetime] = None
    error: Optional[str] = None


class CampaignSubmissionStatusResponse(BaseModel):
    campaign_id: int
    total: int
    success: int
    pending: int
    failed: int
    manual_required: int
    submissions: list[CampaignSubmissionItem]


class ProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: Optional[datetime] = None


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)


class MessageResponse(BaseModel):
    message: str


class DashboardSnapshotResponse(BaseModel):
    total_campaigns: int
    total_submissions: int
    success: int
    pending: int
    in_progress: int
    failed: int
    manual_required: int
    latest_campaign: Optional[dict[str, Any]] = None


class CampaignDetailsResponse(BaseModel):
    campaign: dict[str, Any]
    stats: dict[str, int]
    submissions: list[CampaignSubmissionItem]
