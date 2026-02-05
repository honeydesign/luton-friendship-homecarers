from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Job Schemas ──────────────────────────────────
class JobCreate(BaseModel):
    title: str
    category: str
    job_type: str
    location: str
    salary: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    qualifications: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    working_hours: Optional[str] = None
    experience: Optional[str] = None
    benefits: Optional[List[str]] = None
    training: Optional[str] = None
    tags: Optional[List[str]] = None
    start_date: Optional[str] = None
    is_active: bool = True


class JobUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    qualifications: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    working_hours: Optional[str] = None
    experience: Optional[str] = None
    benefits: Optional[List[str]] = None
    training: Optional[str] = None
    tags: Optional[List[str]] = None
    start_date: Optional[str] = None
    is_active: Optional[bool] = None


class JobResponse(BaseModel):
    id: int
    title: str
    category: str
    job_type: str
    location: str
    salary: Optional[str]
    summary: Optional[str]
    description: Optional[str]
    requirements: Optional[List[str]]
    qualifications: Optional[List[str]]
    skills: Optional[List[str]]
    certifications: Optional[List[str]]
    working_hours: Optional[str]
    experience: Optional[str]
    benefits: Optional[List[str]]
    training: Optional[str]
    tags: Optional[List[str]]
    start_date: Optional[str]
    is_active: bool
    created_at: datetime
    applicant_count: int = 0

    @classmethod
    def from_orm_job(cls, job):
        """Convert database Job model to JobResponse, parsing text fields to arrays"""
        return cls(
            id=job.id,
            title=job.title,
            category=job.category,
            job_type=job.job_type,
            location=job.location,
            salary=job.salary,
            summary=job.summary,
            description=job.description,
            requirements=job.requirements.split('\n') if job.requirements else [],
            qualifications=job.qualifications.split('\n') if job.qualifications else [],
            skills=job.skills.split('\n') if job.skills else [],
            certifications=job.certifications.split('\n') if job.certifications else [],
            working_hours=job.working_hours,
            experience=job.experience,
            benefits=job.benefits.split('\n') if job.benefits else [],
            training=job.training,
            tags=job.tags.split(',') if job.tags else [],
            start_date=job.start_date,
            is_active=job.is_active,
            created_at=job.created_at,
            applicant_count=len(job.applications) if hasattr(job, 'applications') else 0
        )

    class Config:
        from_attributes = True


# ── Application Schemas ──────────────────────────
class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    position: str
    name: str
    email: str
    phone: Optional[str]
    experience: Optional[str]
    availability: Optional[str]
    cv_url: Optional[str]
    status: str
    applied_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: str
