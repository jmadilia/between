from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User, UserRole
from app.schemas.core_schemas import PatientRead
from app.auth.deps import require_therapist

router = APIRouter()

@router.get("/", response_model=list[PatientRead])
def get_patients(db: Session = Depends(get_db), _: User = Depends(require_therapist)) -> list[PatientRead]:
  """Retrieve all patients."""
  return db.query(User).filter(User.role == UserRole.patient).all()