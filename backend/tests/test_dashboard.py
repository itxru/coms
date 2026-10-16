from unittest.mock import MagicMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from core.dependencies import get_current_user
from database import get_db
from models import UserRole
from routers.dashboard import router as dashboard_router

app = FastAPI()
app.include_router(dashboard_router)


class MockUser:
    def __init__(self, role: UserRole):
        self.role = role


def test_dashboard_empty_incident_statistics():
    mock_db = MagicMock()

    # All count queries return zero.
    mock_db.scalar.return_value = 0

    # No recent incidents.
    mock_db.scalars.return_value.all.return_value = []

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: MockUser(UserRole.ADMIN)

    try:
        with TestClient(app) as client:
            response = client.get("/dashboard/overview")

        assert response.status_code == 200

        data = response.json()

        assert data["data_available"] is True
        assert data["summary"]["security_incidents"] == 0

        assert data["incident_status_counts"] == {
            "open": 0,
            "under_investigation": 0,
            "resolved": 0,
            "closed": 0,
        }

        assert data["recent_operational_records"] == []

    finally:
        app.dependency_overrides.clear()


def test_dashboard_incident_totals_and_status_breakdown():
    mock_db = MagicMock()

    # The dashboard queries total incidents first,
    # followed by the four status counts.
    # The remaining eight values are quarterly trend counts.
    mock_db.scalar.side_effect = [
        14,  # Total security incidents
        5,  # Open
        3,  # Under Investigation
        4,  # Resolved
        2,  # Closed
        0,  # PB-014: Total student violations
        0,
        0,  # Q1 incidents, resolved
        0,
        0,  # Q2 incidents, resolved
        0,
        0,  # Q3 incidents, resolved
        0,
        0,  # Q4 incidents, resolved
    ]

    mock_db.scalars.return_value.all.return_value = []

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: MockUser(UserRole.ADMIN)

    try:
        with TestClient(app) as client:
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

    finally:
        app.dependency_overrides.clear()


import pytest


@pytest.mark.parametrize(
    "role, expected_status",
    [
        (UserRole.ADMIN, 200),
        (UserRole.STAFF, 200),
        (UserRole.USER_STUDENT, 403),
    ],
)
def test_dashboard_role_based_access(role, expected_status):
    mock_db = MagicMock()

    mock_db.scalar.return_value = 0
    mock_db.scalars.return_value.all.return_value = []

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: MockUser(role)

    try:
        with TestClient(app) as client:
            response = client.get("/dashboard/overview")

        assert response.status_code == expected_status

        if expected_status == 200:
            data = response.json()
            assert data["summary"]["security_incidents"] == 0
        else:
            assert response.json()["detail"] == (
                "You do not have permission to access this resource"
            )

    finally:
        app.dependency_overrides.clear()
