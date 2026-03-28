from __future__ import annotations

import re
import secrets
from datetime import datetime, timedelta
from typing import Any

import requests
from sqlalchemy.orm import Session

from app.config import settings
from app.models.models import TempEmailAccount


class TempEmailService:
    """Mail.tm disposable inbox integration."""

    BASE_URL = "https://api.mail.tm"
    LINK_RE = re.compile(r"https?://[^\s<>'\"()]+", re.IGNORECASE)

    @staticmethod
    def _request(method: str, path: str, token: str | None = None, json_body: dict[str, Any] | None = None) -> dict[str, Any]:
        headers: dict[str, str] = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        response = requests.request(method, f"{TempEmailService.BASE_URL}{path}", headers=headers, json=json_body, timeout=20)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def create_account(db: Session | None = None, submission_id: int | None = None) -> dict[str, Any]:
        domains = TempEmailService._request("GET", "/domains")
        members = domains.get("hydra:member", [])
        if not members:
            raise RuntimeError("No temporary email domains available")

        domain = members[0]["domain"]
        local_part = f"citationpilot_{secrets.token_hex(5)}"
        address = f"{local_part}@{domain}"
        password = secrets.token_urlsafe(16)

        TempEmailService._request("POST", "/accounts", json_body={"address": address, "password": password})
        token_data = TempEmailService._request("POST", "/token", json_body={"address": address, "password": password})

        payload = {
            "email": address,
            "password": password,
            "token": token_data["token"],
            "provider": settings.TEMP_EMAIL_PROVIDER,
            "expires_in_hours": 2,
        }
        if db is not None and submission_id is not None:
            existing = db.query(TempEmailAccount).filter(TempEmailAccount.directory_submission_id == submission_id).first()
            if existing:
                existing.email_address = address
                existing.access_token = token_data["token"]
                existing.mailbox_password = password
                existing.status = "active"
                existing.expires_at = datetime.utcnow() + timedelta(hours=2)
                db.add(existing)
            else:
                db.add(
                    TempEmailAccount(
                        directory_submission_id=submission_id,
                        provider=settings.TEMP_EMAIL_PROVIDER,
                        email_address=address,
                        access_token=token_data["token"],
                        mailbox_password=password,
                        status="active",
                        expires_at=datetime.utcnow() + timedelta(hours=2),
                    )
                )
            db.commit()
        return payload

    @staticmethod
    def list_messages(token: str) -> list[dict[str, Any]]:
        payload = TempEmailService._request("GET", "/messages", token=token)
        return payload.get("hydra:member", [])

    @staticmethod
    def get_message(token: str, message_id: str) -> dict[str, Any]:
        return TempEmailService._request("GET", f"/messages/{message_id}", token=token)

    @staticmethod
    def extract_verification_links(html: str) -> list[str]:
        links = TempEmailService.LINK_RE.findall(html or "")
        # Preserve order while removing duplicates.
        deduped: list[str] = []
        seen: set[str] = set()
        for link in links:
            if link in seen:
                continue
            seen.add(link)
            deduped.append(link)
        return deduped

    @staticmethod
    def extract_verification_link(html: str) -> str | None:
        links = TempEmailService.extract_verification_links(html)
        for link in links:
            lowered = link.lower()
            if any(keyword in lowered for keyword in ("verify", "verification", "confirm", "activate")):
                return link
        return links[0] if links else None
