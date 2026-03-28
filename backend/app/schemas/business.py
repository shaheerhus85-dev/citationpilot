from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class BusinessRequest(BaseModel):
    business_name: str
    email: EmailStr | None = None
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    country: str
    category: str
    website: str | None = None
    description: str | None = None
    postal_code: str | None = None


class BusinessResponse(BusinessRequest):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime | None = None
