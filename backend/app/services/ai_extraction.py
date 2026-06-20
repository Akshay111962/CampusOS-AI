import json
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple
from google import genai
from google.genai import types

from app.core.config import settings
from app.db.models.models import EventCategory

# Prompt to enforce structured output from Claude
EXTRACTION_SYSTEM_PROMPT = """
You are an advanced AI information extractor for a university campus portal. 
Your task is to take raw announcement text (from a website notice or email) and extract structured opportunity details.

You must return EXACTLY a JSON object matching this schema. Do not output any preamble, markdown formatting (like ```json), or explanatory text. Just output raw JSON.

JSON Schema:
{
  "title": "Clean, descriptive event title",
  "description": "Comprehensive event summary/description",
  "category": "one of: workshop, hackathon, lecture, alumni_meet, competition, summer_school",
  "eligible_departments": ["List of eligible departments", "e.g. Computer Science, Mechanical Engineering. Use empty list [] if open to all."],
  "eligible_years": [1, 2, 3, 4], // list of integer years eligible. Use [1, 2, 3, 4] if open to all.
  "start_date": "ISO-8601 string, e.g. 2026-06-15T10:00:00",
  "registration_deadline": "ISO-8601 string, e.g. 2026-06-14T23:59:00",
  "registration_link": "URL string if found, otherwise null"
}

Ensure dates are parsed logically. If the raw text mentions a year is 2026, use 2026. If the year is unspecified, default to 2026. If the time is not specified, default to 09:00:00 for start_date and 23:59:59 for registration_deadline.
"""

async def extract_event_from_text(raw_text: str) -> Tuple[Dict[str, Any], float]:
    """
    Sends raw text to Claude API and extracts structured event dictionary.
    Returns: (event_dict, confidence_score)
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("your_"):
        print("WARNING: Gemini API Key not set. Using fallback heuristic extraction.")
        return get_fallback_extraction(raw_text), 0.5

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Extract details from this raw announcement text:\n\n{raw_text}",
            config=types.GenerateContentConfig(
                system_instruction=EXTRACTION_SYSTEM_PROMPT,
                temperature=0.0,
                max_output_tokens=2048,
                response_mime_type="application/json"
            )
        )

        content = response.text.strip()
        if content.startswith("```"):
            lines = content.splitlines()
            content = "\n".join(lines[1:-1])

        event_data = json.loads(content)
        return event_data, 0.95

    except Exception as e:
        print(f"Gemini API Ingestion Extraction failed: {e}. Using fallback.")
        return get_fallback_extraction(raw_text), 0.3


_MONTH_MAP = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
}

def _parse_named_month(month_str: str, year_str: str, day_str: str) -> str:
    """Convert month name + year + day into an ISO date string."""
    month = _MONTH_MAP.get(month_str.lower(), 1)
    return f"{int(year_str)}-{month:02d}-{int(day_str):02d}"


def get_fallback_extraction(raw_text: str) -> Dict[str, Any]:
    """Heuristic fallback extraction logic when Claude API is offline/unavailable."""
    text_lower = raw_text.lower()
    
    # 1. Deduce category
    category = "workshop"
    for cat in EventCategory:
        if cat.value in text_lower:
            category = cat.value
            break
    if "hackathon" in text_lower or "devfest" in text_lower:
        category = "hackathon"
    elif "speaker" in text_lower or "lecture" in text_lower:
        category = "lecture"
    elif "internship" in text_lower or "cohort" in text_lower:
        category = "summer_school"

    # 2. Parse real dates from text using regex
    import re as _re

    start_date = None
    deadline = None

    # Match patterns: "09/06/2026", "09-06-2026", "June 9, 2026", "9 June 2026", "2026-06-09"
    date_patterns = [
        # DD/MM/YYYY or DD-MM-YYYY
        (_re.compile(r'\b(\d{1,2})[/\-](\d{1,2})[/\-](20\d{2})\b'), lambda m: f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"),
        # YYYY-MM-DD
        (_re.compile(r'\b(20\d{2})[/\-](\d{1,2})[/\-](\d{1,2})\b'), lambda m: f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"),
        # Month DD, YYYY  or  DD Month YYYY
        (_re.compile(
            r'\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(20\d{2})\b',
            _re.IGNORECASE
        ), lambda m: _parse_named_month(m.group(2), m.group(3), m.group(1))),
        (_re.compile(
            r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})\b',
            _re.IGNORECASE
        ), lambda m: _parse_named_month(m.group(1), m.group(3), m.group(2))),
    ]

    found_dates = []
    for pattern, formatter in date_patterns:
        for match in pattern.finditer(raw_text):
            try:
                date_str = formatter(match)
                dt = datetime.fromisoformat(date_str)
                found_dates.append(dt)
            except Exception:
                pass

    found_dates = sorted(set(found_dates))

    if found_dates:
        start_date = found_dates[0].replace(hour=9, minute=0, second=0)
        # Registration deadline = day before start (or same day if only one date)
        deadline = (found_dates[0] - timedelta(days=2)).replace(hour=23, minute=59, second=59)
        if deadline < datetime.now():
            deadline = start_date - timedelta(days=1)
    else:
        # Last resort fallback
        start_date = datetime.now() + timedelta(days=7)
        deadline = datetime.now() + timedelta(days=5)

    # 3. Clean Title, Description, and Link extraction
    title = "Scraped Opportunity Announcement"
    title_line = None
    for line in raw_text.splitlines():
        if line.strip().startswith("Title:"):
            title_line = line.strip()[6:].strip()
            break
    if title_line:
        title = title_line
    else:
        for line in raw_text.splitlines():
            line_clean = line.strip()
            if line_clean and not line_clean.startswith("URL:") and not line_clean.startswith("Links:"):
                title = line_clean[:200]
                break

    # Extract clean description (content text)
    desc_lines = []
    in_content = False
    for line in raw_text.splitlines():
        line_clean = line.strip()
        if line_clean.startswith("Content:"):
            in_content = True
            desc_lines.append(line_clean[8:].strip())
            continue
        if line_clean.startswith("Links:") or line_clean.startswith("URL:") or line_clean.startswith("Title:"):
            in_content = False
            continue
        if in_content and line_clean:
            desc_lines.append(line_clean)
    description = "\n".join(desc_lines) if desc_lines else raw_text[:1000]

    # Find external registration link
    registration_link = None
    import re
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', raw_text)
    event_url = None
    for line in raw_text.splitlines():
        if line.strip().startswith("URL:"):
            event_url = line.strip()[4:].strip()
            break
    for url in urls:
        if url != event_url and "/events/" not in url:
            registration_link = url
            break
    if not registration_link and event_url:
        registration_link = event_url

    # 4. Eligible departments
    eligible_depts = []
    if "computer science" in text_lower or "cse" in text_lower or "software" in text_lower:
        eligible_depts.append("Computer Science")
    if "design" in text_lower or "figma" in text_lower:
        eligible_depts.append("Design")
        
    # 5. Eligible years
    eligible_years = [1, 2, 3, 4]
    if "freshman" in text_lower or "first year" in text_lower:
        eligible_years = [1]
    elif "final year" in text_lower or "senior" in text_lower:
        eligible_years = [4]

    return {
        "title": title,
        "description": description,
        "category": category,
        "eligible_departments": eligible_depts,
        "eligible_years": eligible_years,
        "start_date": start_date.isoformat(),
        "registration_deadline": deadline.isoformat(),
        "registration_link": registration_link or "http://dau.ac.in/events"
    }
