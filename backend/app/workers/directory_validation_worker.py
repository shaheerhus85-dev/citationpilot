"""Internal directory validation worker."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

import requests

from app.database import SessionLocal
from app.models.models import Directory, DirectoryValidationRun

logger = logging.getLogger(__name__)


async def validate_directory(directory_id: int) -> None:
    """Run a lightweight health check for one directory."""
    db = SessionLocal()
    try:
        directory = db.query(Directory).filter(Directory.id == directory_id).first()
        if not directory:
            return

        status = "inactive"
        notes = ""
        http_status = None
        try:
            response = requests.get(directory.url, timeout=20, headers={"User-Agent": "CitationValidator/1.0"})
            http_status = response.status_code
            if response.ok and "submit" in response.text.lower():
                status = "healthy"
                directory.last_validation_status = "healthy"
                directory.last_tested = datetime.now(timezone.utc)
                directory.is_active = True
            elif response.ok:
                status = "review"
                directory.last_validation_status = "review"
                notes = "Page reachable but submit signal weak"
            else:
                status = "failed"
                directory.last_validation_status = "failed"
                directory.is_active = False
                notes = f"HTTP {response.status_code}"
        except Exception as exc:
            status = "failed"
            directory.last_validation_status = "failed"
            directory.is_active = False
            notes = str(exc)

        db.add(
            DirectoryValidationRun(
                directory_id=directory.id,
                status=status,
                notes=notes,
                http_status=http_status,
            )
        )
        db.add(directory)
        db.commit()
    finally:
        db.close()


async def run_quarterly_validation(limit: int = 100) -> dict[str, int]:
    """Validate a batch of directories."""
    db = SessionLocal()
    try:
        directory_ids = [item.id for item in db.query(Directory).order_by(Directory.last_tested.asc().nullsfirst()).limit(limit).all()]
    finally:
        db.close()

    for directory_id in directory_ids:
        await validate_directory(directory_id)
        await asyncio.sleep(1.0)

    return {"validated": len(directory_ids)}
