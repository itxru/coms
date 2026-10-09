import pytest
from fastapi import HTTPException
from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers.auth import router as auth_router
from tests.rbac_test_router import router as rbac_test_router
from unittest.mock import MagicMock

from core.dependencies import get_current_user, require_roles, require_owner
from core.security import create_access_token
from database import get_db

from models import User, UserRole

app = FastAPI()
app.include_router(auth_router)
app.include_router(rbac_test_router)

class MockUser:
    def __init__(self, role: UserRole):
        self.role = role
        
@pytest.mark.parametrize(
    "role",
    [
        UserRole.ADMIN,
        UserRole.STAFF,
        UserRole.USER_STUDENT,
    ],
)
def test_admin_only_rejects_other_roles(role):
    checker = require_roles(UserRole.ADMIN)
    
    user = MockUser(role)
    
    if role == UserRole.ADMIN:
        assert checker(current_user=user) == user
    else:
        with pytest.raises(HTTPException) as exc:
            checker(current_user=user)
        assert exc.value.status_code == 403
        
@pytest.mark.parametrize(
    "role",
    [
        UserRole.ADMIN,
        UserRole.STAFF,
        UserRole.USER_STUDENT,
    ],
)
def test_staff_only_rejects_other_roles(role):
    checker = require_roles(UserRole.STAFF)
    
    user = MockUser(role)
    
    if role == UserRole.STAFF:
        assert checker(current_user=user) == user
    else:
        with pytest.raises(HTTPException) as exc:
            checker(current_user=user)
        assert exc.value.status_code == 403
        
def test_admin_endpoint_without_token():
    client = TestClient(app)
    
    response = client.get("/api/v1/auth/admin-test")
    
    assert response.status_code == 401
    
@pytest.mark.parametrize(
    "role, expected_status",
    [
        (UserRole.ADMIN, 200),
        (UserRole.STAFF, 403),
        (UserRole.USER_STUDENT, 403),
    ],
)
def test_admin_endpoint_with_roles(role, expected_status):
    app.dependency_overrides[get_current_user] = lambda: MockUser(role)
    
    try:
        with TestClient(app) as client:
            response = client.get("/api/v1/auth/admin-test")
            assert response.status_code == expected_status
    finally:
        app.dependency_overrides.clear()
        
@pytest.mark.parametrize(
    "role, expected_status",
    [
        (UserRole.ADMIN, 403),
        (UserRole.STAFF, 200),
        (UserRole.USER_STUDENT, 403),
    ],
)
def test_staff_endpoint_with_roles(role, expected_status):
    app.dependency_overrides[get_current_user] = lambda: MockUser(role)
    
    try:
        with TestClient(app) as client:
            response = client.get("/api/v1/auth/staff-test")
            assert response.status_code == expected_status
    finally:
        app.dependency_overrides.clear()
        
def test_jwt_role_claim_does_not_override_db_role():
    token = create_access_token({
        "sub": "2",
        "role": "admin",
})
    mock_user = MockUser(UserRole.STAFF)
    mock_user.id = 2
    
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
    
    def override_get_db():
        yield mock_db
        
    app.dependency_overrides[get_db] = override_get_db
    
    try:
        with TestClient(app) as client:
            response = client.get(
                "/api/v1/auth/admin-test",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 403
    finally:
        app.dependency_overrides.pop(get_db, None)
        
def test_resource_owner_access_granted():
    user = MockUser(UserRole.USER_STUDENT)
    user.id = 3
    
    result = require_owner(current_user=user, owner_id=3)
    
    assert result is None  # No exception means access granted
    
def test_resource_owner_access_denied():
    user = MockUser(UserRole.USER_STUDENT)
    user.id = 3
    
    with pytest.raises(HTTPException) as exc:
        require_owner(current_user=user, owner_id=4)
    
    assert exc.value.status_code == 403
    
def test_admin_does_not_bypass_owner_check():
    user = MockUser(UserRole.ADMIN)
    user.id = 1
    
    with pytest.raises(HTTPException) as exc:
        require_owner(current_user=user, owner_id=3)
    
    assert exc.value.status_code == 403