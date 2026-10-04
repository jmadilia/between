import secrets

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.db.seed import reset_database
from app.models.patient_profile import PatientProfile
from app.models.user import User, UserRole

router = APIRouter()


class Persona(BaseModel):
  id: int
  name: str
  role: UserRole
  onboarding_completed: bool


class NewPatientRequest(BaseModel):
  name: str | None = None


def _persona(user: User, completed: bool) -> Persona:
  return Persona(id=user.id, name=user.name, role=user.role, onboarding_completed=completed)


@router.get("/personas", response_model=list[Persona])
def list_personas(db: Session = Depends(get_db)) -> list[Persona]:
  """Everyone a visitor can sign in as: the therapist first, then patients."""
  completed = {
    pid for (pid,) in db.query(PatientProfile.patient_id).filter(PatientProfile.onboarding_completed.is_(True))
  }
  users = db.query(User).order_by(User.role.desc(), User.id).all()
  return [_persona(u, u.role == UserRole.therapist or u.id in completed) for u in users]


@router.post("/patients", response_model=Persona, status_code=status.HTTP_201_CREATED)
def create_demo_patient(body: NewPatientRequest, db: Session = Depends(get_db)) -> Persona:
  """Create a brand-new patient so a visitor can walk through onboarding themselves."""
  name = (body.name or "").strip()[:100] or "Jordan Lee"
  user = User(name=name, email=f"demo-{secrets.token_hex(6)}@example.com", role=UserRole.patient)
  db.add(user)
  db.commit()
  db.refresh(user)
  return _persona(user, False)


@router.post("/reset", status_code=status.HTTP_204_NO_CONTENT)
def reset_demo() -> None:
  """Restore the original demo caseload, discarding anything visitors added."""
  reset_database()
