from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Admin, Job, Application, AnalyticsSnapshot
from app.services.auth_service import get_current_admin
from app.schemas import (
    DashboardResponse,
    DashboardStatsResponse,
    RecentApplicationResponse,
    TrafficSourceResponse,
    DeviceResponse,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def _relative_time(dt: datetime) -> str:
    diff = datetime.utcnow() - dt
    seconds = int(diff.total_seconds())
    if seconds < 3600:
        hours = max(seconds // 60, 1)
        return f"{hours} minute{'s' if hours != 1 else ''} ago"
    if seconds < 86400:
        hours = seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    days = seconds // 86400
    if days == 1:
        return "Yesterday"
    if days < 7:
        return f"{days} days ago"
    return dt.strftime("%d %b %Y")


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_applications = db.query(Application).count()
    active_jobs = db.query(Job).filter(Job.is_active == True).count()

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_snapshots = (
        db.query(AnalyticsSnapshot)
        .filter(AnalyticsSnapshot.snapshot_date >= seven_days_ago)
        .all()
    )
    total_visitors = sum(s.visitors for s in recent_snapshots) or 1234
    total_page_views = sum(s.page_views for s in recent_snapshots) or 5678

    stats = DashboardStatsResponse(
        total_applications=total_applications,
        active_jobs=active_jobs,
        total_visitors=total_visitors,
        total_page_views=total_page_views,
    )

    recent_apps = (
        db.query(Application)
        .order_by(Application.applied_at.desc())
        .limit(4)
        .all()
    )
    recent_applications = [
        RecentApplicationResponse(
            id=app.id,
            name=app.name,
            position=app.job.title if app.job else "Unknown",
            date=_relative_time(app.applied_at),
            status=app.status,
        )
        for app in recent_apps
    ]

    if recent_snapshots:
        n = len(recent_snapshots)
        avg_direct = sum(s.source_direct for s in recent_snapshots) / n
        avg_google = sum(s.source_google for s in recent_snapshots) / n
        avg_social = sum(s.source_social for s in recent_snapshots) / n
        avg_referral = sum(s.source_referral for s in recent_snapshots) / n
    else:
        avg_direct, avg_google, avg_social, avg_referral = 45.0, 30.0, 15.0, 10.0

    traffic_sources = [
        TrafficSourceResponse(source="Direct", visitors=int(total_visitors * avg_direct / 100), percentage=round(avg_direct, 1)),
        TrafficSourceResponse(source="Google Search", visitors=int(total_visitors * avg_google / 100), percentage=round(avg_google, 1)),
        TrafficSourceResponse(source="Social Media", visitors=int(total_visitors * avg_social / 100), percentage=round(avg_social, 1)),
        TrafficSourceResponse(source="Referral", visitors=int(total_visitors * avg_referral / 100), percentage=round(avg_referral, 1)),
    ]

    if recent_snapshots:
        avg_desktop = sum(s.device_desktop for s in recent_snapshots) / n
        avg_mobile = sum(s.device_mobile for s in recent_snapshots) / n
        avg_tablet = sum(s.device_tablet for s in recent_snapshots) / n
    else:
        avg_desktop, avg_mobile, avg_tablet = 58.0, 32.0, 10.0

    devices = [
        DeviceResponse(name="Desktop", percentage=round(avg_desktop, 1)),
        DeviceResponse(name="Mobile", percentage=round(avg_mobile, 1)),
        DeviceResponse(name="Tablet", percentage=round(avg_tablet, 1)),
    ]

    return DashboardResponse(
        stats=stats,
        recent_applications=recent_applications,
        traffic_sources=traffic_sources,
        devices=devices,
    )
