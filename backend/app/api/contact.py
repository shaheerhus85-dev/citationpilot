from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import ContactCreate
from app.services.contact_service import create_contact_message, send_contact_email


router = APIRouter(prefix="/api/v1", tags=["contact"])


@router.post("/contact", status_code=status.HTTP_200_OK)
@router.post("/contact/", status_code=status.HTTP_200_OK)
def submit_contact_form(payload: ContactCreate, db: Session = Depends(get_db)):
    create_contact_message(db, payload)
    try:
        send_contact_email(payload)
    except RuntimeError:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": "Email delivery failed"},
        )
    return {"success": True}
