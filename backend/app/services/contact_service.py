import logging
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.config import settings
from app.models.models import ContactMessage
from app.schemas.schemas import ContactCreate
from app.services.email_service import send_email_message

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
    if not settings.email_delivery_enabled:
        raise RuntimeError("Email service is not configured")

    message = EmailMessage()
    message["Subject"] = f"[Contact] {payload.subject}"
    message["From"] = (
        settings.GMAIL_USER
        or settings.BREVO_SENDER_EMAIL
        or settings.SENDGRID_FROM_EMAIL
        or "no-reply@citationpilot.app"
    )
    message["To"] = str(settings.CONTACT_RECEIVER_EMAIL)
    message["Reply-To"] = payload.email
    message.set_content(
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Subject: {payload.subject}\n\n"
        f"Message:\n{payload.message}"
    )

    try:
        send_email_message(message)
    except Exception as exc:
        logger.exception("Contact email delivery failed: %s", exc)
        raise RuntimeError("Email delivery failed") from exc
