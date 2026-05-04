from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin
from app.schemas import LoginRequest, LoginResponse, AdminProfileResponse
from app.services.auth_service import (
    verify_password,
    create_access_token,
    get_current_admin,
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for email: {credentials.email}")
    
    admin = db.query(Admin).filter(Admin.email == credentials.email).first()
    
    if not admin:
        logger.warning(f"Admin not found for email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    logger.info(f"Admin found: {admin.email}, is_active: {admin.is_active}")
    logger.info(f"Password hash from DB (first 20 chars): {admin.password_hash[:20]}")
    
    password_valid = verify_password(credentials.password, admin.password_hash)
    logger.info(f"Password verification result: {password_valid}")
    
    if not password_valid:
        logger.warning("Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not admin.is_active:
        logger.warning("Admin account is not active")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated",
        )

    token_payload = {
        "admin_id": admin.id,
        "email": admin.email,
        "role": admin.role,
    }
    access_token = create_access_token(data=token_payload)

    logger.info(f"Login successful for {admin.email}")
    return LoginResponse(
        access_token=access_token,
        admin_email=admin.email,
        admin_role=admin.role,
        admin_name=admin.name,
    )


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=AdminProfileResponse)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return current_admin

@router.patch("/profile")
def update_profile(
    data: dict,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if "full_name" in data:
        current_admin.name = data["full_name"]
    if "email" in data:
        current_admin.email = data["email"]
    if "phone" in data:
        current_admin.phone = data.get("phone")
    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/change-password")
def change_password(
    data: dict,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from app.services.auth_service import verify_password, get_password_hash
    if not verify_password(data["current_password"], current_admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_admin.password_hash = get_password_hash(data["new_password"])
    db.commit()
    return {"message": "Password changed successfully"}


# ── Forgot Password ────────────────────────────────
import secrets
from datetime import datetime, timedelta
from pydantic import EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.delete("/clear-test-data")
def clear_test_data(secret: str, db: Session = Depends(get_db)):
    if secret != "luton-clear-2024":
        raise HTTPException(status_code=403, detail="Forbidden")
    from sqlalchemy import text
    db.execute(text("DELETE FROM newsletter_subscribers"))
    db.execute(text("DELETE FROM contact_inquiries"))
    db.commit()
    return {"message": "Test data cleared"}

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    from app.routes.reports import send_email
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if not admin:
        raise HTTPException(status_code=404, detail="No account found with that email address")
    
    token = secrets.token_urlsafe(32)
    admin.reset_token = token
    admin.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    reset_url = f"https://lutonfhc.org.uk/reset-password?token={token}"
    html = f"""
    <h2>Reset Your Password</h2>
    <p>Hi {admin.name},</p>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <a href="{reset_url}" style="background:#2563EB;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a>
    <p>If you did not request this, ignore this email.</p>
    """
    send_email(admin.email, "Reset Your Password - Luton Friendship Homecarers", html)
    return {"message": "If that email exists, a reset link has been sent"}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    from app.services.auth_service import get_password_hash
    admin = db.query(Admin).filter(Admin.reset_token == data.token).first()
    if not admin:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    if admin.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token has expired")
    
    admin.password_hash = get_password_hash(data.new_password)
    admin.reset_token = None
    admin.reset_token_expiry = None
    db.commit()
    return {"message": "Password reset successfully"}
