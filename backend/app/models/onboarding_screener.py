from datetime import datetime
from sqlalchemy import Integer, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.models.core_models import Base


class OnboardingScreener(Base):
    __tablename__ = "onboarding_screeners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    screener_type: Mapped[str] = mapped_column(String(10), nullable=False)  # "phq9" or "gad7"
    responses: Mapped[list] = mapped_column(JSON, nullable=False)
    total_score: Mapped[int] = mapped_column(Integer, nullable=False)
    severity_label: Mapped[str] = mapped_column(String(50), nullable=False)
    crisis_flag: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
