from fastapi import APIRouter, Depends

from core.dependencies import require_roles
from models import User, UserRole

router = APIRouter(prefix="/api/v1/auth", tags=["RBAC Tests"])

@router.get("/admin-test")
def admin_test(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return {
        "message": "Admin access granted", 
        "role": current_user.role.value,
    }
    
@router.get("/staff-test")
def staff_test(
    current_user: User = Depends(require_roles(UserRole.STAFF)),
):
    return {
        "message": "Staff access granted",
        "role": current_user.role.value,
    }