from datetime import datetime
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from core.dependencies import get_current_user
from database import Base, get_db
from models import IncidentStatus, SecurityIncident, User, UserRole
from routers.dashboard import router as dashboard_router


@pytest.fixture
def dashboard_test_environment():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(dashboard_router)

    with Session(engine) as session:
        user = User(
            name="Dashboard Test Admin",
            email=f"dashboard-{uuid4().hex}@example.com",
            password_hash="test-only-hash",
            role=UserRole.ADMIN,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        user_id = user.id

    def override_get_db():
        with Session(engine) as session:
            yield session

    def override_get_current_user():
        with Session(engine) as session:
            return session.get(User, user_id)

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    try:
        with TestClient(app) as client:
            yield client, engine, user_id
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def add_incident(session, user_id, status, number):
    incident = SecurityIncident(
        incident_number=number,
        incident_type="Security Concern",
        title=f"Test Incident {number}",
        description="Integration test incident",
        location="Test Campus",
        occurred_at=datetime(2026, 10, 1, 9, 0),
        reported_at=datetime(2026, 10, 1, 10, 0),
        status=status,
        reported_by_id=user_id,
    )
    session.add(incident)
    session.flush()
    return incident


def test_dashboard_statistics_empty_database(dashboard_test_environment):
    client, _, _ = dashboard_test_environment

    response = client.get("/dashboard/overview")

    assert response.status_code == 200
    data = response.json()

    assert data["summary"]["security_incidents"] == 0
    assert data["incident_status_counts"] == {
        "open": 0,
        "under_investigation": 0,
        "resolved": 0,
        "closed": 0,
    }


def test_dashboard_statistics_with_real_queries(dashboard_test_environment):
    client, engine, user_id = dashboard_test_environment

    expected_counts = {
        IncidentStatus.OPEN: 5,
        IncidentStatus.UNDER_INVESTIGATION: 3,
        IncidentStatus.RESOLVED: 4,
        IncidentStatus.CLOSED: 2,
    }

    with Session(engine) as session:
        counter = 1
        for status, count in expected_counts.items():
            for _ in range(count):
                add_incident(
                    session,
                    user_id,
                    status,
                    f"TEST-{counter:04d}",
                )
                counter += 1
        session.commit()

    response = client.get("/dashboard/overview")

    assert response.status_code == 200
    data = response.json()

    assert data["summary"]["security_incidents"] == 14
    assert data["incident_status_counts"] == {
        "open": 5,
        "under_investigation": 3,
        "resolved": 4,
        "closed": 2,
    }
    assert sum(data["incident_status_counts"].values()) == 14


def test_dashboard_statistics_after_status_update(dashboard_test_environment):
    client, engine, user_id = dashboard_test_environment

    with Session(engine) as session:
        incident = add_incident(
            session,
            user_id,
            IncidentStatus.OPEN,
            "TEST-UPDATE-001",
        )
        incident_id = incident.id
        session.commit()

    before = client.get("/dashboard/overview")
    assert before.status_code == 200
    assert before.json()["incident_status_counts"]["open"] == 1

    with Session(engine) as session:
        incident = session.get(SecurityIncident, incident_id)
        incident.status = IncidentStatus.RESOLVED
        session.commit()

    after = client.get("/dashboard/overview")
    assert after.status_code == 200

    data = after.json()
    assert data["summary"]["security_incidents"] == 1
    assert data["incident_status_counts"]["open"] == 0
    assert data["incident_status_counts"]["resolved"] == 1
    assert sum(data["incident_status_counts"].values()) == 1
