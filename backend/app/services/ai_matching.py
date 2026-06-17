import json
from typing import Tuple, Dict, Any, Optional
from anthropic import AsyncAnthropic
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models.models import StudentProfile, Event

MATCHING_SYSTEM_PROMPT = """
You are an advanced career matching AI assistant. 
Your task is to review a student's profile (including interests, skills, department, and career goals) and an event's details (title, description, category, and eligibility).

You must calculate a matching relevance score between 0.0 and 1.0 (where 1.0 is a perfect fit, and 0.0 is completely irrelevant) and write a concise, one-sentence reason explaining the match to the student.

You must return EXACTLY a JSON object matching this schema. Do not output any preamble or extra text.

JSON Schema:
{
  "relevance_score": 0.95, // float between 0.0 and 1.0
  "reason": "Matches your interest in Machine Learning & React development" // one sentence explanation, speaking directly to the student
}
"""

def heuristic_pre_filter(student: StudentProfile, student_user_dept: Optional[str], student_user_year: Optional[int], event: Event) -> bool:
    """
    Returns True if the student passes basic criteria, False otherwise.
    Used to save cost and avoid calling LLM for completely mismatched events.
    """
    # 1. Department eligibility check
    if event.eligible_departments:
        # If student has no department specified, or is not in the list, skip
        if not student_user_dept or student_user_dept not in event.eligible_departments:
            return False
            
    # 2. Year eligibility check
    if event.eligible_years:
        if not student_user_year or student_user_year not in event.eligible_years:
            return False
            
    return True


async def compute_relevance_match(student: StudentProfile, student_user_dept: Optional[str], student_user_year: Optional[int], event: Event) -> Tuple[float, str]:
    """
    Computes matching score and reason for student/event pair.
    Uses Claude API with a local fallback score calculation.
    """
    # 1. Run heuristic pre-filter
    if not heuristic_pre_filter(student, student_user_dept, student_user_year, event):
        return 0.0, "Does not match your department or year eligibility criteria."
        
    # 2. If no Claude API key, calculate via heuristic
    if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY.startswith("your_"):
        return get_heuristic_score(student, event)
        
    # 3. Call Claude API
    student_info = {
        "interests": student.interests or [],
        "skills": student.skills or [],
        "department": student_user_dept,
        "year": student_user_year,
        "career_goals": student.career_goals or ""
    }
    
    event_info = {
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "eligible_departments": event.eligible_departments,
        "eligible_years": event.eligible_years
    }
    
    try:
        client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = await client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=512,
            system=MATCHING_SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": f"Calculate match for:\nStudent: {json.dumps(student_info)}\nEvent: {json.dumps(event_info)}"}
            ],
            temperature=0.0
        )
        
        content = response.content[0].text.strip()
        if content.startswith("```"):
            lines = content.splitlines()
            if lines[0].startswith("```"):
                content = "\n".join(lines[1:-1])
                
        match_data = json.loads(content)
        return float(match_data.get("relevance_score", 0.5)), match_data.get("reason", "Matches your profile interests.")
        
    except Exception as e:
        print(f"Claude API Matching failed: {e}. Falling back to heuristic scoring.")
        return get_heuristic_score(student, event)


def get_heuristic_score(student: StudentProfile, event: Event) -> Tuple[float, str]:
    """Calculates matching score based on keyword intersection."""
    matched_tags = []
    
    student_interests = [i.lower() for i in (student.interests or [])]
    student_skills = [s.lower() for s in (student.skills or [])]
    all_student_keywords = set(student_interests + student_skills)
    
    event_text = (event.title + " " + event.description).lower()
    
    for word in all_student_keywords:
        if word in event_text:
            matched_tags.append(word)
            
    if matched_tags:
        matched_tags = sorted(matched_tags)
        reason = f"Matches your interest in {', '.join(matched_tags[:2])}."
        score = 0.5 + 0.1 * len(matched_tags)
        score = min(score, 0.98)
    else:
        reason = "Recommended based on your course and department eligibility."
        score = 0.3
        
    return score, reason


async def run_matching_for_student(db: AsyncSession, email: str, recalculate: bool = False) -> int:
    """
    Calculates relevance matches between a specific student profile (by email) 
    and all events in the database, saving matches to event_matches table.
    """
    from sqlalchemy import select, delete
    from app.db.models.models import User, StudentProfile, Event, EventMatch, MatchStatus
    
    # 1. Fetch user by email
    user_res = await db.execute(select(User).where(User.email == email))
    user = user_res.scalar_one_or_none()
    if not user:
        print(f"User not found for email: {email}")
        return 0
        
    # 2. Fetch student profile
    profile_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
    student = profile_res.scalar_one_or_none()
    if not student:
        print(f"Student profile not found for user: {email}")
        return 0
        
    # If recalculating, delete all existing matches for this student that are not registered
    if recalculate:
        await db.execute(
            delete(EventMatch).where(
                EventMatch.student_id == student.id,
                EventMatch.status != MatchStatus.REGISTERED
            )
        )
        await db.flush()
        
    # 3. Fetch all events
    events_res = await db.execute(select(Event))
    events = events_res.scalars().all()
    print(f"Found {len(events)} events in database. Calculating matches for {email}...")
    
    match_count = 0
    for event in events:
        # Check if match already exists
        exist_res = await db.execute(
            select(EventMatch).where(
                EventMatch.student_id == student.id,
                EventMatch.event_id == event.id
            )
        )
        if exist_res.scalar_one_or_none():
            # Already matched, skip
            continue
            
        score, reason = await compute_relevance_match(student, user.department, user.year, event)
        
        # Save to DB if score >= 0.5
        if score >= 0.5:
            match = EventMatch(
                event_id=event.id,
                student_id=student.id,
                relevance_score=score,
                reason=reason,
                status=MatchStatus.RECOMMENDED
            )
            db.add(match)
            match_count += 1
            print(f"Match created: '{event.title}' -> Score: {score}, Reason: {reason}")
            
    await db.commit()
    return match_count


if __name__ == "__main__":
    import asyncio
    import sys
    from app.db.session import SessionLocal
    
    # Allow passing email as CLI argument
    email_arg = sys.argv[1] if len(sys.argv) > 1 else "xyz@dau.ac.in"
    
    async def main():
        print(f"Starting manual matching for: {email_arg}")
        async with SessionLocal() as db:
            count = await run_matching_for_student(db, email_arg)
            print(f"Manually processed: {count} new matches.")
            
    asyncio.run(main())
