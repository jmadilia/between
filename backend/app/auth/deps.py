from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User, UserRole

DEMO_USER_HEADER = "X-Demo-User-Id"


def get_current_user(
  db: Session = Depends(get_db),
  demo_user_id: int | None = Header(default=None, alias=DEMO_USER_HEADER),
) -> User:
  """Demo identity: the frontend sends the id of the persona the visitor picked.

  Without the header (e.g. from /docs) requests act as the seeded therapist.
  A real deployment would decode a verified session token here instead; see
  docs/SECURITY.md.
  """
  if demo_user_id is not None:
    user = db.get(User, demo_user_id)
  else:
    user = db.query(User).filter(User.role == UserRole.therapist).order_by(User.id).first()
  if not user:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
  return user


def require_therapist(current_user: User = Depends(get_current_user)) -> User:
  if current_user.role != UserRole.therapist:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Therapist access required.")
  return current_user


def require_patient(current_user: User = Depends(get_current_user)) -> User:
  if current_user.role != UserRole.patient:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient access required.")
  return current_user
