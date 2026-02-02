from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, dashboard, jobs, applications, analytics, settings as settings_route, contact

app = FastAPI(
    title="Luton Friendship Homecarers — Admin API",
    description="Secure backend for the admin panel",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(analytics.router)
app.include_router(settings_route.router)
app.include_router(contact.router)

@app.get("/api/health")
def health():
    return {"status": "ok", "env": settings.app_env}
