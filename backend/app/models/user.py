from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.models.core_models import Base

class User(Base):
  __tablename__ = "users"

  id: Mapped[int] = mapped_column(
    Integer,
    primary_key=True,
    index=True
  )

  email: Mapped[str] = mapped_column(
    String,
    unique=True,
    nullable=False,
    index=True  
  )