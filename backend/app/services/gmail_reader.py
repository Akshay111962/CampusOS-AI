import json
from datetime import datetime, timedelta
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.core.config import settings
from app.core.security import decrypt_token
from app.db.models.models import GmailToken, User, StudentProfile, IngestionLog, IngestionSource, IngestionStatus, Event, EventSource, MatchStatus, EventMatch
from app.services.ai_extraction import extract_event_from_text
from app.services.ai_matching import compute_relevance_match

async def poll_gmail_inboxes(db: AsyncSession) -> int:
    """
    Finds all users who connected Gmail, decrypts their tokens,
    polls their unread messages, extracts events via AI, and logs.
    """
    # 1. Fetch connected Gmail accounts
    result = await db.execute(select(GmailToken))
    tokens = result.scalars().all()
    total_new_events = 0
    
    for token_record in tokens:
        try:
            # Decrypt access and refresh tokens
            access_token = decrypt_token(token_record.encrypted_access_token)
            refresh_token = decrypt_token(token_record.encrypted_refresh_token)
            
            # If tokens are mock tokens (for sandbox/dev), use simulated email reading
            if "mock_" in access_token or "mock_" in refresh_token:
                total_new_events += await simulate_gmail_polling(db, token_record.user_id)
                continue
                
            # Initialize real Google Credentials
            creds = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri=token_record.token_uri,
                client_id=token_record.client_id,
                client_secret=token_record.client_secret,
                scopes=token_record.scopes
            )
            
            # 2. Build Gmail service
            service = build('gmail', 'v1', credentials=creds)
            
            # Query unread messages matching keywords: "registration", "workshop", "deadline", "hackathon"
            query = "is:unread (registration OR workshop OR deadline OR hackathon)"
            results = service.users().messages().list(userId='me', q=query).execute()
            messages = results.get('messages', [])
            
            for msg in messages:
                # Fetch full message payload
                msg_detail = service.users().messages().get(userId='me', id=msg['id'], format='full').execute()
                body = ""
                # Parse snippet or body part
                payload = msg_detail.get('payload', {})
                if 'body' in payload and payload['body'].get('data'):
                    import base64
                    body = base64.urlsafe_b64decode(payload['body']['data'].encode()).decode()
                else:
                    parts = payload.get('parts', [])
                    for part in parts:
                        if part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                            import base64
                            body = base64.urlsafe_b64decode(part['body']['data'].encode()).decode()
                            break
                            
                if not body:
                    body = msg_detail.get('snippet', '')
                    
                subject = ""
                headers = payload.get('headers', [])
                for header in headers:
                    if header['name'].lower() == 'subject':
                        subject = header['value']
                        break
                        
                # Process ingestion
                title_notice = f"Gmail Subject: {subject}"
                
                # Check duplicate
                dup_result = await db.execute(
                    select(IngestionLog).where(
                        IngestionLog.source == IngestionSource.GMAIL,
                        IngestionLog.raw_payload.like(f"%{subject}%")
                    )
                )
                if dup_result.scalar_one_or_none():
                    continue
                    
                # Create Log
                ingest_log = IngestionLog(
                    source=IngestionSource.GMAIL,
                    raw_payload=f"Subject: {subject}\nBody:\n{body}",
                    status=IngestionStatus.SUCCESS
                )
                db.add(ingest_log)
                await db.commit()
                await db.refresh(ingest_log)
                
                # Extract structured Event via Claude
                try:
                    event_data, confidence = await extract_event_from_text(body)
                    
                    # Deduplicate in Events table
                    start_date_parsed = datetime.fromisoformat(event_data["start_date"]) if isinstance(event_data["start_date"], str) else event_data["start_date"]
                    event_dup = await db.execute(
                        select(Event).where(
                            Event.title == event_data["title"],
                            Event.start_date == start_date_parsed
                        )
                    )
                    if event_dup.scalar_one_or_none():
                        ingest_log.status = IngestionStatus.DUPLICATE
                        await db.commit()
                        continue
                        
                    db_event = Event(
                        title=event_data["title"],
                        description=event_data["description"],
                        category=event_data["category"],
                        eligible_departments=event_data["eligible_departments"],
                        eligible_years=event_data["eligible_years"],
                        start_date=start_date_parsed,
                        registration_deadline=datetime.fromisoformat(event_data["registration_deadline"]) if isinstance(event_data["registration_deadline"], str) else event_data["registration_deadline"],
                        registration_link=event_data["registration_link"],
                        source=EventSource.EMAIL,
                        raw_source_text=body,
                        extraction_confidence=confidence
                    )
                    db.add(db_event)
                    await db.commit()
                    await db.refresh(db_event)
                    
                    ingest_log.extracted_event_id = db_event.id
                    await db.commit()
                    
                    # Trigger matches
                    students_res = await db.execute(select(StudentProfile))
                    for student in students_res.scalars().all():
                        user_res = await db.execute(select(User).where(User.id == student.user_id))
                        user = user_res.scalar_one()
                        
                        score, reason = await compute_relevance_match(student, user.department, user.year, db_event)
                        if score >= 0.5:
                            match = EventMatch(
                                event_id=db_event.id,
                                student_id=student.id,
                                relevance_score=score,
                                reason=reason,
                                status=MatchStatus.RECOMMENDED
                            )
                            db.add(match)
                            
                    await db.commit()
                    total_new_events += 1
                    
                    # Mark email as read / remove unread label
                    service.users().messages().batchModify(
                        userId='me',
                        body={'ids': [msg['id']], 'removeLabelIds': ['UNREAD']}
                    ).execute()
                    
                except Exception as e:
                    print(f"Error parsing email message {msg['id']}: {e}")
                    ingest_log.status = IngestionStatus.FAILED
                    await db.commit()
                    
        except Exception as outer_e:
            print(f"Failed to poll inbox for token {token_record.id}: {outer_e}")
            
    return total_new_events


async def simulate_gmail_polling(db: AsyncSession, user_id: Any) -> int:
    """Mock simulated email inbox reading for local testing and CI."""
    simulated_emails = [
        {
            "subject": "Register Now: Alumni Meetup 2026",
            "body": "Join us for the Annual Alumni Meetup 2026 on June 25, 2026. Interactive session with CSE graduates working at Netflix and Apple. All departments welcome, open to all student years. Registration closes June 22, 2026. Register at https://dau.ac.in/alumni"
        }
    ]
    new_count = 0
    
    for email in simulated_emails:
        # Check duplicate
        dup_result = await db.execute(
            select(IngestionLog).where(
                IngestionLog.source == IngestionSource.GMAIL,
                IngestionLog.raw_payload.like(f"%{email['subject']}%")
            )
        )
        if dup_result.scalar_one_or_none():
            continue
            
        ingest_log = IngestionLog(
            source=IngestionSource.GMAIL,
            raw_payload=f"Subject: {email['subject']}\nBody:\n{email['body']}",
            status=IngestionStatus.SUCCESS
        )
        db.add(ingest_log)
        await db.commit()
        await db.refresh(ingest_log)
        
        try:
            event_data, confidence = await extract_event_from_text(email['body'])
            start_date_parsed = datetime.fromisoformat(event_data["start_date"]) if isinstance(event_data["start_date"], str) else event_data["start_date"]
            
            db_event = Event(
                title=event_data["title"],
                description=event_data["description"],
                category=event_data["category"],
                eligible_departments=event_data["eligible_departments"],
                eligible_years=event_data["eligible_years"],
                start_date=start_date_parsed,
                registration_deadline=datetime.fromisoformat(event_data["registration_deadline"]) if isinstance(event_data["registration_deadline"], str) else event_data["registration_deadline"],
                registration_link=event_data["registration_link"],
                source=EventSource.EMAIL,
                raw_source_text=email['body'],
                extraction_confidence=confidence
            )
            db.add(db_event)
            await db.commit()
            await db.refresh(db_event)
            
            ingest_log.extracted_event_id = db_event.id
            await db.commit()
            
            # Trigger matches
            students_res = await db.execute(select(StudentProfile))
            for student in students_res.scalars().all():
                user_res = await db.execute(select(User).where(User.id == student.user_id))
                user = user_res.scalar_one()
                
                score, reason = await compute_relevance_match(student, user.department, user.year, db_event)
                if score >= 0.5:
                    match = EventMatch(
                        event_id=db_event.id,
                        student_id=student.id,
                        relevance_score=score,
                        reason=reason,
                        status=MatchStatus.RECOMMENDED
                    )
                    db.add(match)
            
            await db.commit()
            new_count += 1
        except Exception as e:
            print(f"Mock Gmail polling ingestion failed: {e}")
            ingest_log.status = IngestionStatus.FAILED
            await db.commit()
            
    return new_count
