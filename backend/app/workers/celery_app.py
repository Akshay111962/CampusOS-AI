from celery import Celery
from app.core.config import settings

# Initialize Celery app
celery_app = Celery(
    "campusos_workers",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    
    # Configure periodic tasks schedule (Celery Beat)
    beat_schedule={
        "poll-gmail-inboxes-every-15-min": {
            "task": "app.workers.tasks.task_poll_gmail",
            "schedule": 900.0,  # 15 minutes in seconds
        },
        "scrape-campus-notices-every-3-hours": {
            "task": "app.workers.tasks.task_run_scraper",
            "schedule": 10800.0, # 3 hours in seconds
        },
        "dispatch-notifications-every-10-min": {
            "task": "app.workers.tasks.task_dispatch_notifications",
            "schedule": 600.0,  # 10 minutes in seconds
        }
    }
)
