import asyncio
from app.workers.celery_app import celery_app
from app.db.session import SessionLocal, engine
from app.services.scraper import run_scraper_pipeline
from app.services.gmail_reader import poll_gmail_inboxes
from app.services.notifications import run_notification_dispatch


@celery_app.task(name="app.workers.tasks.task_run_scraper")
def task_run_scraper() -> str:
    """Trigger periodic notice scraper pipeline."""
    async def run_async():
        try:
            async with SessionLocal() as db:
                new_events = await run_scraper_pipeline(db)
                return f"Scraper completed. Processed {new_events} new opportunities."
        finally:
            await engine.dispose()
    return asyncio.run(run_async())


@celery_app.task(name="app.workers.tasks.task_poll_gmail")
def task_poll_gmail() -> str:
    """Trigger periodic unread Gmail inbox reading."""
    async def run_async():
        try:
            async with SessionLocal() as db:
                new_events = await poll_gmail_inboxes(db)
                return f"Gmail poller completed. Extracted {new_events} events from connected inboxes."
        finally:
            await engine.dispose()
    return asyncio.run(run_async())


@celery_app.task(name="app.workers.tasks.task_dispatch_notifications")
def task_dispatch_notifications() -> str:
    """Runs periodic matches notifier checking matches above threshold."""
    async def run_async():
        try:
            async with SessionLocal() as db:
                sent_count = await run_notification_dispatch(db, relevance_threshold=0.7)
                return f"Notification dispatch completed. Sent alerts to {sent_count} students."
        finally:
            await engine.dispose()
    return asyncio.run(run_async())


@celery_app.task(name="app.workers.tasks.task_recalculate_matching")
def task_recalculate_matching(email: str) -> str:
    """Recalculate opportunity matching scores for a student profile asynchronously."""
    from app.services.ai_matching import run_matching_for_student
    async def run_async():
        try:
            async with SessionLocal() as db:
                count = await run_matching_for_student(db, email, recalculate=True)
                return f"Asynchronous matching completed. Found {count} matching opportunities for {email}."
        finally:
            await engine.dispose()
    return asyncio.run(run_async())


