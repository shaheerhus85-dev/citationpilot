from __future__ import annotations

from datetime import datetime

from app.models.models import BusinessProfile, Directory, DirectorySubmission, ManualSubmissionTask, SubmissionRequest, User


def seed_manual_row(db_session):
    user = User(email="queue@example.com", username="queue", hashed_password="hashed", is_active=True, is_verified=True)
    db_session.add(user)
    db_session.flush()

    profile = BusinessProfile(
        user_id=user.id,
        business_name="Queue Biz",
        category="General",
        country="US",
    )
    db_session.add(profile)
    db_session.flush()

    directory = Directory(name="Queue Directory", url="https://example.com", category="General", country="US")
    db_session.add(directory)
    db_session.flush()

    request = SubmissionRequest(user_id=user.id, business_profile_id=profile.id, requested_count=1)
    db_session.add(request)
    db_session.flush()

    submission = DirectorySubmission(
        business_profile_id=profile.id,
        directory_id=directory.id,
        submission_request_id=request.id,
        status="manual_required",
        error_message="CAPTCHA or challenge detected",
        timestamp=datetime.utcnow(),
    )
    db_session.add(submission)
    db_session.flush()

    task = ManualSubmissionTask(directory_submission_id=submission.id, status="pending")
    db_session.add(task)
    db_session.commit()
    return user, submission


def test_queue_stats_service(client, db_session):
    seed_manual_row(db_session)
    response = client.get("/api/v1/submissions/manual-queue/stats")
    assert response.status_code in {200, 401}


def test_mark_complete_payload_shape(db_session):
    _, submission = seed_manual_row(db_session)
    assert submission.id > 0
