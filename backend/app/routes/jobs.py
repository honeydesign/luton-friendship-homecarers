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

@router.get("/public/active", response_model=list[JobResponse])
def get_public_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.is_active == True).order_by(Job.created_at.desc()).all()
    return [job_to_response(j) for j in jobs]

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
    
    # FIXED: Use model_dump() WITHOUT exclude_unset so we get ALL fields including empty arrays
    update_data = job_data.model_dump()
    
    # Update each field properly
    if update_data.get('title') is not None:
        job.title = update_data['title']
    if update_data.get('category') is not None:
        job.category = update_data['category']
    if update_data.get('job_type') is not None:
        job.job_type = update_data['job_type']
    if update_data.get('location') is not None:
        job.location = update_data['location']
    if update_data.get('salary') is not None:
        job.salary = update_data['salary']
    if update_data.get('summary') is not None:
        job.summary = update_data['summary']
    if update_data.get('description') is not None:
        job.description = update_data['description']
    if update_data.get('working_hours') is not None:
        job.working_hours = update_data['working_hours']
    if update_data.get('experience') is not None:
        job.experience = update_data['experience']
    if update_data.get('training') is not None:
        job.training = update_data['training']
    if update_data.get('start_date') is not None:
        job.start_date = update_data['start_date']
    if update_data.get('is_active') is not None:
        job.is_active = update_data['is_active']
    
    # Handle array fields - ALWAYS update them, even if empty
    if 'requirements' in update_data:
        job.requirements = '\n'.join(update_data['requirements']) if update_data['requirements'] else ''
    if 'qualifications' in update_data:
        job.qualifications = '\n'.join(update_data['qualifications']) if update_data['qualifications'] else ''
    if 'skills' in update_data:
        job.skills = '\n'.join(update_data['skills']) if update_data['skills'] else ''
    if 'certifications' in update_data:
        job.certifications = '\n'.join(update_data['certifications']) if update_data['certifications'] else ''
    if 'benefits' in update_data:
        job.benefits = '\n'.join(update_data['benefits']) if update_data['benefits'] else ''
    if 'tags' in update_data:
        job.tags = ','.join(update_data['tags']) if update_data['tags'] else ''
    
    db.commit()
    db.refresh(job)
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
