from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.routes import auth, jobs, applications, analytics, settings, contact, dashboard
from app.database import engine, Base
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Luton Friendship Homecarers API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
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
app.include_router(contact.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Luton Friendship Homecarers API"}
