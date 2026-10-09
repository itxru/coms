import pytest
from sqlalchemy.exc import StatementError

from models import User, UserRole

def test_admin_role():
    assert UserRole.ADMIN.value == "admin"
    
def test_staff_role():
    assert UserRole.STAFF.value == "staff"
    
def test_user_student_role():
    assert UserRole.USER_STUDENT.value == "user_student"
    
def test_all_roles_defined():
    assert len(UserRole) == 3
    
def test_default_user_role():
    role_column = User.__table__.columns['role']
    assert role_column.default.arg == UserRole.USER_STUDENT
    
def test_invalid_role_rejected():
    role_column = User.__table__.columns['role']
    
    with pytest.raises((LookupError, StatementError)):
        role_column.type.bind_processor(None)("superadmin")