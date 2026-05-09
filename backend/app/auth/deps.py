from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User, UserRole

def get_current_user(db: Session = Depends(get_db)) -> User:
  user = db.query(User).filter(User.role == UserRole.therapist).first()
  if not user:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
  return user

def require_therapist(current_user: User = Depends(get_current_user)) -> User:
  if current_user.role != UserRole.therapist:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Therapist access required.")
  return current_user

def require_patient(current_user: User = Depends(get_current_user)) -> User:
  if current_user.role != UserRole.patient:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, details="Patient access required.")
  