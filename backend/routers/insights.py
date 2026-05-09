from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.reflection import Reflection
from app.engine.insight_engine import InsightEngine
from app.schemas.core_schemas import InsightsRead

router = APIRouter()

@router.get("/{patient_id}", response_model=InsightsRead)
def get_patient_insights(patient_id: int, db: Session = Depends(get_db)) -> InsightsRead:
  """Generate a pre-session summary with mood trends, engagement status, and keyword flags. Used by therapists to quickly understand patient status."""
  reflections = db.query(Reflection).filter(
    Reflection.patient_id == patient_id
  ).all()

  engine = InsightEngine()
  insights = engine.analyze(reflections)

  return insights