import hashlib
import urllib.parse
from datetime import datetime, timedelta
import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.models import (
    Event,
    IngestionLog,
    IngestionSource,
    IngestionStatus,
    StudentProfile,
    User,
    EventMatch,
    MatchStatus,
    EventSource
)
from app.services.ai_extraction import extract_event_from_text
from app.services.ai_matching import compute_relevance_match

def clean_text(text: str) -> str:
    """
    Sanitizes string text to fit into WIN1252 encoding (used by Windows PostgreSQL).
    Replaces common symbols like the Rupee symbol and smart quotes.
    """
    if not text:
        return ""
    text = (
        text.replace("₹", "Rs.")
        .replace("–", "-")
        .replace("—", "-")
        .replace("‘", "'")
        .replace("’", "'")
        .replace("“", '"')
        .replace("”", '"')
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("→", "->")
        .replace("←", "<-")
        .replace("•", "-")
        .replace("…", "...")
        .replace("×", "x")
        .replace("©", "(c)")
        .replace("®", "(R)")
        .replace("™", "(TM)")
    )
    return text.encode("cp1252", errors="ignore").decode("cp1252")

def clean_list(lst):
    """Sanitizes a list of strings."""
    if not lst:
        return lst
    return [clean_text(item) for item in lst]

async def run_scraper_pipeline(db: AsyncSession) -> int:
    """
    Scrapes live events from https://www.daiict.ac.in/, extracts structured data
    using the AI extraction service, deduplicates, saves to database, logs results,
    and runs student matching.
    """
    homepage_url = "https://www.daiict.ac.in/"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/91.0.4472.124 Safari/537.36"
        )
    }
    
    new_events_count = 0
    
    try:
        async with httpx.AsyncClient(headers=headers, timeout=20) as client:
            # 1. Fetch homepage
            r = await client.get(homepage_url)
            if r.status_code != 200:
                print(f"Failed to fetch DA-IICT homepage. Status: {r.status_code}")
                return 0
                
            soup = BeautifulSoup(r.text, "html.parser")
            
            # Find all event items
            event_items = soup.find_all("div", class_="daiictEventItem")
            event_links = []
            for item in event_items:
                a_tag = item.find("a", href=True)
                if a_tag and "events/" in a_tag["href"]:
                    href = a_tag["href"]
                    full_url = urllib.parse.urljoin(homepage_url, href)
                    if full_url not in event_links:
                        event_links.append(full_url)
                        
            print(f"Found {len(event_links)} event links to scrape.")
            
            # 2. Scrape each event page
            for url in event_links:
                raw_payload_clean = ""
                try:
                    # Always re-scrape and upsert — do not skip based on ingestion logs.
                    # This ensures event data is refreshed every scrape cycle.
                        
                    print(f"Scraping event page: {url}")
                    event_res = await client.get(url)
                    if event_res.status_code != 200:
                        failed_log = IngestionLog(
                            source=IngestionSource.SCRAPER,
                            raw_payload=clean_text(f"URL: {url}\nFailed to fetch event page. HTTP Status: {event_res.status_code}"),
                            status=IngestionStatus.FAILED
                        )
                        db.add(failed_log)
                        await db.commit()
                        continue
                        
                    event_soup = BeautifulSoup(event_res.text, "html.parser")
                    inner = event_soup.find(class_="eventsInnerContent")
                    
                    if inner:
                        # Find title and dates
                        title_tag = inner.find("h2")
                        title_str = title_tag.text.strip() if title_tag else ""
                        
                        # Content body text
                        body_text = inner.text.strip()
                        
                        # Find all links
                        links = inner.find_all("a", href=True)
                        links_text = "\n".join([
                            f"Link: {urllib.parse.urljoin(url, a['href'])} ({a.text.strip()})"
                            for a in links
                        ])
                        
                        raw_payload = (
                            f"URL: {url}\n"
                            f"Title: {title_str}\n"
                            f"Content:\n{body_text}\n"
                            f"Links:\n{links_text}"
                        )
                    else:
                        body_text = event_soup.text.strip()
                        raw_payload = f"URL: {url}\nContent:\n{body_text}"
                        
                    raw_payload_clean = clean_text(raw_payload)
                    
                    # 3. Call AI extraction service to extract structured fields
                    event_data, confidence = await extract_event_from_text(raw_payload_clean)
                    
                    start_date_parsed = (
                        datetime.fromisoformat(event_data["start_date"])
                        if isinstance(event_data["start_date"], str)
                        else event_data["start_date"]
                    )
                    
                    registration_deadline_parsed = (
                        datetime.fromisoformat(event_data["registration_deadline"])
                        if isinstance(event_data["registration_deadline"], str)
                        else event_data["registration_deadline"]
                    )
                    
                    # 4. Upsert: find existing event by title; update if found, insert if not
                    cleaned_title = clean_text(event_data["title"])
                    event_dup_result = await db.execute(
                        select(Event).where(Event.title == cleaned_title)
                    )
                    existing_event = event_dup_result.scalar_one_or_none()

                    if existing_event:
                        # UPDATE existing event with fresh scraped data
                        existing_event.description = clean_text(event_data["description"])
                        existing_event.category = event_data["category"]
                        existing_event.eligible_departments = clean_list(event_data["eligible_departments"])
                        existing_event.eligible_years = event_data["eligible_years"]
                        existing_event.start_date = start_date_parsed
                        existing_event.registration_deadline = registration_deadline_parsed
                        existing_event.registration_link = clean_text(event_data["registration_link"])
                        existing_event.raw_source_text = raw_payload_clean
                        existing_event.extraction_confidence = confidence
                        db_event = existing_event
                        print(f"Updated existing event: {cleaned_title}")

                        # Log as duplicate (updated)
                        ingest_log = IngestionLog(
                            source=IngestionSource.SCRAPER,
                            raw_payload=raw_payload_clean,
                            extracted_event_id=db_event.id,
                            status=IngestionStatus.DUPLICATE
                        )
                        db.add(ingest_log)
                        await db.commit()
                        continue  # Skip re-running matching for already-known events

                    # INSERT new event
                    db_event = Event(
                        title=cleaned_title,
                        description=clean_text(event_data["description"]),
                        category=event_data["category"],
                        eligible_departments=clean_list(event_data["eligible_departments"]),
                        eligible_years=event_data["eligible_years"],
                        start_date=start_date_parsed,
                        registration_deadline=registration_deadline_parsed,
                        registration_link=clean_text(event_data["registration_link"]),
                        source=EventSource.WEBSITE,
                        raw_source_text=raw_payload_clean,
                        extraction_confidence=confidence
                    )

                    db.add(db_event)
                    await db.flush()  # Get db_event.id

                    # Create Ingestion Log
                    ingest_log = IngestionLog(
                        source=IngestionSource.SCRAPER,
                        raw_payload=raw_payload_clean,
                        extracted_event_id=db_event.id,
                        status=IngestionStatus.SUCCESS
                    )
                    db.add(ingest_log)
                    
                    # 5. Trigger AI Matching for all students automatically
                    students_res = await db.execute(select(StudentProfile))
                    students = students_res.scalars().all()
                    for student in students:
                        user_res = await db.execute(
                            select(User).where(User.id == student.user_id)
                        )
                        user = user_res.scalar_one_or_none()
                        if not user:
                            continue
                            
                        score, reason = await compute_relevance_match(
                            student, user.department, user.year, db_event
                        )
                        
                        if score >= 0.5: # matching threshold
                            match = EventMatch(
                                event_id=db_event.id,
                                student_id=student.id,
                                relevance_score=score,
                                reason=clean_text(reason),
                                status=MatchStatus.RECOMMENDED
                            )
                            db.add(match)
                    
                    await db.commit()
                    new_events_count += 1
                    print(f"Successfully scraped and saved new event: {cleaned_title}")
                    
                except Exception as e:
                    print(f"Error processing event URL {url}: {e}")
                    await db.rollback()
                    try:
                        failed_log = IngestionLog(
                            source=IngestionSource.SCRAPER,
                            raw_payload=raw_payload_clean or clean_text(f"URL: {url}\nError: {str(e)}"),
                            status=IngestionStatus.FAILED
                        )
                        db.add(failed_log)
                        await db.commit()
                    except Exception as log_err:
                        print(f"Failed to log failure: {log_err}")
                        await db.rollback()
                        
    except Exception as e:
        print(f"Scraper pipeline main loop failed: {e}")
        
    return new_events_count

if __name__ == "__main__":
    import asyncio
    from app.db.session import SessionLocal
    
    async def main():
        print("Starting manual scrape of DA-IICT events...")
        async with SessionLocal() as db:
            count = await run_scraper_pipeline(db)
            print(f"Manually processed: {count} new events.")
            
    asyncio.run(main())
