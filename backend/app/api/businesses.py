from __future__ import annotations

from pathlib import Path
from typing import cast
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.models import User
from app.schemas.business import BusinessRequest, BusinessResponse, LogoUploadResponse
from app.schemas.schemas import BusinessProfileUpdate
from app.services.auth_service import get_current_active_user
from app.services.submission_service import BusinessProfileService

router = APIRouter(prefix="/api/v1/businesses", tags=["businesses"])
settings = get_settings()


@router.post("/", response_model=BusinessResponse)
@router.post("", response_model=BusinessResponse, include_in_schema=False)
def create_business(
    payload: BusinessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    profile = BusinessProfileService.create_profile(db, cast(int, current_user.id), payload)
    return BusinessResponse.model_validate(profile)


@router.get("/", response_model=list[BusinessResponse])
@router.get("", response_model=list[BusinessResponse], include_in_schema=False)
def list_businesses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    rows = BusinessProfileService.get_user_profiles(db, cast(int, current_user.id))
    return [BusinessResponse.model_validate(row) for row in rows]


@router.get("/{business_id}", response_model=BusinessResponse)
def get_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    row = BusinessProfileService.get_profile(db, business_id, cast(int, current_user.id))
    return BusinessResponse.model_validate(row)


@router.put("/{business_id}", response_model=BusinessResponse)
def update_business(
    business_id: int,
    payload: BusinessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    row = BusinessProfileService.update_profile(
        db,
        business_id,
        cast(int, current_user.id),
        BusinessProfileUpdate(**payload.model_dump()),
    )
    return BusinessResponse.model_validate(row)


@router.delete("/{business_id}")
def delete_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    BusinessProfileService.delete_profile(db, business_id, cast(int, current_user.id))
    return {"message": "Business deleted successfully"}


@router.post("/logo-upload", response_model=LogoUploadResponse)
def upload_business_logo(
    logo: UploadFile = File(...),
    _current_user: User = Depends(get_current_active_user),
):
    allowed_extensions = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
    extension = Path(logo.filename or "").suffix.lower()
    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid logo type. Allowed: PNG, JPG, JPEG, WEBP, SVG",
        )

    content = logo.file.read()
    max_bytes = max(1, settings.MAX_LOGO_UPLOAD_MB) * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Logo exceeds {settings.MAX_LOGO_UPLOAD_MB}MB limit",
        )

    backend_root = Path(__file__).resolve().parents[2]
    logos_dir = backend_root / settings.UPLOADS_DIR / settings.LOGO_UPLOAD_SUBDIR
    logos_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{uuid4().hex}{extension}"
    target_path = logos_dir / safe_name
    with target_path.open("wb") as handle:
        handle.write(content)

    relative_upload_root = settings.UPLOADS_DIR.strip("/").replace("\\", "/")
    logo_url = f"/{relative_upload_root}/{settings.LOGO_UPLOAD_SUBDIR}/{safe_name}"
    return LogoUploadResponse(logo_url=logo_url)
