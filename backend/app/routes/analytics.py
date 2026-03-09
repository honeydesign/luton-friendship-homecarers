from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Admin, Job, Application
from app.services.auth_service import get_current_admin

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

def fmt_duration(seconds: int) -> str:
    mins = seconds // 60
    secs = seconds % 60
    return f"{mins}m {secs}s" if mins > 0 else f"{secs}s"

def get_date_range(period: str):
    now = datetime.utcnow()
    if period == 'today':
        return now - timedelta(days=1)
    elif period == 'month':
        return now - timedelta(days=30)
    elif period == 'total':
        return now - timedelta(days=3650)
    return now - timedelta(days=7)  # default week

@router.get("")
def get_analytics(
    period: str = 'week',
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    since = get_date_range(period)

    # Visitors and page views
    total_visitors = db.execute(text("SELECT COUNT(*) FROM site_visits WHERE visited_at >= :s"), {"s": since}).scalar() or 0
    total_pageviews = db.execute(text("SELECT COUNT(*) FROM page_views WHERE viewed_at >= :s"), {"s": since}).scalar() or 0
    total_applications = db.execute(text("SELECT COUNT(*) FROM applications")).scalar() or 0

    # Conversion rate
    conversion_rate = round((total_applications / total_visitors * 100), 1) if total_visitors > 0 else 0.0

    # Daily views for chart (last 7 days)
    daily = db.execute(text("""
        SELECT DATE(viewed_at) as day, COUNT(*) as views
        FROM page_views WHERE viewed_at >= :s
        GROUP BY DATE(viewed_at) ORDER BY day
    """), {"s": since}).fetchall()

    # Traffic sources
    sources = db.execute(text("""
        SELECT referrer, COUNT(*) as count FROM site_visits
        WHERE visited_at >= :s GROUP BY referrer ORDER BY count DESC
    """), {"s": since}).fetchall()

    # Devices
    devices = db.execute(text("""
        SELECT device, COUNT(*) as count FROM site_visits
        WHERE visited_at >= :s GROUP BY device ORDER BY count DESC
    """), {"s": since}).fetchall()

    # Top pages
    top_pages = db.execute(text("""
        SELECT page, COUNT(*) as views, COUNT(DISTINCT session_id) as unique_visitors
        FROM page_views WHERE viewed_at >= :s
        GROUP BY page ORDER BY views DESC LIMIT 5
    """), {"s": since}).fetchall()

    # Popular jobs
    jobs = db.execute(text("""
        SELECT j.title, COUNT(a.id) as applications
        FROM jobs j LEFT JOIN applications a ON a.job_id = j.id
        GROUP BY j.id, j.title ORDER BY applications DESC LIMIT 5
    """)).fetchall()

    total_source = sum(r[1] for r in sources) or 1
    total_device = sum(r[1] for r in devices) or 1

    return {
        "stats": {
            "visitors": total_visitors,
            "page_views": total_pageviews,
            "bounce_rate": "N/A",
            "avg_duration": "N/A",
            "applications": total_applications,
            "conversion_rate": f"{conversion_rate}%"
        },
        "daily_views": [{"day": str(r[0]), "views": r[1]} for r in daily],
        "traffic_sources": [{"source": r[0] or "Direct", "visitors": r[1], "percentage": round(r[1]/total_source*100)} for r in sources],
        "devices": [{"name": r[0].capitalize(), "percentage": round(r[1]/total_device*100)} for r in devices],
        "top_pages": [{"page": r[0], "views": r[1], "unique_visitors": r[2], "avg_time": "N/A", "bounce_rate": "N/A"} for r in top_pages],
        "popular_jobs": [{"title": r[0], "applications": r[1], "views": 0} for r in jobs]
    }

@router.get("/dashboard")
def get_dashboard_data(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_jobs = db.query(Job).filter(Job.is_active == True).count()
    total_applications = db.query(Application).count()
    new_applications = db.query(Application).filter(Application.status == "New").count()
    recent_apps = db.query(Application).order_by(Application.applied_at.desc()).limit(5).all()
    recent_applications = [
        {
            "id": app.id,
            "name": app.name,
            "position": app.job.title if app.job else "Unknown",
            "date": app.applied_at.isoformat(),
            "status": app.status
        }
        for app in recent_apps
    ]
    return {
        "stats": {
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "new_applications": new_applications
        },
        "recent_applications": recent_applications
    }
