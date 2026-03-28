"""Internal/admin directory management routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import DirectoryAdminUpdate, DirectoryResponse
from app.services.directory_service import DirectoryService
from app.workers.directory_validation_worker import run_quarterly_validation

router = APIRouter(prefix="/api/v1/internal", tags=["internal"])


@router.get("/directories", response_model=list[DirectoryResponse])
async def list_directories(
    db: Session = Depends(get_db),
):
    """Internal-only directory listing."""
    return DirectoryService.list_directories(db)


@router.patch("/directories/{directory_id}", response_model=DirectoryResponse)
async def update_directory(
    directory_id: int,
    payload: DirectoryAdminUpdate,
    db: Session = Depends(get_db),
):
    """Internal-only directory update."""
    return DirectoryService.update_directory(db, directory_id, payload)


@router.post("/directories/import")
async def import_directories(
    db: Session = Depends(get_db),
):
    """Import directories from the configured CSV source."""
    try:
        created = DirectoryService.load_directories_from_csv(db)
        return {"created": created}
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.post("/directories/quarterly-validate")
async def quarterly_validate(limit: int = 50):
    """Run internal validation batch."""
    return await run_quarterly_validation(limit=limit)
