"""Directory source and campaign matching service."""
from __future__ import annotations

import csv
from pathlib import Path
from typing import cast

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.models import BusinessProfile, Directory, DirectoryTier
from app.schemas.schemas import DirectoryAdminUpdate


class DirectoryService:
    """Manage citation directories backed by the CSV source of truth."""

    TIER_ORDER = {
        DirectoryTier.TIER_1: 0,
        DirectoryTier.TIER_2: 1,
        DirectoryTier.TIER_3: 2,
    }

    @staticmethod
    def _resolve_csv_path() -> Path:
        configured = Path(get_settings().DIRECTORIES_CSV_PATH)
        if configured.is_absolute():
            return configured
        return (Path(__file__).resolve().parents[2] / configured).resolve()

    @staticmethod
    def _parse_tier(raw_value: str | None) -> DirectoryTier:
        normalized = (raw_value or "2").strip().lower().replace("tier_", "").replace("tier ", "").replace("tier", "")
        if normalized == "1":
            return DirectoryTier.TIER_1
        if normalized == "3":
            return DirectoryTier.TIER_3
        return DirectoryTier.TIER_2

    @staticmethod
    def load_directories_from_csv(db: Session) -> int:
        csv_path = DirectoryService._resolve_csv_path()
        if not csv_path.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Directories CSV not found at {csv_path}",
            )

        touched = 0
        existing_by_url = {item.url: item for item in db.query(Directory).all()}
        with csv_path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                name = (row.get("name") or "").strip()
                url = (row.get("url") or "").strip()
                if not name or not url:
                    continue

                category = (row.get("category") or "General").strip()
                country = (row.get("country") or "Global").strip()
                tier = DirectoryService._parse_tier(row.get("tier"))
                credibility = 0.95 if tier == DirectoryTier.TIER_1 else 0.8 if tier == DirectoryTier.TIER_2 else 0.65

                existing = existing_by_url.get(url)
                if existing:
                    existing.name = name
                    existing.category = category
                    existing.country = country
                    existing.tier = tier
                    existing.credibility_score = credibility
                    existing.is_active = True
                    existing.last_validation_status = existing.last_validation_status or "seeded"
                    db.add(existing)
                    touched += 1
                    continue

                db.add(
                    Directory(
                        name=name,
                        url=url,
                        category=category,
                        country=country,
                        tier=tier,
                        submission_method="web_form",
                        requires_verification=True,
                        credibility_score=credibility,
                        is_active=True,
                        last_validation_status="seeded",
                    )
                )
                db.flush()
                existing_by_url[url] = db.query(Directory).filter(Directory.url == url).first()
                touched += 1

        db.commit()
        return touched

    @staticmethod
    def ensure_directories_seeded(db: Session) -> int:
        DirectoryService.load_directories_from_csv(db)
        return db.query(Directory).filter(Directory.is_active == True).count()

    @staticmethod
    def list_directories(db: Session, limit: int = 250) -> list[Directory]:
        rows = (
            db.query(Directory)
            .filter(Directory.is_active == True)
            .order_by(Directory.tier.asc(), Directory.name.asc())
            .limit(limit)
            .all()
        )
        return cast(list[Directory], rows)

    @staticmethod
    def update_directory(db: Session, directory_id: int, payload: DirectoryAdminUpdate) -> Directory:
        directory = db.query(Directory).filter(Directory.id == directory_id).first()
        if not directory:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Directory not found")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(directory, field, value)
        db.add(directory)
        db.commit()
        db.refresh(directory)
        return directory

    @staticmethod
    def get_directories_for_campaign(
        db: Session,
        business_category: str,
        count: int,
        target_country: str | None = None,
    ) -> list[Directory]:
        DirectoryService.ensure_directories_seeded(db)
        requested = max(1, count)
        category_query = (business_category or "").strip().lower()
        country_query = (target_country or "").strip().lower()
        active_directories = cast(list[Directory], db.query(Directory).filter(Directory.is_active == True).all())

        def ordered(items: list[Directory]) -> list[Directory]:
            return sorted(
                items,
                key=lambda item: (
                    DirectoryService.TIER_ORDER.get(item.tier, 99),
                    item.name.lower(),
                ),
            )

        category_matches = [
            directory
            for directory in active_directories
            if category_query and category_query in (directory.category or "").lower()
        ]
        country_matches = [
            directory
            for directory in active_directories
            if country_query
            and (
                country_query in (directory.country or "").lower()
                or (directory.country or "").strip().lower() in {"global", "all"}
            )
        ]
        general_matches = [
            directory
            for directory in active_directories
            if (directory.category or "").strip().lower() == "general"
        ]
        category_country_matches = [
            directory
            for directory in category_matches
            if not country_query
            or country_query in (directory.country or "").lower()
            or (directory.country or "").strip().lower() in {"global", "all"}
        ]

        selected: list[Directory] = []
        seen: set[int] = set()
        for bucket in (
            ordered(category_country_matches),
            ordered(country_matches),
            ordered(category_matches),
            ordered(general_matches),
            ordered(active_directories),
        ):
            for directory in bucket:
                if directory.id in seen:
                    continue
                selected.append(directory)
                seen.add(directory.id)
                if len(selected) >= requested:
                    return selected
        return selected

    @staticmethod
    def get_directories_for_profile(
        db: Session,
        profile: BusinessProfile,
        count: int,
        target_country: str | None = None,
    ) -> list[Directory]:
        return DirectoryService.get_directories_for_campaign(
            db,
            profile.category,
            count,
            target_country=target_country or profile.country,
        )
