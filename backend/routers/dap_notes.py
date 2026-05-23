from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.dap_note import DAPNote
from app.models.therapist_note import TherapistNote
from app.models.reflection import Reflection
from app.models.user import User, UserRole
from app.schemas.core_schemas import DAPNoteCreate, DAPNoteRead, DAPNoteDraft, DAPNoteGenerateRequest
from app.engine.ai_dap import generate_dap_draft
from app.auth.deps import require_therapist

router = APIRouter()


@router.post("/generate", response_model=DAPNoteDraft)
async def generate_dap_note(
    body: DAPNoteGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_therapist),
) -> DAPNoteDraft:
    """Generate a DAP note draft using AI. Returns a draft only — does not save to the database."""
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

    draft = await generate_dap_draft(
        patient_name=patient.name,
        reflections=reflections,
        notes=notes,
    )
    return draft


@router.post("/", response_model=DAPNoteRead, status_code=status.HTTP_201_CREATED)
def create_dap_note(
    body: DAPNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_therapist),
) -> DAPNoteRead:
    """Save a reviewed DAP note to the database."""
    patient = db.query(User).filter(
        User.id == body.patient_id,
        User.role == UserRole.patient,
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    note = DAPNote(
        patient_id=body.patient_id,
        therapist_id=current_user.id,
        session_date=body.session_date,
        data=body.data,
        assessment=body.assessment,
        plan=body.plan,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/", response_model=list[DAPNoteRead])
def get_dap_notes(
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_therapist),
) -> list[DAPNoteRead]:
    """Retrieve all DAP notes for a patient, newest first."""
    return (
        db.query(DAPNote)
        .filter(DAPNote.patient_id == patient_id)
        .order_by(DAPNote.session_date.desc())
        .all()
    )
