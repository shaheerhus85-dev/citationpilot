from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from typing import Any

import requests

from app.config import settings

logger = logging.getLogger(__name__)


def _send_via_gmail(message: EmailMessage) -> None:
    if not settings.smtp_enabled:
        raise RuntimeError("Gmail SMTP is not configured")
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=5) as server:
            server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
            server.send_message(message)
            return
    except (smtplib.SMTPException, OSError):
        pass

    # Fallback path for environments where SSL handshake fails on 465.
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=8) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
            server.send_message(message)
            return
    except (smtplib.SMTPException, OSError) as exc:
        raise RuntimeError("Gmail email delivery failed") from exc


def _send_via_sendgrid(message: EmailMessage) -> None:
    if not settings.SENDGRID_API_KEY:
        raise RuntimeError("SendGrid API key is not configured")

    sender = settings.SENDGRID_FROM_EMAIL or settings.GMAIL_USER
    if not sender:
        raise RuntimeError("SENDGRID_FROM_EMAIL or GMAIL_USER is required for SendGrid")

    payload: dict[str, Any] = {
        "personalizations": [{"to": [{"email": str(message.get("To"))}]}],
        "from": {"email": sender},
        "subject": str(message.get("Subject") or ""),
        "content": [{"type": "text/plain", "value": message.get_body(preferencelist=("plain",)).get_content()}],
    }
    html_part = message.get_body(preferencelist=("html",))
    if html_part:
        payload["content"].append({"type": "text/html", "value": html_part.get_content()})

    response = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={
            "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=8,
    )
    if response.status_code >= 300:
        raise RuntimeError(f"SendGrid delivery failed: {response.status_code}")


def _send_via_brevo(message: EmailMessage) -> None:
    if not settings.brevo_enabled:
        raise RuntimeError("Brevo is not configured")

    sender_email = settings.BREVO_SENDER_EMAIL
    sender_name = settings.BREVO_SENDER_NAME or "CitationPilot"
    if not sender_email:
        raise RuntimeError("BREVO_SENDER_EMAIL is required")

    text_part = message.get_body(preferencelist=("plain",))
    html_part = message.get_body(preferencelist=("html",))

    payload: dict[str, Any] = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": str(message.get("To"))}],
        "subject": str(message.get("Subject") or ""),
        "textContent": text_part.get_content() if text_part else "",
    }
    if html_part:
        payload["htmlContent"] = html_part.get_content()

    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": str(settings.BREVO_API_KEY),
            "accept": "application/json",
            "content-type": "application/json",
        },
        json=payload,
        timeout=8,
    )
    if response.status_code >= 300:
        raise RuntimeError(f"Brevo delivery failed: {response.status_code} {response.text[:180]}")


def _send_message(message: EmailMessage) -> None:
    errors: list[str] = []
    try:
        _send_via_gmail(message)
        return
    except Exception as exc:
        logger.warning("Gmail delivery attempt failed: %s", exc)
        errors.append(str(exc))

    try:
        _send_via_brevo(message)
        return
    except Exception as exc:
        logger.warning("Brevo delivery attempt failed: %s", exc)
        errors.append(str(exc))

    try:
        _send_via_sendgrid(message)
        return
    except Exception as exc:
        logger.warning("SendGrid delivery attempt failed: %s", exc)
        errors.append(str(exc))

    raise RuntimeError(f"Email delivery failed via all configured providers: {' | '.join(errors)}")


def send_email_message(message: EmailMessage) -> None:
    """Public wrapper so other services can reuse provider fallback chain."""
    _send_message(message)


def send_verification_email(to_email: str, full_name: str, verification_url: str) -> None:
    message = EmailMessage()
    message["Subject"] = "Verify your CitationPilot account"
    message["From"] = (
        settings.GMAIL_USER
        or settings.BREVO_SENDER_EMAIL
        or settings.SENDGRID_FROM_EMAIL
        or "no-reply@citationpilot.app"
    )
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
    message["From"] = (
        settings.GMAIL_USER
        or settings.BREVO_SENDER_EMAIL
        or settings.SENDGRID_FROM_EMAIL
        or "no-reply@citationpilot.app"
    )
    message["To"] = to_email
    message.set_content(
        f"Campaign '{campaign_name}' is complete.\n\n"
        f"Submitted: {stats.get('submitted', 0)}\n"
        f"Failed: {stats.get('failed', 0)}\n"
        f"Manual required: {stats.get('manual_required', 0)}\n"
        f"Success rate: {stats.get('success_rate', 0)}%\n"
    )
    _send_message(message)
