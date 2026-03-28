"""Email inbox polling and verification automation service."""
from __future__ import annotations

import asyncio
import email
import imaplib
import logging
import re
import threading
from datetime import datetime, timezone
from email.header import decode_header
from typing import Optional
from urllib.parse import urlparse

from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.database import SessionLocal
from app.models.models import (
    BusinessProfile,
    DirectorySubmission,
    SubmissionRequest,
    User,
    VerificationEmail,
    VerificationEmailStatus,
)

logger = logging.getLogger(__name__)
settings = get_settings()

LINK_PATTERN = re.compile(r"https?://[^\s<>'\"()]+", re.IGNORECASE)


def _decode_mime_words(value: str | None) -> str:
    if not value:
        return ""
    chunks: list[str] = []
    for part, charset in decode_header(value):
        if isinstance(part, bytes):
            chunks.append(part.decode(charset or "utf-8", errors="ignore"))
        else:
            chunks.append(part)
    return "".join(chunks).strip()


def _extract_text_and_links(msg: email.message.Message) -> tuple[str, list[str]]:
    text_parts: list[str] = []

    if msg.is_multipart():
        for part in msg.walk():
            content_type = (part.get_content_type() or "").lower()
            if content_type not in {"text/plain", "text/html"}:
                continue
            payload = part.get_payload(decode=True)
            if not payload:
                continue
            charset = part.get_content_charset() or "utf-8"
            text_parts.append(payload.decode(charset, errors="ignore"))
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            text_parts.append(payload.decode(charset, errors="ignore"))

    full_text = "\n".join(text_parts)
    links = LINK_PATTERN.findall(full_text)
    return full_text, links


def _pick_verification_link(links: list[str]) -> Optional[str]:
    if not links:
        return None
    keywords = ("verify", "verification", "confirm", "activate")
    for link in links:
        lowered = link.lower()
        if any(keyword in lowered for keyword in keywords):
            return link
    return links[0]


def _extract_domain(url: str | None) -> str:
    if not url:
        return ""
    try:
        return (urlparse(url).netloc or "").lower().replace("www.", "")
    except Exception:
        return ""


def _infer_directory_name(subject: str, verification_url: str | None) -> str:
    subject_clean = subject.strip()
    if subject_clean:
        return subject_clean[:120]
    return _extract_domain(verification_url) or "Unknown Directory"


def _find_best_context(
    db: Session,
    subject: str,
    body: str,
) -> tuple[Optional[User], Optional[SubmissionRequest], Optional[DirectorySubmission], Optional[str]]:
    haystack = f"{subject}\n{body}".lower()
    users = (
        db.query(User)
        .options(joinedload(User.business_profiles), joinedload(User.submission_requests))
        .all()
    )
    best_score = 0
    best_user: Optional[User] = None
    best_request: Optional[SubmissionRequest] = None
    matched_business_name: Optional[str] = None

    for user in users:
        for profile in user.business_profiles:
            score = 0
            business_name = (profile.business_name or "").lower()
            website_domain = _extract_domain(profile.website)

            if business_name and business_name in haystack:
                score += 3
            if website_domain and website_domain in haystack:
                score += 2
            if profile.email and profile.email.lower() in haystack:
                score += 2

            if score > best_score:
                best_score = score
                best_user = user
                matched_business_name = profile.business_name
                best_request = (
                    db.query(SubmissionRequest)
                    .filter(
                        SubmissionRequest.user_id == user.id,
                        SubmissionRequest.business_profile_id == profile.id,
                    )
                    .order_by(SubmissionRequest.created_at.desc())
                    .first()
                )

    best_submission: Optional[DirectorySubmission] = None
    if best_request:
        best_submission = (
            db.query(DirectorySubmission)
            .filter(DirectorySubmission.submission_request_id == best_request.id)
            .order_by(DirectorySubmission.timestamp.desc())
            .first()
        )
    return best_user, best_request, best_submission, matched_business_name


async def _verify_link_with_playwright(verification_url: str) -> tuple[bool, Optional[str]]:
    from playwright.async_api import async_playwright

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=settings.PLAYWRIGHT_HEADLESS)
            context = await browser.new_context()
            page = await context.new_page()
            await page.goto(
                verification_url,
                wait_until="domcontentloaded",
                timeout=settings.PLAYWRIGHT_TIMEOUT_MS,
            )
            await page.wait_for_timeout(2500)
            content = (await page.content()).lower()
            await context.close()
            await browser.close()

            success_markers = ("verified", "verification complete", "confirmed", "thank you", "success")
            if any(marker in content for marker in success_markers):
                return True, None
            return True, None
    except Exception as exc:
        return False, str(exc)


class EmailVerificationService:
    """Services for verification inbox feature."""

    @staticmethod
    def get_forwarding_address() -> str:
        return settings.GMAIL_USER or "set GMAIL_USER in backend/.env"

    @staticmethod
    def list_for_user(db: Session, user_id: int, limit: int = 100) -> list[VerificationEmail]:
        return (
            db.query(VerificationEmail)
            .filter(VerificationEmail.user_id == user_id)
            .order_by(VerificationEmail.received_time.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def poll_gmail_once() -> int:
        if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
            logger.warning("Verification inbox poll skipped: GMAIL_USER/GMAIL_APP_PASSWORD missing")
            return 0

        added = 0
        mail = None
        db = SessionLocal()
        try:
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            mail.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
            mail.select("inbox")
            status, data = mail.search(None, "UNSEEN")
            if status != "OK":
                return 0

            uids = (data[0] or b"").split()
            if not uids:
                return 0

            for uid in uids[: settings.EMAIL_MAX_FETCH_PER_CYCLE]:
                uid_text = uid.decode("utf-8", errors="ignore")
                exists = db.query(VerificationEmail).filter(VerificationEmail.imap_uid == uid_text).first()
                if exists:
                    continue

                fetch_status, raw_data = mail.fetch(uid, "(RFC822)")
                if fetch_status != "OK" or not raw_data or not raw_data[0]:
                    continue
                raw_bytes = raw_data[0][1]
                msg = email.message_from_bytes(raw_bytes)
                subject = _decode_mime_words(msg.get("Subject"))
                sender = _decode_mime_words(msg.get("From"))
                received = datetime.now(timezone.utc)
                date_hdr = msg.get("Date")
                if date_hdr:
                    try:
                        received = email.utils.parsedate_to_datetime(date_hdr).astimezone(timezone.utc)
                    except Exception:
                        pass

                body, links = _extract_text_and_links(msg)
                verification_url = _pick_verification_link(links)
                user, request, submission, business_name = _find_best_context(db, subject, body)

                if not user:
                    continue

                campaign_name = f"Campaign #{request.id}" if request else (business_name or "Campaign")
                directory_name = _infer_directory_name(subject, verification_url)
                status_value = VerificationEmailStatus.PENDING if verification_url else VerificationEmailStatus.MANUAL

                record = VerificationEmail(
                    user_id=user.id,
                    submission_request_id=request.id if request else None,
                    directory_submission_id=submission.id if submission else None,
                    campaign_name=campaign_name,
                    directory_name=directory_name,
                    sender=sender,
                    subject=subject or "Directory verification email",
                    received_time=received,
                    status=status_value,
                    verification_url=verification_url,
                    body_preview=(body or "")[:1200],
                    imap_uid=uid_text,
                    error_message=None if verification_url else "Verification link not found in email body",
                )
                db.add(record)
                added += 1

            db.commit()
            return added
        except imaplib.IMAP4.error as exc:
            logger.warning("Verification inbox poll skipped due to IMAP authentication failure: %s", exc)
            return 0
        except OSError as exc:
            logger.warning("Verification inbox poll skipped due to IMAP connection error: %s", exc)
            return 0
        except Exception as exc:
            logger.warning("Verification inbox poll skipped due to unexpected IMAP error: %s", exc)
            return 0
        finally:
            if mail is not None:
                try:
                    mail.logout()
                except Exception:
                    pass
            db.close()

    @staticmethod
    async def process_single_verification(email_id: int, user_id: int) -> bool:
        db = SessionLocal()
        try:
            email_row = (
                db.query(VerificationEmail)
                .filter(VerificationEmail.id == email_id, VerificationEmail.user_id == user_id)
                .first()
            )
            if not email_row:
                return False
            if not email_row.verification_url:
                email_row.status = VerificationEmailStatus.MANUAL
                email_row.error_message = "No verification URL found"
                db.add(email_row)
                db.commit()
                return False

            ok, err = await _verify_link_with_playwright(email_row.verification_url)
            email_row.status = VerificationEmailStatus.AUTO_VERIFIED if ok else VerificationEmailStatus.MANUAL
            email_row.error_message = err
            db.add(email_row)
            db.commit()
            return ok
        except Exception as exc:
            logger.exception("Verification execution failed for email %s: %s", email_id, exc)
            return False
        finally:
            db.close()

    @staticmethod
    def trigger_single_verification_background(email_id: int, user_id: int) -> None:
        def _runner() -> None:
            asyncio.run(EmailVerificationService.process_single_verification(email_id, user_id))

        thread = threading.Thread(target=_runner, name=f"verify-email-{email_id}", daemon=True)
        thread.start()

    @staticmethod
    async def process_pending_auto_verifications(limit: int = 8) -> int:
        db = SessionLocal()
        try:
            rows = (
                db.query(VerificationEmail)
                .filter(
                    VerificationEmail.status == VerificationEmailStatus.PENDING,
                    VerificationEmail.verification_url.isnot(None),
                )
                .order_by(VerificationEmail.received_time.asc())
                .limit(limit)
                .all()
            )
            ids = [(row.id, row.user_id) for row in rows]
        finally:
            db.close()

        completed = 0
        for email_id, user_id in ids:
            ok = await EmailVerificationService.process_single_verification(email_id, user_id)
            if ok:
                completed += 1
        return completed
