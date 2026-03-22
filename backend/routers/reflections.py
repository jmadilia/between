from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.core_models import Reflection
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
  reflection = Reflection(
    patient_id=reflection_in.patient_id,
    content=reflection_in.content  
  )

  db.add(reflection)
  db.commit()
  db.refresh(reflection)

  return reflection