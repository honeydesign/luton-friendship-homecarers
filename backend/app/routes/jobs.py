import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, Job
from app.services.auth_service import get_current_admin
from app.schemas import JobCreate, JobUpdate, JobResponse

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


def job_to_response(job: Job) -> JobResponse:
    return JobResponse.from_orm_job(job)


@router.get("", response_model=list[JobResponse])
def get_jobs(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return [job_to_response(j) for j in jobs]


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job_to_response(job)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    job = Job(
        title=job_data.title,
        category=job_data.category,
        job_type=job_data.job_type,
        location=job_data.location,
        salary=job_data.salary,
        summary=job_data.summary,
        description=job_data.description,
        requirements=json.dumps(job_data.requirements),
        qualifications=json.dumps(job_data.qualifications),
        skills=json.dumps(job_data.skills),
        certifications=json.dumps(job_data.certifications),
        working_hours=job_data.working_hours,
        experience=job_data.experience,
        benefits=json.dumps(job_data.benefits),
        training=job_data.training,
        tags=json.dumps(job_data.tags),
        start_date=job_data.start_date,
        is_active=job_data.is_active,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job_to_response(job)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_data: JobUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    job.title = job_data.title
    job.category = job_data.category
    job.job_type = job_data.job_type
    job.location = job_data.location
    job.salary = job_data.salary
    job.summary = job_data.summary
    job.description = job_data.description
    job.requirements = json.dumps(job_data.requirements)
    job.qualifications = json.dumps(job_data.qualifications)
    job.skills = json.dumps(job_data.skills)
    job.certifications = json.dumps(job_data.certifications)
    job.working_hours = job_data.working_hours
    job.experience = job_data.experience
    job.benefits = json.dumps(job_data.benefits)
    job.training = job_data.training
    job.tags = json.dumps(job_data.tags)
    job.start_date = job_data.start_date
    job.is_active = job_data.is_active

    db.commit()
    db.refresh(job)
    return job_to_response(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    db.delete(job)
    db.commit()


@router.patch("/{job_id}/toggle", response_model=JobResponse)
def toggle_job(
    job_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    job.is_active = not job.is_active
    db.commit()
    db.refresh(job)
    return job_to_response(job)
