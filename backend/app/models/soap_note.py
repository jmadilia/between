from datetime import date, datetime
from sqlalchemy import Integer, Text, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.core_models import Base


class SOAPNote(Base):
    __tablename__ = "soap_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    therapist_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    session_date: Mapped[date] = mapped_column(Date, nullable=False)
    subjective: Mapped[str] = mapped_column(Text, nullable=False)
    objective: Mapped[str] = mapped_column(Text, nullable=False)
    assessment: Mapped[str] = mapped_column(Text, nullable=False)
    plan: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
