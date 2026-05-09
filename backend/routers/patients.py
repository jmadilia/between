from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User, UserRole
from app.schemas.core_schemas import PatientRead

router = APIRouter()

@router.get("/", response_model=list[PatientRead])
def get_patients(db: Session = Depends(get_db)) -> list[PatientRead]:
  """Retrieve all patients."""
  users = db.query(User).filter(User.role == UserRole.patient).all()
  return [{"id": u.id, "name": u.name, "role": u.role.value} for u in users]