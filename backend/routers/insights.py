from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.reflection import Reflection
from app.models.therapist_note import TherapistNote
from app.models.soap_note import SOAPNote
from app.models.dap_note import DAPNote
from app.models.user import User
from app.models.patient_profile import PatientProfile
from app.models.onboarding_screener import OnboardingScreener
from app.engine.insight_engine import InsightEngine
from app.engine.ai_summary import generate_ai_summary
from app.schemas.core_schemas import InsightsRead
from app.auth.deps import require_therapist

router = APIRouter()


@router.get("/{patient_id}", response_model=InsightsRead)
async def get_patient_insights(
    patient_id: int,
    from_date: date | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_therapist),
) -> InsightsRead:
    """Generate a pre-session summary from a given date through today, with AI-generated narrative."""
    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    reflection_query = db.query(Reflection).filter(Reflection.patient_id == patient_id)
    notes_query = db.query(TherapistNote).filter(TherapistNote.patient_id == patient_id)
    soap_query = db.query(SOAPNote).filter(SOAPNote.patient_id == patient_id)
    dap_query = db.query(DAPNote).filter(DAPNote.patient_id == patient_id)

    if from_date:
        since = datetime(from_date.year, from_date.month, from_date.day, tzinfo=timezone.utc)
        reflection_query = reflection_query.filter(Reflection.created_at >= since)
        notes_query = notes_query.filter(TherapistNote.session_date >= from_date)
        soap_query = soap_query.filter(SOAPNote.session_date >= from_date)
        dap_query = dap_query.filter(DAPNote.session_date >= from_date)

    reflections = reflection_query.all()
    notes = notes_query.order_by(TherapistNote.session_date.asc()).all()
    soap_notes = soap_query.order_by(SOAPNote.session_date.asc()).all()
    dap_notes = dap_query.order_by(DAPNote.session_date.asc()).all()

    profile = db.query(PatientProfile).filter(PatientProfile.patient_id == patient_id).first()
    screeners = db.query(OnboardingScreener).filter(OnboardingScreener.patient_id == patient_id).all()

    engine = InsightEngine()
    result = engine.analyze(reflections)

    result["summary"] = await generate_ai_summary(
        patient_name=patient.name,
        reflections=reflections,
        notes=notes,
        trends=result["trends"],
        flags=result["flags"],
        fallback_summary=result["summary"],
        soap_notes=soap_notes or None,
        dap_notes=dap_notes or None,
        presenting_concerns=profile.presenting_concerns if profile else None,
        goals=profile.goals if profile else None,
        baseline_screeners=screeners or None,
    )

    return result
