from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime,
    ForeignKey, Enum as SAEnum, Float
)
from sqlalchemy.orm import relationship
from app.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False, default="Admin User")
    phone = Column(String(50), nullable=True)
    role = Column(String(50), nullable=False, default="super-admin")
    profile_image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    notification_prefs = relationship("NotificationPreference", back_populates="admin", uselist=False)
    system_settings = relationship("SystemSetting", back_populates="admin", uselist=False)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="carers")
    job_type = Column(String(50), nullable=False, default="Full-time")
    location = Column(String(255), nullable=False, default="Luton")
    salary = Column(String(100), nullable=True)
    summary = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    qualifications = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)
    working_hours = Column(Text, nullable=True)
    experience = Column(String(255), nullable=True)
    benefits = Column(Text, nullable=True)
    training = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)
    start_date = Column(String(100), nullable=True)
    application_deadline = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("Application", back_populates="job")


APPLICATION_STATUSES = ("New", "Reviewed", "Interview", "Hired", "Rejected")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    experience = Column(String(255), nullable=True)
    availability = Column(String(255), nullable=True)
    cv_url = Column(String(500), nullable=True)
    status = Column(SAEnum(*APPLICATION_STATUSES, name="application_status"), nullable=False, default="New")
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("Job", back_populates="applications")


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    snapshot_date = Column(DateTime, unique=True, nullable=False, index=True)
    visitors = Column(Integer, default=0)
    page_views = Column(Integer, default=0)
    bounce_rate = Column(Float, default=0.0)
    avg_duration_seconds = Column(Integer, default=0)
    source_direct = Column(Float, default=0.0)
    source_google = Column(Float, default=0.0)
    source_social = Column(Float, default=0.0)
    source_referral = Column(Float, default=0.0)
    device_desktop = Column(Float, default=0.0)
    device_mobile = Column(Float, default=0.0)
    device_tablet = Column(Float, default=0.0)


class PageView(Base):
    __tablename__ = "page_views"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    page_path = Column(String(500), nullable=False, index=True)
    snapshot_date = Column(DateTime, nullable=False, index=True)
    views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    avg_time_seconds = Column(Integer, default=0)
    bounce_rate = Column(Float, default=0.0)


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("admins.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_new_application = Column(Boolean, default=True)
    email_new_message = Column(Boolean, default=True)
    email_weekly_report = Column(Boolean, default=False)
    email_monthly_report = Column(Boolean, default=True)
    push_new_application = Column(Boolean, default=True)
    push_new_message = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    admin = relationship("Admin", back_populates="notification_prefs")


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("admins.id", ondelete="CASCADE"), unique=True, nullable=False)
    site_name = Column(String(255), nullable=False, default="Luton Friendship Homecarers")
    site_email = Column(String(255), nullable=True)
    site_phone = Column(String(50), nullable=True)
    site_address = Column(Text, nullable=True)
    maintenance_mode = Column(Boolean, default=False)
    allow_registrations = Column(Boolean, default=True)
    social_facebook = Column(String(500), nullable=True)
    social_twitter = Column(String(500), nullable=True)
    social_linkedin = Column(String(500), nullable=True)
    social_instagram = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    admin = relationship("Admin", back_populates="system_settings")
