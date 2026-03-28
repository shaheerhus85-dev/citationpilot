"""Intelligent directory selection engine for campaign planning."""
from __future__ import annotations

from dataclasses import dataclass
from difflib import SequenceMatcher
from statistics import mean
from typing import Any, cast

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import BusinessProfile, Directory, DirectorySubmission, DirectoryTier, SubmissionStatus


@dataclass
class DirectoryMetrics:
    success_rate: float
    captcha_probability: float
    avg_completion_minutes: float


class IntelligentDirectorySelectionService:
    """Select top-performing directories based on niche, country, and historical outcomes."""

    DEFAULT_SUCCESS_RATE_BY_TIER = {
        DirectoryTier.TIER_1: 0.65,
        DirectoryTier.TIER_2: 0.55,
        DirectoryTier.TIER_3: 0.45,
    }
    DEFAULT_CAPTCHA_PROBABILITY_BY_TIER = {
        DirectoryTier.TIER_1: 0.35,
        DirectoryTier.TIER_2: 0.2,
        DirectoryTier.TIER_3: 0.1,
    }
    DEFAULT_COMPLETION_MINUTES_BY_TIER = {
        DirectoryTier.TIER_1: 9.0,
        DirectoryTier.TIER_2: 7.0,
        DirectoryTier.TIER_3: 6.0,
    }
    TIER_WEIGHT = {
        DirectoryTier.TIER_1: 1.0,
        DirectoryTier.TIER_2: 0.7,
        DirectoryTier.TIER_3: 0.4,
    }
    TIER_ORDER = {
        DirectoryTier.TIER_1: 0,
        DirectoryTier.TIER_2: 1,
        DirectoryTier.TIER_3: 2,
    }

    @staticmethod
    def select_for_business(
        db: Session,
        business_id: int,
        limit: int = 50,
        category_override: str | None = None,
        country_override: str | None = None,
        user_id: int | None = None,
    ) -> dict[str, Any]:
        business = cast(BusinessProfile | None, db.query(BusinessProfile).filter(BusinessProfile.id == business_id).first())
        if not business:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
        if user_id is not None and business.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")

        category = (category_override or business.category or "").strip()
        country = (country_override or business.country or "").strip()
        return IntelligentDirectorySelectionService._select(
            db=db,
            category=category,
            country=country,
            business_id=business_id,
            limit=limit,
        )

    @staticmethod
    def _select(
        db: Session,
        category: str,
        country: str,
        business_id: int,
        limit: int,
    ) -> dict[str, Any]:
        max_count = max(1, min(limit, 50))
        category_lower = category.lower()
        country_lower = country.lower()

        all_dirs = cast(list[Directory], db.query(Directory).filter(Directory.is_active == True).all())
        if not all_dirs:
            return {
                "business_id": business_id,
                "criteria": {"category": category, "country": country, "limit": max_count},
                "used_fallback_category": False,
                "directories": [],
                "estimated_success_rate": 0.0,
                "estimated_completion_time_minutes": 0,
            }

        category_matches = [row for row in all_dirs if category_lower and category_lower in (row.category or "").lower()]
        country_matches = [row for row in all_dirs if country_lower and country_lower in (row.country or "").lower()]
        exact = [row for row in category_matches if not country_lower or country_lower in (row.country or "").lower()]

        used_fallback = False
        filtered: list[Directory]
        if exact:
            filtered = exact
        else:
            used_fallback = True
            filtered = IntelligentDirectorySelectionService._fallback_category_matches(
                all_dirs=all_dirs,
                category=category_lower,
                country=country_lower,
            )
            if not filtered:
                filtered = country_matches or category_matches or all_dirs

        metrics_by_directory = IntelligentDirectorySelectionService._build_metrics(db, filtered)

        recommendations: list[dict[str, Any]] = []
        for directory in filtered:
            metrics = metrics_by_directory[directory.id]
            normalized_success_rate = IntelligentDirectorySelectionService._normalize_ratio(metrics.success_rate)
            normalized_captcha_probability = IntelligentDirectorySelectionService._normalize_ratio(metrics.captcha_probability)
            tier_weight = IntelligentDirectorySelectionService.TIER_WEIGHT.get(directory.tier, 0.4)
            score = (
                (normalized_success_rate * 0.5)
                + ((1 - normalized_captcha_probability) * 0.3)
                + (tier_weight * 0.2)
            )
            estimated_time = metrics.avg_completion_minutes * (1 + normalized_captcha_probability)
            recommendations.append(
                {
                    "id": directory.id,
                    "name": directory.name,
                    "url": directory.url,
                    "category": directory.category,
                    "country": directory.country,
                    "tier": getattr(directory.tier, "value", str(directory.tier)),
                    "score": round(score, 4),
                    "success_rate": round(normalized_success_rate, 4),
                    "captcha_probability": round(normalized_captcha_probability, 4),
                    "estimated_completion_minutes": round(estimated_time, 1),
                }
            )

        recommendations.sort(
            key=lambda item: (
                -item["score"],
                -item["success_rate"],
                item["captcha_probability"],
                IntelligentDirectorySelectionService.TIER_ORDER.get(DirectoryTier(item["tier"]), 9),
                item["name"].lower(),
            )
        )
        selected = recommendations[:max_count]

        estimated_success_rate = round(mean([item["success_rate"] for item in selected]), 4) if selected else 0.0
        estimated_completion_minutes = int(round(sum(item["estimated_completion_minutes"] for item in selected)))

        return {
            "business_id": business_id,
            "criteria": {"category": category, "country": country, "limit": max_count},
            "used_fallback_category": used_fallback,
            "fallback_reason": "No exact category match found" if used_fallback else None,
            "directories": selected,
            "estimated_success_rate": estimated_success_rate,
            "estimated_completion_time_minutes": estimated_completion_minutes,
        }

    @staticmethod
    def _fallback_category_matches(all_dirs: list[Directory], category: str, country: str) -> list[Directory]:
        categories = sorted({(row.category or "").strip() for row in all_dirs if row.category})
        if not categories:
            return []

        ranked = sorted(
            categories,
            key=lambda item: SequenceMatcher(None, category, item.lower()).ratio(),
            reverse=True,
        )
        top_categories = {item for item in ranked[:3]}
        fallback = [row for row in all_dirs if (row.category or "").strip() in top_categories]
        if country:
            localized = [row for row in fallback if country in (row.country or "").lower()]
            if localized:
                return localized
        return fallback

    @staticmethod
    def _build_metrics(db: Session, directories: list[Directory]) -> dict[int, DirectoryMetrics]:
        ids = [item.id for item in directories]
        submissions = cast(
            list[DirectorySubmission],
            db.query(DirectorySubmission).filter(DirectorySubmission.directory_id.in_(ids)).all(),
        )

        grouped: dict[int, list[DirectorySubmission]] = {directory.id: [] for directory in directories}
        for submission in submissions:
            grouped.setdefault(submission.directory_id, []).append(submission)

        metrics: dict[int, DirectoryMetrics] = {}
        for directory in directories:
            rows = grouped.get(directory.id, [])
            if not rows:
                metrics[directory.id] = DirectoryMetrics(
                    success_rate=IntelligentDirectorySelectionService.DEFAULT_SUCCESS_RATE_BY_TIER.get(directory.tier, 0.45),
                    captcha_probability=IntelligentDirectorySelectionService.DEFAULT_CAPTCHA_PROBABILITY_BY_TIER.get(directory.tier, 0.1),
                    avg_completion_minutes=IntelligentDirectorySelectionService.DEFAULT_COMPLETION_MINUTES_BY_TIER.get(directory.tier, 7.0),
                )
                continue

            total = len(rows)
            success = 0
            captcha_hits = 0
            durations: list[float] = []
            for row in rows:
                status_value = (row.status or "").lower()
                if status_value in {SubmissionStatus.SUBMITTED.value, SubmissionStatus.COMPLETED.value}:
                    success += 1
                if status_value == SubmissionStatus.MANUAL_REQUIRED.value or row.captcha_type:
                    captcha_hits += 1
                if row.timestamp and row.completed_at and row.completed_at >= row.timestamp:
                    durations.append((row.completed_at - row.timestamp).total_seconds() / 60)

            success_rate = success / total
            captcha_probability = captcha_hits / total
            avg_completion = mean(durations) if durations else IntelligentDirectorySelectionService.DEFAULT_COMPLETION_MINUTES_BY_TIER.get(directory.tier, 7.0)

            metrics[directory.id] = DirectoryMetrics(
                success_rate=max(0.0, min(1.0, success_rate)),
                captcha_probability=max(0.0, min(1.0, captcha_probability)),
                avg_completion_minutes=max(1.0, avg_completion),
            )

        return metrics

    @staticmethod
    def _normalize_ratio(value: float) -> float:
        """Normalize metric values to a 0..1 ratio."""
        if value > 1:
            value = value / 100
        return max(0.0, min(1.0, value))
