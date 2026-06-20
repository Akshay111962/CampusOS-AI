import re
from datetime import datetime
from typing import Any, List, Optional
from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from google.genai import types
from pydantic import BaseModel

from app.core.config import settings
from app.db.session import get_db
from app.db.models.models import User, Club, Event
from app.services.dau_knowledge import retrieve_relevant_chunks

router = APIRouter(prefix="/assistant", tags=["assistant"])
security = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# Auth dependency (optional — unauthenticated users can still chat)
# ---------------------------------------------------------------------------

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            return None
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user and user.is_verified:
            return user
    except Exception:
        pass
    return None


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class HistoryMessage(BaseModel):
    role: str          # "user" | "assistant"
    content: str

class QuestionRequest(BaseModel):
    question: str
    history: Optional[List[HistoryMessage]] = []  # last N turns for context

class OpportunityResponse(BaseModel):
    id: str
    title: str
    type: str
    organizer: str
    matchScore: int
    reason: str
    deadlineHours: int
    dateString: str
    location: str
    description: str
    tags: List[str]
    link: Optional[str] = None

class AskResponse(BaseModel):
    response: str
    matched_events: List[OpportunityResponse]
    sources: List[str] = []   # section names used from knowledge base


# ---------------------------------------------------------------------------
# DB relevance scoring (keyword TF-IDF style — no external deps)
# ---------------------------------------------------------------------------

_DB_STOPWORDS = {
    "what", "who", "whom", "whose", "which", "where", "when", "why", "how",
    "the", "and", "but", "for", "are", "you", "can", "join", "club", "clubs",
    "event", "events", "about", "there", "is", "a", "an", "of", "to", "in", "on",
    "any", "some", "many", "all", "my", "your", "their", "our", "his", "her",
    "do", "does", "did", "have", "has", "had", "be", "been", "was", "were",
    "this", "that", "with", "from", "at", "by", "or", "as", "if",
    "tell", "give", "show", "explain", "please", "help", "want", "need",
    "know", "get", "find", "me", "us", "its", "it"
}

def _tokenize_db(text: str) -> list[str]:
    tokens = [w.lower() for w in re.findall(r'\w+', text) if len(w) > 2]
    return [t for t in tokens if t not in _DB_STOPWORDS]

def compute_match_score(query: str, title: str, description: str) -> float:
    """Keyword frequency score for DB clubs/events."""
    query_tokens = set(_tokenize_db(query))
    if not query_tokens:
        return 0.0

    score = 0.0
    title_lower = title.lower()
    desc_lower = description.lower()

    for token in query_tokens:
        if token in title_lower:
            score += 5.0
        if token in desc_lower:
            score += 1.0

    return score


# ---------------------------------------------------------------------------
# Main RAG endpoint
# ---------------------------------------------------------------------------

@router.post("/ask", response_model=AskResponse)
async def ask_assistant(
    request: QuestionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> Any:
    question = request.question
    history = request.history or []

    # -----------------------------------------------------------------------
    # 1. RAG — retrieve relevant DAU knowledge base chunks
    # -----------------------------------------------------------------------
    kb_chunks = retrieve_relevant_chunks(question, top_k=4)
    sources_used = [c["section"] for c in kb_chunks]

    knowledge_context_str = "\n\n".join([
        f"[{c['section']}]\n{c['text']}"
        for c in kb_chunks
    ])

    # -----------------------------------------------------------------------
    # 2. DB retrieval — clubs and events with keyword scoring
    # -----------------------------------------------------------------------
    clubs_res = await db.execute(select(Club))
    clubs = clubs_res.scalars().all()

    events_res = await db.execute(select(Event))
    events = events_res.scalars().all()

    ranked_clubs = sorted(
        [(compute_match_score(question, c.name, c.description or ""), c) for c in clubs],
        key=lambda x: x[0], reverse=True
    )
    matched_clubs = [c for score, c in ranked_clubs if score > 0]

    ranked_events = sorted(
        [(compute_match_score(question, e.title, e.description or ""), e) for e in events],
        key=lambda x: x[0], reverse=True
    )
    matched_events = [e for score, e in ranked_events if score > 0]

    # Fallback: if no keyword matches, show top-5 from DB anyway for general coverage
    context_clubs = matched_clubs[:5] if matched_clubs else clubs[:3]
    context_events = matched_events[:5] if matched_events else events[:3]

    clubs_context_str = "\n".join([
        f"- Club/Committee: {c.name} | Category: {c.category} | "
        f"Description: {c.description} | Contact: {c.contact_info} | "
        f"How to Join: {c.how_to_join} | Link: {c.source_link}"
        for c in context_clubs
    ]) or "No clubs/committees found in database."

    events_context_str = "\n".join([
        f"- Event: {e.title} | Category: {e.category} | "
        f"Description: {e.description} | Deadline: {e.registration_deadline} | "
        f"Link: {e.registration_link}"
        for e in context_events
    ]) or "No upcoming events found in database."

    # -----------------------------------------------------------------------
    # 3. Build Gemini prompt with full RAG context
    # -----------------------------------------------------------------------
    system_prompt = (
        "You are Campus AI, a friendly and knowledgeable student assistant for "
        "Dhirubhai Ambani University (DAU), formerly known as DA-IICT.\n\n"
        "INSTRUCTIONS:\n"
        "- Answer the student's question using ONLY the context provided below. "
        "  Do NOT invent information not present in the context.\n"
        "- If the answer is in the DAU Knowledge Base section, use that first.\n"
        "- If clubs/events from the database are relevant, mention them.\n"
        "- If you truly cannot find the answer in any context, say so honestly and "
        "  suggest they contact the Dean of Students office or sbg@dau.ac.in.\n"
        "- Be conversational, friendly, and concise. Use markdown formatting "
        "  (bold, bullet points) when it improves readability.\n"
        "- If the user references a previous message, use the conversation history to answer.\n"
    )

    context_block = (
        f"=== DAU KNOWLEDGE BASE (retrieved sections) ===\n"
        f"{knowledge_context_str}\n\n"
        f"=== CLUBS & COMMITTEES (from live database) ===\n"
        f"{clubs_context_str}\n\n"
        f"=== UPCOMING EVENTS & OPPORTUNITIES (from live database) ===\n"
        f"{events_context_str}"
    )

    # -----------------------------------------------------------------------
    # 4. Build multi-turn conversation for Gemini
    # -----------------------------------------------------------------------
    # Gemini expects a list of Content objects for multi-turn conversation.
    # We inject the context block as a preamble in the first user turn.
    conversation_contents = []

    # Add prior history turns (last 3 pairs = 6 messages max to keep tokens low)
    recent_history = history[-6:] if len(history) > 6 else history
    for h in recent_history:
        role = "user" if h.role == "user" else "model"
        conversation_contents.append(
            types.Content(role=role, parts=[types.Part(text=h.content)])
        )

    # Final user turn = context + question
    final_user_turn = (
        f"Context for this question:\n{context_block}\n\n"
        f"Student's Question: {question}"
    )
    conversation_contents.append(
        types.Content(role="user", parts=[types.Part(text=final_user_turn)])
    )

    # -----------------------------------------------------------------------
    # 5. Call Gemini API
    # -----------------------------------------------------------------------
    responseText = ""
    if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"):
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=conversation_contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.3,
                    max_output_tokens=1024,
                )
            )
            responseText = response.text.strip()
        except Exception as e:
            print(f"Gemini API failed: {e}. Falling back to local rules.")

    # -----------------------------------------------------------------------
    # 6. Fallback (if Gemini unavailable) — build answer from retrieved chunks
    # -----------------------------------------------------------------------
    if not responseText:
        parts = []

        # Use knowledge base chunks first
        if kb_chunks:
            parts.append("**From DAU Knowledge Base:**")
            for c in kb_chunks[:2]:
                parts.append(f"\n**{c['section']}**\n{c['text'][:600]}...")

        # Then DB clubs
        if matched_clubs:
            parts.append("\n**Clubs & Committees:**")
            for c in matched_clubs[:2]:
                parts.append(
                    f"**{c.name}** ({c.category})\n"
                    f"{c.description}\n"
                    f"*Contact:* {c.contact_info} | *How to Join:* {c.how_to_join}"
                )

        # Then DB events
        if matched_events:
            parts.append("\n**Upcoming Events & Opportunities:**")
            for e in matched_events[:2]:
                parts.append(
                    f"**{e.title}** ({e.category})\n"
                    f"{e.description}\n"
                    f"*Date:* {e.start_date.strftime('%B %d, %Y')} | "
                    f"*Registration:* {e.registration_link or 'N/A'}"
                )

        if parts:
            responseText = "\n\n".join(parts)
        else:
            responseText = (
                "I searched the DAU knowledge base and our live database but couldn't find "
                "a specific answer to your question. You can:\n"
                "- Visit the [Dean of Students page](https://www.daiict.ac.in/dean-students)\n"
                "- Email the Student Body Government at **sbg@dau.ac.in**\n"
                "- Contact your Academic Committee at **sbg_academics@dau.ac.in**"
            )

    # -----------------------------------------------------------------------
    # 7. Build opportunity cards for UI
    # -----------------------------------------------------------------------
    matched_opportunities = []

    for c in matched_clubs[:3]:
        matched_opportunities.append(OpportunityResponse(
            id=f"club-{c.id}",
            title=c.name,
            type="General Event",
            organizer=c.contact_info or "DAU Campus",
            matchScore=90,
            reason="Matches your query about student activities",
            deadlineHours=9999,
            dateString="Ongoing Community",
            location="DAU Campus",
            description=c.description,
            tags=[c.category or "Club"],
            link=c.source_link
        ))

    category_map = {
        "workshop": "Workshop",
        "hackathon": "Hackathon",
        "lecture": "General Event",
        "alumni_meet": "General Event",
        "competition": "Hackathon",
        "summer_school": "Research Opportunity"
    }

    for e in matched_events[:3]:
        event_type = category_map.get(e.category, "General Event")
        try:
            hours_rem = max(0, int((e.registration_deadline - datetime.now()).total_seconds() / 3600))
        except Exception:
            hours_rem = 0

        matched_opportunities.append(OpportunityResponse(
            id=str(e.id),
            title=e.title,
            type=event_type,
            organizer="DAU Notice Board",
            matchScore=85,
            reason=f"Upcoming {e.category} opportunity at DAU",
            deadlineHours=hours_rem,
            dateString=e.start_date.strftime("%B %d, %Y"),
            location="DAU Campus",
            description=e.description,
            tags=[e.category],
            link=e.registration_link
        ))

    return AskResponse(
        response=responseText,
        matched_events=matched_opportunities,
        sources=sources_used
    )
