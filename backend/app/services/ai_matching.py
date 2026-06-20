import json
import re
from typing import Tuple, Dict, Any, Optional
from google import genai
from google.genai import types
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

def heuristic_pre_filter(
    student: StudentProfile,
    student_user_dept: Optional[str],
    student_user_year: Optional[int],
    event: Event
) -> tuple[bool, bool]:
    """
    Returns (passes_filter, dept_matched).
    - passes_filter=False only when year is explicitly out of range.
    - dept_matched=False when department is not in the list (soft penalty, not a hard block).
    This allows interest/skill matches to surface events even if department doesn't match.
    """
    dept_matched = True

    # 1. Department eligibility — soft check (penalty applied later, not a hard block)
    if event.eligible_departments and student_user_dept:
        if student_user_dept not in event.eligible_departments:
            dept_matched = False  # will reduce score but not exclude

    # 2. Year eligibility — hard check (must pass)
    if event.eligible_years:
        if not student_user_year or student_user_year not in event.eligible_years:
            return False, dept_matched

    return True, dept_matched


async def compute_relevance_match(
    student: StudentProfile,
    student_user_dept: Optional[str],
    student_user_year: Optional[int],
    event: Event,
    force_heuristic: bool = False
) -> Tuple[float, str, bool]:
    """
    Computes matching score and reason for student/event pair.
    Uses Gemini API with a local fallback heuristic score calculation.
    Returns (score, reason, rate_limited).
    """
    # 1. Run heuristic pre-filter (year is hard-block; dept is a soft penalty)
    passes, dept_matched = heuristic_pre_filter(student, student_user_dept, student_user_year, event)
    if not passes:
        return 0.0, "Does not match your year eligibility criteria.", False

    # 2. If force_heuristic or no Gemini API key, calculate via heuristic
    if force_heuristic or not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("your_"):
        score, reason = get_heuristic_score(student, event)
        if not dept_matched:
            score = max(0.0, score - 0.15)  # soft penalty for dept mismatch
        return score, reason, False

    # 3. Call Gemini API
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
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Calculate match for:\nStudent: {json.dumps(student_info)}\nEvent: {json.dumps(event_info)}",
            config=types.GenerateContentConfig(
                system_instruction=MATCHING_SYSTEM_PROMPT,
                temperature=0.0,
                max_output_tokens=512,
                response_mime_type="application/json"
            )
        )

        content = response.text.strip()
        if content.startswith("```"):
            lines = content.splitlines()
            content = "\n".join(lines[1:-1])

        match_data = json.loads(content)
        score = float(match_data.get("relevance_score", 0.5))
        reason = match_data.get("reason", "Matches your profile interests.")

        # Apply soft dept penalty after Gemini scores
        if not dept_matched:
            score = max(0.0, score - 0.15)

        return score, reason, False

    except Exception as e:
        err_msg = str(e)
        hit_rate_limit = "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg.upper() or "QUOTA" in err_msg.upper()
        if hit_rate_limit:
            print(f"Gemini API Rate Limit hit ({e}). Bypassing further Gemini API calls for this run.")
        else:
            print(f"Gemini API Matching failed: {e}. Falling back to heuristic scoring.")
            
        score, reason = get_heuristic_score(student, event)
        if not dept_matched:
            score = max(0.0, score - 0.15)
        return score, reason, hit_rate_limit


def is_keyword_matched(keyword: str, text: str) -> bool:
    """
    Checks if a keyword or phrase exists in a text, matching whole words/phrases.
    Handles special characters like C++ or UI/UX correctly.
    """
    keyword = keyword.lower().strip()
    text = text.lower()
    if not keyword or not text:
        return False
        
    if keyword.isalnum():
        pattern = r'\b' + re.escape(keyword) + r'\b'
        return bool(re.search(pattern, text))
    else:
        # Non-alphanumeric matching using boundary lookaround checks
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(keyword) + r'(?![a-zA-Z0-9])'
        return bool(re.search(pattern, text))


def get_heuristic_score(student: StudentProfile, event: Event) -> Tuple[float, str]:
    """
    Calculates matching score based on keyword intersection between student
    interests/skills/career_goals and the event title + description.
    """
    matched_interests: list[str] = []
    matched_skills: list[str] = []

    student_interests = [i.strip() for i in (student.interests or []) if i.strip()]
    student_skills = [s.strip() for s in (student.skills or []) if s.strip()]

    # Include career goals words as extra signals
    goals_text = (student.career_goals or "").lower()
    goals_keywords = [w for w in goals_text.split() if len(w) > 3]

    event_text = (event.title + " " + event.description).lower()

    for interest in student_interests:
        if is_keyword_matched(interest, event_text):
            matched_interests.append(interest)

    for skill in student_skills:
        if is_keyword_matched(skill, event_text):
            matched_skills.append(skill)

    # Goals bonus
    goals_match = any(kw in event_text for kw in goals_keywords)

    total_matched = len(matched_interests) + len(matched_skills)

    if total_matched > 0 or goals_match:
        # Build dynamic reason
        all_matched = matched_interests[:2] + matched_skills[:2]
        if matched_interests and matched_skills:
            reason = f"Matches your interest in {matched_interests[0]} and skill in {matched_skills[0]}."
        elif matched_interests:
            reason = f"Matches your interest in {', '.join(matched_interests[:2])}."
        elif matched_skills:
            reason = f"High fit for your skill set in {', '.join(matched_skills[:2])}."
        else:
            reason = "Aligns with your stated career goals."

        # Score: 0.55 base + 0.1 per match, capped at 0.98
        score = 0.55 + 0.1 * total_matched + (0.05 if goals_match else 0)
        score = min(score, 0.98)
    else:
        reason = "Recommended based on your department and year eligibility."
        score = 0.50  # still crosses the 0.5 threshold so it shows in recommendations

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
    force_heuristic = False
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
            
        score, reason, rate_limited = await compute_relevance_match(
            student, user.department, user.year, event, force_heuristic=force_heuristic
        )
        if rate_limited:
            force_heuristic = True
        
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
