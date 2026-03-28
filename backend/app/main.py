"""Main FastAPI application."""
from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from collections import defaultdict, deque
from pathlib import Path
from threading import Lock

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import auth, audit, businesses, campaigns, contact, dashboard, directories, internal, manual_queue, profile, profiles, submissions, verification_inbox
from app.config import get_settings
from app.database import SessionLocal, init_db
from app.services.directory_service import DirectoryService
from app.workers.worker_manager import (
    ensure_email_poller_worker_running,
    ensure_email_polling_worker_running,
    ensure_submission_worker_running,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
_RATE_LIMIT_BUCKETS: dict[str, deque[float]] = defaultdict(deque)
_RATE_LIMIT_LOCK = Lock()

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized")
    db = SessionLocal()
    try:
        DirectoryService.ensure_directories_seeded(db)
    finally:
        db.close()

    if settings.ENABLE_BACKGROUND_WORKERS:
        ensure_submission_worker_running()
        ensure_email_poller_worker_running()
        ensure_email_polling_worker_running()
        logger.info("Background worker started")
    else:
        logger.info("Background workers disabled (ENABLE_BACKGROUND_WORKERS=false)")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CitationPilot local SEO citation automation SaaS",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # TEMP emergency CORS mode for debugging cross-origin failures.
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    if settings.RATE_LIMIT_ENABLED:
        ip = request.client.host if request.client else "unknown"
        key = f"{ip}:{request.url.path}"
        now = time.time()
        window = max(10, settings.RATE_LIMIT_WINDOW_SECONDS)
        if request.url.path.startswith("/api/v1/auth/"):
            allowed = max(1, settings.RATE_LIMIT_AUTH_MAX_REQUESTS)
        elif request.url.path.startswith("/api/v1/contact/"):
            allowed = max(1, settings.RATE_LIMIT_CONTACT_MAX_REQUESTS)
        else:
            allowed = max(1, settings.RATE_LIMIT_MAX_REQUESTS)

        with _RATE_LIMIT_LOCK:
            bucket = _RATE_LIMIT_BUCKETS[key]
            while bucket and (now - bucket[0]) > window:
                bucket.popleft()
            if len(bucket) >= allowed:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded"},
                )
            bucket.append(now)

    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    # Only log method + path + status. Keep tokens/passwords out of logs.
    logger.info("%s %s -> %s (%sms)", request.method, request.url.path, response.status_code, duration_ms)
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception for %s: %s", request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(profile.router)
app.include_router(businesses.router)
app.include_router(manual_queue.router)
app.include_router(submissions.router)
app.include_router(campaigns.router)
app.include_router(directories.router)
app.include_router(dashboard.router)
app.include_router(audit.router)
app.include_router(contact.router)
app.include_router(internal.router)
app.include_router(verification_inbox.router)


@app.get("/")
async def root():
    return {"message": "CitationPilot API", "version": "2.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
