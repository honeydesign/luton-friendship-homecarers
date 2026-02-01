from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import json


# ─── Auth ─────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_email: str
    admin_role: str
    admin_name: str


class TokenData(BaseModel):
    admin_id: int
    email: str
    role: str


# ─── Admin Profile ────────────────────────────────────
class AdminProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True


class AdminProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str


# ─── Jobs ─────────────────────────────────────────────
class JobCreate(BaseModel):
    title: str
    category: str = "carers"
    job_type: str = "Full-time"
    location: str = "Luton"
    salary: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    requirements: List[str] = []
    qualifications: List[str] = []
    skills: List[str] = []
    certifications: List[str] = []
    working_hours: Optional[str] = None
    experience: Optional[str] = None
    benefits: List[str] = []
    training: Optional[str] = None
    tags: List[str] = []
    start_date: Optional[str] = None
    is_active: bool = True


class JobUpdate(JobCreate):
    pass


class JobResponse(BaseModel):
    id: int
    title: str
    category: str
    job_type: str
    location: str
    salary: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    requirements: List[str] = []
    qualifications: List[str] = []
    skills: List[str] = []
    certifications: List[str] = []
    working_hours: Optional[str] = None
    experience: Optional[str] = None
    benefits: List[str] = []
    training: Optional[str] = None
    tags: List[str] = []
    start_date: Optional[str] = None
    is_active: bool
    applicants: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_job(cls, job):
        def parse(val):
            if val is None:
                return []
            if isinstance(val, list):
                return val
            try:
                return json.loads(val)
            except (json.JSONDecodeError, TypeError):
                return []

        return cls(
            id=job.id, title=job.title, category=job.category,
            job_type=job.job_type, location=job.location, salary=job.salary,
            summary=job.summary, description=job.description,
            requirements=parse(job.requirements),
            qualifications=parse(job.qualifications),
            skills=parse(job.skills),
            certifications=parse(job.certifications),
            working_hours=job.working_hours, experience=job.experience,
            benefits=parse(job.benefits), training=job.training,
            tags=parse(job.tags), start_date=job.start_date,
            is_active=job.is_active,
            applicants=len(job.applications) if job.applications else 0,
            created_at=job.created_at, updated_at=job.updated_at,
        )


# ─── Applications ─────────────────────────────────────
class ApplicationCreate(BaseModel):
    job_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    experience: Optional[str] = None
    availability: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    position: str
    name: str
    email: str
    phone: Optional[str] = None
    experience: Optional[str] = None
    availability: Optional[str] = None
    cv_url: Optional[str] = None
    status: str
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────
class DashboardStatsResponse(BaseModel):
    total_applications: int
    active_jobs: int
    total_visitors: int
    total_page_views: int


class RecentApplicationResponse(BaseModel):
    id: int
    name: str
    position: str
    date: str
    status: str


class TrafficSourceResponse(BaseModel):
    source: str
    visitors: int
    percentage: float


class DeviceResponse(BaseModel):
    name: str
    percentage: float


class DashboardResponse(BaseModel):
    stats: DashboardStatsResponse
    recent_applications: List[RecentApplicationResponse]
    traffic_sources: List[TrafficSourceResponse]
    devices: List[DeviceResponse]


# ─── Analytics ────────────────────────────────────────
class AnalyticsStatsResponse(BaseModel):
    visitors: int
    page_views: int
    bounce_rate: str
    avg_duration: str
    applications: int
    conversion_rate: str


class PageStatResponse(BaseModel):
    page: str
    views: int
    unique_visitors: int
    avg_time: str
    bounce_rate: str


class PopularJobResponse(BaseModel):
    title: str
    applications: int
    views: int


class AnalyticsResponse(BaseModel):
    stats: AnalyticsStatsResponse
    traffic_sources: List[TrafficSourceResponse]
    devices: List[DeviceResponse]
    top_pages: List[PageStatResponse]
    popular_jobs: List[PopularJobResponse]


# ─── Settings ─────────────────────────────────────────
class SystemSettingsResponse(BaseModel):
    site_name: str
    site_email: Optional[str] = None
    site_phone: Optional[str] = None
    site_address: Optional[str] = None
    maintenance_mode: bool
    allow_registrations: bool
    social_facebook: Optional[str] = None
    social_twitter: Optional[str] = None
    social_linkedin: Optional[str] = None
    social_instagram: Optional[str] = None

    class Config:
        from_attributes = True


class SystemSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    site_email: Optional[str] = None
    site_phone: Optional[str] = None
    site_address: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    allow_registrations: Optional[bool] = None


class SocialMediaUpdate(BaseModel):
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None


class NotificationPrefsResponse(BaseModel):
    email_new_application: bool
    email_new_message: bool
    email_weekly_report: bool
    email_monthly_report: bool
    push_new_application: bool
    push_new_message: bool

    class Config:
        from_attributes = True


class NotificationPrefsUpdate(BaseModel):
    email_new_application: Optional[bool] = None
    email_new_message: Optional[bool] = None
    email_weekly_report: Optional[bool] = None
    email_monthly_report: Optional[bool] = None
    push_new_application: Optional[bool] = None
    push_new_message: Optional[bool] = None
