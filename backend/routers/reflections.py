from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.reflection import Reflection
from app.models.user import User, UserRole
from app.auth.deps import get_current_user, require_patient
from app.schemas.core_schemas import ReflectionCreate, ReflectionRead

router = APIRouter()

@router.post(
  "/",
  response_model=ReflectionRead,
  status_code=status.HTTP_201_CREATED,
)
def create_reflection(
  reflection_in: ReflectionCreate,
  db: Session = Depends(get_db),
  _: User = Depends(require_patient),
) -> Reflection:
  """Create a new reflection. Patients submit mood, symptom severity, and free-text content between sessions."""
  reflection = Reflection(
    patient_id=reflection_in.patient_id,
    content=reflection_in.content,
    mood=reflection_in.mood,
    symptom_severity=reflection_in.symptom_severity,
)

  db.add(reflection)
  db.commit()
  db.refresh(reflection)

  return reflection

@router.get("/", response_model=list[ReflectionRead])
def get_reflections(
  patient_id: int,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> list[Reflection]:
  """Retrieve all reflections for a specific patient. Used by both patient (for history) and therapist (for dashboard)."""
  if current_user.role == UserRole.patient and current_user.id != patient_id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
  return db.query(Reflection).filter(Reflection.patient_id == patient_id).all()
