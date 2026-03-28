import logging
import smtplib
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.config import settings
from app.models.models import ContactMessage
from app.schemas.schemas import ContactCreate

logger = logging.getLogger(__name__)


def create_contact_message(db: Session, payload: ContactCreate) -> ContactMessage:
    record = ContactMessage(
        name=payload.name,
        email=str(payload.email),
        subject=payload.subject,
        message=payload.message,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def send_contact_email(payload: ContactCreate) -> None:
    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        raise RuntimeError("Email service is not configured")

    message = EmailMessage()
    message["Subject"] = f"[Contact] {payload.subject}"
    message["From"] = settings.GMAIL_USER
    message["To"] = "shaheerhus85@gmail.com"
    message["Reply-To"] = payload.email
    message.set_content(
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Subject: {payload.subject}\n\n"
        f"Message:\n{payload.message}"
    )

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30) as server:
            server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
            server.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        logger.exception("Contact email delivery failed: %s", exc)
        raise RuntimeError("Email delivery failed") from exc
