from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)


def _send_message(message: EmailMessage) -> None:
    if not settings.smtp_enabled:
        raise RuntimeError("Email service is not configured")
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=5) as server:
            server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
            server.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        logger.exception("Email delivery failed: %s", exc)
        raise RuntimeError("Email delivery failed") from exc


def send_verification_email(to_email: str, full_name: str, verification_url: str) -> None:
    message = EmailMessage()
    message["Subject"] = "Verify your CitationPilot account"
    message["From"] = settings.GMAIL_USER
    message["To"] = to_email
    message.set_content(
        f"Hi {full_name},\n\nVerify your account using this link:\n{verification_url}\n\n"
        f"This link expires in {settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutes."
    )
    message.add_alternative(
        f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #0f172a;">
            <h2>Verify your CitationPilot account</h2>
            <p>Hi {full_name},</p>
            <p>Click the button below to verify your email address and activate your account.</p>
            <p><a href="{verification_url}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:9999px;">Verify Email</a></p>
            <p>If the button doesn't work, open this URL:</p>
            <p>{verification_url}</p>
          </body>
        </html>
        """,
        subtype="html",
    )
    _send_message(message)


def send_campaign_complete(to_email: str, campaign_name: str, stats: dict[str, object]) -> None:
    message = EmailMessage()
    message["Subject"] = f"Campaign complete: {campaign_name}"
    message["From"] = settings.GMAIL_USER
    message["To"] = to_email
    message.set_content(
        f"Campaign '{campaign_name}' is complete.\n\n"
        f"Submitted: {stats.get('submitted', 0)}\n"
        f"Failed: {stats.get('failed', 0)}\n"
        f"Manual required: {stats.get('manual_required', 0)}\n"
        f"Success rate: {stats.get('success_rate', 0)}%\n"
    )
    _send_message(message)
