from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import ContactCreate, ContactResponse
from app.services.contact_service import create_contact_message, send_contact_email


router = APIRouter(prefix="/api/v1/contact", tags=["contact"])


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_200_OK)
def submit_contact_form(payload: ContactCreate, db: Session = Depends(get_db)):
    create_contact_message(db, payload)
    try:
        send_contact_email(payload)
    except RuntimeError as exc:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"error": "Email delivery failed"})
    return ContactResponse(message="Email sent successfully", delivered=True)
