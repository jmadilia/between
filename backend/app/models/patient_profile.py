from datetime import date, datetime
from sqlalchemy import Integer, String, Boolean, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.core_models import Base


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True
    )
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    pronouns: Mapped[str | None] = mapped_column(String(50), nullable=True)
    emergency_contact_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    presenting_concerns: Mapped[str | None] = mapped_column(Text, nullable=True)
    goals: Mapped[str | None] = mapped_column(Text, nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    consent_given: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    consent_given_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
