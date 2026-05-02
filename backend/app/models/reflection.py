from datetime import datetime
from sqlalchemy import Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.core_models import Base


class Reflection(Base):
    """Patient reflection between sessions: mood (1-5), symptom severity (1-5), and free-text content.

    The core patient input that powers the insight engine and therapist dashboard.
    """
    __tablename__ = "reflections"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    mood: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    symptom_severity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )