from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/")
def get_patients(db: Session = Depends(get_db)) -> list[dict]:
  """Retrieve all patients."""
  users = db.query(User).filter(User.role == UserRole.patient).all()
  return [{"id": u.id, "name": u.name, "role": u.role.value} for u in users]