from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.reflection import Reflection
from app.models.therapist_note import TherapistNote
from app.models.user import User
from app.engine.insight_engine import InsightEngine
from app.engine.ai_summary import generate_ai_summary
from app.schemas.core_schemas import InsightsRead
from app.auth.deps import require_therapist

router = APIRouter()

_WINDOW_DAYS: dict[str, int | None] = {
    "week": 7,
    "month": 30,
    "year": 365,
    "all": None,
}


@router.get("/{patient_id}", response_model=InsightsRead)
async def get_patient_insights(
    patient_id: int,
    window: Literal["week", "month", "year", "all"] = "all",
    db: Session = Depends(get_db),
    _: User = Depends(require_therapist),
) -> InsightsRead:
    """Generate a pre-session summary filtered by time window, with AI-generated narrative."""
    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    days = _WINDOW_DAYS[window]
    since = datetime.now(timezone.utc) - timedelta(days=days) if days else None

    reflection_query = db.query(Reflection).filter(Reflection.patient_id == patient_id)
    notes_query = db.query(TherapistNote).filter(TherapistNote.patient_id == patient_id)

    if since:
        reflection_query = reflection_query.filter(Reflection.created_at >= since)
        notes_query = notes_query.filter(TherapistNote.session_date >= since.date())

    reflections = reflection_query.all()
    notes = notes_query.order_by(TherapistNote.session_date.asc()).all()

    engine = InsightEngine()
    result = engine.analyze(reflections)

    result["summary"] = await generate_ai_summary(
        patient_name=patient.name,
        reflections=reflections,
        notes=notes,
        trends=result["trends"],
        flags=result["flags"],
        fallback_summary=result["summary"],
    )

    return result
