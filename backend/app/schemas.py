import json
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

def parse_array_field(value) -> List[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [i for i in value if i and str(i).strip()]
    s = str(value).strip()
    if s.startswith('['):
        try:
            parsed = json.loads(s)
            return [str(i).strip() for i in parsed if i and str(i).strip()]
        except Exception:
            pass
    return [i.strip() for i in s.split('\n') if i.strip()]

class JobCreate(BaseModel):
    title: str
    category: str
    job_type: str
    location: str
    salary: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = []
    qualifications: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    working_hours: Optional[str] = None
    experience: Optional[str] = None
    benefits: Optional[List[str]] = []
    training: Optional[str] = None
    tags: Optional[List[str]] = []
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
        return cls(
            id=job.id,
            title=job.title,
            category=job.category,
            job_type=job.job_type,
            location=job.location,
            salary=job.salary,
            summary=job.summary,
            description=job.description,
            requirements=parse_array_field(job.requirements),
            qualifications=parse_array_field(job.qualifications),
            skills=parse_array_field(job.skills),
            certifications=parse_array_field(job.certifications),
            working_hours=job.working_hours,
            experience=job.experience,
            benefits=parse_array_field(job.benefits),
            training=job.training,
            tags=parse_array_field(job.tags),
            start_date=job.start_date,
            is_active=job.is_active,
            created_at=job.created_at,
            applicant_count=len(job.applications) if hasattr(job, 'applications') else 0
        )

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminResponse(BaseModel):
    email: str
    name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    admin_email: str
    admin_role: str
    admin_name: str
