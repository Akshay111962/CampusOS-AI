import pytest
from app.db.models.models import StudentProfile, Event, EventCategory, EventSource
from app.services.ai_matching import heuristic_pre_filter, get_heuristic_score
from app.services.ai_extraction import get_fallback_extraction

def test_heuristic_pre_filtering():
    # Setup test event targeting third years in Computer Science
    event = Event(
        title="Edge Computing Hackathon",
        description="Write transformers on microcontrollers.",
        category=EventCategory.HACKATHON,
        eligible_departments=["Computer Science"],
        eligible_years=[3],
        start_date=None,
        registration_deadline=None,
        source=EventSource.MANUAL
    )
    
    # 1. Matches: CS student in Year 3
    student_ok = StudentProfile(interests=["AI", "IoT"])
    assert heuristic_pre_filter(student_ok, "Computer Science", 3, event) is True
    
    # 2. Fails: CS student in Year 2
    student_wrong_year = StudentProfile(interests=["AI"])
    assert heuristic_pre_filter(student_wrong_year, "Computer Science", 2, event) is False
    
    # 3. Fails: EE student in Year 3
    student_wrong_dept = StudentProfile(interests=["IoT"])
    assert heuristic_pre_filter(student_wrong_dept, "Electrical Engineering", 3, event) is False


def test_heuristic_matching_scores():
    student = StudentProfile(
        interests=["machine learning", "neural networks"],
        skills=["python", "pytorch"]
    )
    
    # Event with high matching keyword overlap
    event_ml = Event(
        title="Deep Machine Learning and PyTorch Bootcamp",
        description="Learn neural networks training pipelines with python and PyTorch.",
        category=EventCategory.WORKSHOP,
        source=EventSource.MANUAL
    )
    
    score, reason = get_heuristic_score(student, event_ml)
    # Default is 0.5, plus 0.1 per matching keyword (machine learning, neural networks, python, pytorch)
    assert score >= 0.8
    assert "pytorch" in reason.lower() or "machine learning" in reason.lower()
    
    # Event with zero matching keywords
    event_art = Event(
        title="Clay Pottery Guild Meetup",
        description="Join us for drawing, sculpting and traditional clay firing.",
        category=EventCategory.WORKSHOP,
        source=EventSource.MANUAL
    )
    score_art, _ = get_heuristic_score(student, event_art)
    assert score_art == 0.3


def test_fallback_ai_extraction():
    raw_notice = "Register for Figma component workshop on June 20 at 2pm. Open to CSE first years. Link: http://figma.com/register"
    extracted = get_fallback_extraction(raw_notice)
    
    assert extracted["category"] == "workshop"
    assert "Computer Science" in extracted["eligible_departments"]
    assert extracted["eligible_years"] == [1]
    assert extracted["registration_link"] == "http://figma.com/register"
