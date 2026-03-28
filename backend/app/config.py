import os
from functools import lru_cache
from typing import List

from pydantic import EmailStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "CitationPilot API"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    EMAIL_VERIFICATION_EXPIRE_MINUTES: int = 60
    STRICT_ENV_VALIDATION: bool = False

    DATABASE_URL: str = "sqlite:///./app.db"
    DIRECTORIES_CSV_PATH: str = "data/directories.csv"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    GMAIL_USER: str | None = None
    GMAIL_APP_PASSWORD: str | None = None
    SENDGRID_API_KEY: str | None = None
    CONTACT_RECEIVER_EMAIL: EmailStr = "shaheerhus85@gmail.com"
    EMAIL_POLL_INTERVAL_SECONDS: int = 120
    EMAIL_MAX_FETCH_PER_CYCLE: int = 40

    TEMP_EMAIL_PROVIDER: str = "mail_tm"
    TEMP_EMAIL_TIMEOUT_SECONDS: int = 120
    TEMP_EMAIL_POLL_INTERVAL_SECONDS: int = 10

    PLAYWRIGHT_HEADLESS: bool = True
    PLAYWRIGHT_TIMEOUT_MS: int = 30000
    SUBMISSION_INTERVAL_SECONDS: int = 3
    ENABLE_BACKGROUND_WORKERS: bool = True
    WORKER_BATCH_SIZE: int = 5
    WORKER_INTERVAL_SECONDS: int = 60
    MANUAL_QUEUE_ENABLED: bool = True
    STORE_FAILURE_SCREENSHOTS: bool = True
    MAX_SUBMISSION_RETRIES: int = 3

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_MAX_REQUESTS: int = 120
    RATE_LIMIT_AUTH_MAX_REQUESTS: int = 30
    RATE_LIMIT_CONTACT_MAX_REQUESTS: int = 10

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @field_validator("DEBUG", mode="before")
    @classmethod
    def normalize_debug(cls, value: object) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            lowered = value.strip().lower()
            if lowered in {"1", "true", "yes", "on", "debug"}:
                return True
            if lowered in {"0", "false", "no", "off", "release", ""}:
                return False
        return False

    @field_validator(
        "ENABLE_BACKGROUND_WORKERS",
        "PLAYWRIGHT_HEADLESS",
        "MANUAL_QUEUE_ENABLED",
        "STORE_FAILURE_SCREENSHOTS",
        mode="before",
    )
    @classmethod
    def normalize_booleans(cls, value: object) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on"}
        return bool(value)

    @model_validator(mode="after")
    def validate_required_env(self) -> "Settings":
        if not self.JWT_SECRET or len(self.JWT_SECRET.strip()) < 16:
            raise ValueError("JWT_SECRET is required and must be at least 16 characters")

        if bool(self.GMAIL_USER) ^ bool(self.GMAIL_APP_PASSWORD):
            raise ValueError("Both GMAIL_USER and GMAIL_APP_PASSWORD must be set together")

        if self.STRICT_ENV_VALIDATION or self.ENVIRONMENT.lower() == "production":
            required = {
                "DATABASE_URL": self.DATABASE_URL,
                "FRONTEND_URL": self.FRONTEND_URL,
                "GMAIL_USER": self.GMAIL_USER,
                "GMAIL_APP_PASSWORD": self.GMAIL_APP_PASSWORD,
            }
            missing = [key for key, value in required.items() if not value]
            if missing:
                raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        return self

    @property
    def smtp_enabled(self) -> bool:
        return bool(self.GMAIL_USER and self.GMAIL_APP_PASSWORD)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
