from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth, jobs, applications, analytics, settings, contact, dashboard
from app.database import engine, Base
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Luton Friendship Homecarers API")

# CORS Configuration - UPDATED to allow your domain
origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "https://lutonfhc.org.uk",
    "http://lutonfhc.org.uk",
    "https://www.lutonfhc.org.uk",
    "http://www.lutonfhc.org.uk"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for static file serving
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(contact.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Luton Friendship Homecarers API"}
