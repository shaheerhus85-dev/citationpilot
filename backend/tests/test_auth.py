from __future__ import annotations

from app.models.models import User


def test_signup_success(client, monkeypatch):
    monkeypatch.setattr("app.services.auth_service.send_verification_email", lambda *args, **kwargs: None)
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "auth@example.com", "password": "strongpass123", "full_name": "Auth User"},
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["message"]
    assert payload["user_id"] > 0


def test_signup_duplicate_email(client, db_session):
    db_session.add(
        User(
            email="duplicate@example.com",
            username="duplicate",
            hashed_password="hashed",
            is_active=True,
            is_verified=False,
        )
    )
    db_session.commit()

    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "duplicate@example.com", "password": "strongpass123", "full_name": "Dup User"},
    )
    assert response.status_code == 400


def test_login_invalid_password(client, db_session):
    db_session.add(
        User(
            email="login@example.com",
            username="login",
            hashed_password="$pbkdf2-sha256$29000$0JqT8n7Pec95T2ntPScEwA$QvO1DdeA3UzLIfLQxq9G9yMBf47mOq95nA5g6xBZJE0",
            is_active=True,
            is_verified=True,
        )
    )
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401
