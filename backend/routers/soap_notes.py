from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.soap_note import SOAPNote
from app.models.therapist_note import TherapistNote
from app.models.reflection import Reflection
from app.models.user import User, UserRole
from app.schemas.core_schemas import SOAPNoteCreate, SOAPNoteRead, SOAPNoteDraft, SOAPNoteGenerateRequest
from app.engine.ai_soap import generate_soap_draft
from app.auth.deps import require_therapist

router = APIRouter()


@router.post("/generate", response_model=SOAPNoteDraft)
async def generate_soap_note(
    body: SOAPNoteGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_therapist),
) -> SOAPNoteDraft:
    """Generate a SOAP note draft using AI. Returns a draft only — does not save to the database."""
    patient = db.query(User).filter(
        User.id == body.patient_id,
        User.role == UserRole.patient,
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    reflections = (
        db.query(Reflection)
        .filter(Reflection.patient_id == body.patient_id)
        .order_by(Reflection.created_at.asc())
        .all()
    )
    notes = (
        db.query(TherapistNote)
        .filter(TherapistNote.patient_id == body.patient_id)
        .order_by(TherapistNote.session_date.asc())
        .all()
    )

    draft = await generate_soap_draft(
        patient_name=patient.name,
        reflections=reflections,
        notes=notes,
    )
    return draft


@router.post("/", response_model=SOAPNoteRead, status_code=status.HTTP_201_CREATED)
def create_soap_note(
    body: SOAPNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_therapist),
) -> SOAPNoteRead:
    """Save a reviewed SOAP note to the database."""
    patient = db.query(User).filter(
        User.id == body.patient_id,
        User.role == UserRole.patient,
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    note = SOAPNote(
        patient_id=body.patient_id,
        therapist_id=current_user.id,
        session_date=body.session_date,
        subjective=body.subjective,
        objective=body.objective,
        assessment=body.assessment,
        plan=body.plan,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/", response_model=list[SOAPNoteRead])
def get_soap_notes(
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_therapist),
) -> list[SOAPNoteRead]:
    """Retrieve all SOAP notes for a patient, newest first."""
    return (
        db.query(SOAPNote)
        .filter(SOAPNote.patient_id == patient_id)
        .order_by(SOAPNote.session_date.desc())
        .all()
    )
