import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, Job
from app.services.auth_service import get_current_admin
from app.schemas import JobCreate, JobUpdate, JobResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

def job_to_response(job: Job) -> JobResponse:
    return JobResponse.from_orm_job(job)


# ── Public Jobs (no auth required) ─────────────────
@router.get("/public/active", response_model=list[JobResponse])
def get_public_jobs(
    db: Session = Depends(get_db),
):
    jobs = db.query(Job).filter(Job.is_active == True).order_by(Job.created_at.desc()).all()
    return [job_to_response(j) for j in jobs]


# ── Admin Jobs ────────────────────────────────────
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
    logger.info(f"Creating job with data: {job_data}")
    
    job = Job(
        title=job_data.title,
        category=job_data.category,
        job_type=job_data.job_type,
        location=job_data.location,
        salary=job_data.salary,
        summary=job_data.summary,
        description=job_data.description,
        requirements='\n'.join(job_data.requirements) if job_data.requirements else '',
        qualifications='\n'.join(job_data.qualifications) if job_data.qualifications else '',
        skills='\n'.join(job_data.skills) if job_data.skills else '',
        certifications='\n'.join(job_data.certifications) if job_data.certifications else '',
        working_hours=job_data.working_hours,
        experience=job_data.experience,
        benefits='\n'.join(job_data.benefits) if job_data.benefits else '',
        training=job_data.training,
        tags=','.join(job_data.tags) if job_data.tags else '',
        start_date=job_data.start_date,
        is_active=job_data.is_active,
    )
    
    logger.info(f"Job object before save - requirements: {job.requirements}, benefits: {job.benefits}")
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    logger.info(f"Job saved - ID: {job.id}, requirements: {job.requirements}, benefits: {job.benefits}")
    
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
    
    logger.info(f"===== UPDATING JOB {job_id} =====")
    logger.info(f"Received data: {job_data.model_dump()}")
    
    # Get ALL fields, not just unset ones
    data_dict = job_data.model_dump()
    
    logger.info(f"Requirements in payload: {data_dict.get('requirements')}")
    logger.info(f"Benefits in payload: {data_dict.get('benefits')}")
    logger.info(f"Skills in payload: {data_dict.get('skills')}")
    
    # Update fields
    for key, value in data_dict.items():
        if value is None:
            continue
            
        if key in ['requirements', 'qualifications', 'skills', 'certifications', 'benefits']:
            # Convert arrays to newline-separated strings
            if isinstance(value, list):
                string_value = '\n'.join(value) if value else ''
                logger.info(f"Setting {key} to: '{string_value}' (from array of {len(value)} items)")
                setattr(job, key, string_value)
        elif key == 'tags':
            # Convert array to comma-separated string
            if isinstance(value, list):
                setattr(job, key, ','.join(value) if value else '')
        else:
            setattr(job, key, value)
    
    logger.info(f"Job after updates - requirements: '{job.requirements}', benefits: '{job.benefits}'")
    
    db.commit()
    db.refresh(job)
    
    logger.info(f"Job after commit - requirements: '{job.requirements}', benefits: '{job.benefits}'")
    
    return job_to_response(job)


@router.delete("/{job_id}")
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
    return {"message": "Job deleted successfully"}


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
