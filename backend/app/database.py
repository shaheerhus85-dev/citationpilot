"""Database setup and session management."""
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from .config import get_settings

settings = get_settings()

raw_database_url = settings.DATABASE_URL
if raw_database_url.startswith("postgresql://"):
    raw_database_url = raw_database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

if raw_database_url.startswith("postgresql+psycopg2://") and "sslmode=" not in raw_database_url:
    separator = "&" if "?" in raw_database_url else "?"
    raw_database_url = f"{raw_database_url}{separator}sslmode=require"

is_sqlite = raw_database_url.startswith("sqlite")

engine_kwargs = {
    "echo": settings.DEBUG,
    "pool_pre_ping": True,
}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(raw_database_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Session:
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database by creating all tables and applying safe migrations."""
    Base.metadata.create_all(bind=engine)
    if is_sqlite:
        _apply_sqlite_safe_migrations()
    else:
        _apply_postgres_safe_migrations()
    Base.metadata.create_all(bind=engine)


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def _ensure_column(table_name: str, column_name: str, column_sql: str) -> None:
    inspector = inspect(engine)
    if not _has_column(inspector, table_name, column_name):
        with engine.begin() as connection:
            connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_sql}"))


def _ensure_index(index_name: str, create_sql: str) -> None:
    inspector = inspect(engine)
    if index_name not in {item["name"] for item in inspector.get_indexes(create_sql.split(" ON ")[1].split("(")[0])}:
        with engine.begin() as connection:
            connection.execute(text(create_sql))


def _apply_sqlite_safe_migrations() -> None:
    inspector = inspect(engine)

    if "users" in inspector.get_table_names():
        _ensure_column("users", "is_verified", "BOOLEAN DEFAULT 0")
        _ensure_column("users", "verification_token", "VARCHAR")
        _ensure_column("users", "verification_sent_at", "DATETIME")
        _ensure_column("users", "verification_expires_at", "DATETIME")
        _ensure_column("users", "last_login_at", "DATETIME")
        _ensure_column("users", "updated_at", "DATETIME")

    if "business_profiles" in inspector.get_table_names():
        _ensure_column("business_profiles", "address_line1", "VARCHAR")
        _ensure_column("business_profiles", "address_line2", "VARCHAR")
        _ensure_column("business_profiles", "postal_code", "VARCHAR")
        _ensure_column("business_profiles", "updated_at", "DATETIME")

    if "directories" in inspector.get_table_names():
        _ensure_column("directories", "tier", "VARCHAR DEFAULT 'tier_2'")
        _ensure_column("directories", "validation_notes", "TEXT")
        _ensure_column("directories", "last_validation_status", "VARCHAR DEFAULT 'unknown'")

    if "directory_submissions" in inspector.get_table_names():
        _ensure_column("directory_submissions", "screenshot_path", "VARCHAR")
        _ensure_column("directory_submissions", "captcha_confidence", "FLOAT")
        _ensure_column("directory_submissions", "submitted_at", "DATETIME")
        with engine.begin() as connection:
            connection.execute(
                text(
                    "UPDATE directory_submissions SET status = 'manual_required' WHERE status = 'MANUAL_REQUIRED'"
                )
            )

    if "submission_requests" in inspector.get_table_names():
        _ensure_column("submission_requests", "status", "VARCHAR DEFAULT 'pending'")
        _ensure_column("submission_requests", "progress_percentage", "FLOAT DEFAULT 0")
        _ensure_column("submission_requests", "success_rate", "FLOAT DEFAULT 0")
        _ensure_column("submission_requests", "updated_at", "DATETIME")

        with engine.begin() as connection:
            connection.execute(text("UPDATE submission_requests SET status = COALESCE(status, 'pending')"))
            connection.execute(text("UPDATE submission_requests SET progress_percentage = COALESCE(progress_percentage, 0)"))
            connection.execute(text("UPDATE submission_requests SET success_rate = COALESCE(success_rate, 0)"))
            connection.execute(
                text("UPDATE submission_requests SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)")
            )

    Base.metadata.create_all(bind=engine)


def _apply_postgres_safe_migrations() -> None:
    """Apply minimal non-destructive migrations required for auth on PostgreSQL."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    # Required for signup/login verification flow.
    _ensure_column("users", "is_verified", "BOOLEAN DEFAULT FALSE")
    _ensure_column("users", "verification_token", "VARCHAR(255)")
    _ensure_column("users", "verification_sent_at", "TIMESTAMP")
    _ensure_column("users", "verification_expires_at", "TIMESTAMP")
    _ensure_column("users", "last_login_at", "TIMESTAMP")
    _ensure_column("users", "updated_at", "TIMESTAMP")
