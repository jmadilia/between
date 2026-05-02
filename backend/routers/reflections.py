from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.reflection import Reflection
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
def get_reflections(patient_id: int, db: Session = Depends(get_db)) -> list[Reflection]:
  """Retrieve all reflections for a specific patient. Used by both patient (for history) and therapist (for dashboard)."""
  return db.query(Reflection).filter(Reflection.patient_id == patient_id).all()
