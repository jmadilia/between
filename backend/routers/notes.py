from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.therapist_note import TherapistNote
from app.models.user import User, UserRole
from app.schemas.core_schemas import NoteCreate, NoteRead
from app.auth.deps import require_therapist

router = APIRouter()


@router.post("/", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(
    body: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_therapist),
) -> NoteRead:
    """Create a session note for a patient. Therapist-only."""
    patient = db.query(User).filter(
        User.id == body.patient_id,
        User.role == UserRole.patient,
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    note = TherapistNote(
        patient_id=body.patient_id,
        therapist_id=current_user.id,
        content=body.content,
        session_date=body.session_date,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/", response_model=list[NoteRead])
def get_notes(
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_therapist),
) -> list[NoteRead]:
    """Retrieve all session notes for a patient, newest first. Therapist-only."""
    return (
        db.query(TherapistNote)
        .filter(TherapistNote.patient_id == patient_id)
        .order_by(TherapistNote.session_date.desc())
        .all()
    )
