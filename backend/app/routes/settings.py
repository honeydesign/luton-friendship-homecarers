from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, NotificationPreference, SystemSetting
from app.services.auth_service import get_current_admin
from app.schemas import (
    SystemSettingsResponse,
    SystemSettingsUpdate,
    SocialMediaUpdate,
    NotificationPrefsResponse,
    NotificationPrefsUpdate,
)

router = APIRouter(prefix="/api/settings", tags=["Settings"])


# ── System Settings ─────────────────────────────────────
@router.get("/system", response_model=SystemSettingsResponse)
def get_system_settings(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    settings = db.query(SystemSetting).filter(SystemSetting.admin_id == current_admin.id).first()
    if not settings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System settings not found")
    return settings


@router.put("/system", response_model=SystemSettingsResponse)
def update_system_settings(
    update: SystemSettingsUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    settings = db.query(SystemSetting).filter(SystemSetting.admin_id == current_admin.id).first()
    if not settings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System settings not found")

    if update.site_name is not None:
        settings.site_name = update.site_name
    if update.site_email is not None:
        settings.site_email = update.site_email
    if update.site_phone is not None:
        settings.site_phone = update.site_phone
    if update.site_address is not None:
        settings.site_address = update.site_address
    if update.maintenance_mode is not None:
        settings.maintenance_mode = update.maintenance_mode
    if update.allow_registrations is not None:
        settings.allow_registrations = update.allow_registrations

    db.commit()
    db.refresh(settings)
    return settings


# ── Social Media ────────────────────────────────────────
@router.put("/social", response_model=SystemSettingsResponse)
def update_social_media(
    update: SocialMediaUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    settings = db.query(SystemSetting).filter(SystemSetting.admin_id == current_admin.id).first()
    if not settings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System settings not found")

    if update.facebook is not None:
        settings.social_facebook = update.facebook
    if update.twitter is not None:
        settings.social_twitter = update.twitter
    if update.linkedin is not None:
        settings.social_linkedin = update.linkedin
    if update.instagram is not None:
        settings.social_instagram = update.instagram

    db.commit()
    db.refresh(settings)
    return settings


# ── Notification Preferences ────────────────────────────
@router.get("/notifications", response_model=NotificationPrefsResponse)
def get_notification_prefs(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    prefs = db.query(NotificationPreference).filter(NotificationPreference.admin_id == current_admin.id).first()
    if not prefs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification preferences not found")
    return prefs


@router.put("/notifications", response_model=NotificationPrefsResponse)
def update_notification_prefs(
    update: NotificationPrefsUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    prefs = db.query(NotificationPreference).filter(NotificationPreference.admin_id == current_admin.id).first()
    if not prefs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification preferences not found")

    if update.email_new_application is not None:
        prefs.email_new_application = update.email_new_application
    if update.email_new_message is not None:
        prefs.email_new_message = update.email_new_message
    if update.email_weekly_report is not None:
        prefs.email_weekly_report = update.email_weekly_report
    if update.email_monthly_report is not None:
        prefs.email_monthly_report = update.email_monthly_report
    if update.push_new_application is not None:
        prefs.push_new_application = update.push_new_application
    if update.push_new_message is not None:
        prefs.push_new_message = update.push_new_message

    db.commit()
    db.refresh(prefs)
    return prefs


# ── Public Settings (no auth required) ─────────────────
@router.get("/public")
def get_public_settings(
    db: Session = Depends(get_db),
):
    settings = db.query(SystemSetting).first()
    if not settings:
        return {
            "site_name": "Luton Friendship Homecarers",
            "site_email": "info@lutonfhc.org.uk",
            "site_phone": "+44 1582 000000",
            "site_address": "Luton, Bedfordshire, UK",
            "social_facebook": "",
            "social_twitter": "",
            "social_linkedin": "",
            "social_instagram": ""
        }
    return {
        "site_name": settings.site_name,
        "site_email": settings.site_email,
        "site_phone": settings.site_phone,
        "site_address": settings.site_address,
        "social_facebook": settings.social_facebook,
        "social_twitter": settings.social_twitter,
        "social_linkedin": settings.social_linkedin,
        "social_instagram": settings.social_instagram
    }
