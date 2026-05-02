from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.routes import auth, jobs, applications, analytics, settings, contact, dashboard, newsletter, tracking, reports
from app.database import engine, Base
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Luton Friendship Homecarers API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lutonfhc.org.uk",
        "https://www.lutonfhc.org.uk",
        "http://localhost:4200",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(reports.router)
app.include_router(contact.router)
app.include_router(dashboard.router)
app.include_router(newsletter.router)
app.include_router(tracking.router)

@app.get("/")
def root():
    return {"message": "Luton Friendship Homecarers API"}

@app.get("/api/debug-cloudinary")
def debug_cloudinary():
    import os, cloudinary, cloudinary.uploader
    secret = os.getenv("CLOUDINARY_API_SECRET", "NOT SET")
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=secret
    )
    try:
        import base64
        img_bytes = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
        result = cloudinary.uploader.upload(
            img_bytes,
            public_id="test_upload",
            resource_type="image"
        )
        return {"status": "SUCCESS", "url": result["secure_url"]}
    except Exception as e:
        return {"status": "FAILED", "error": str(e)}