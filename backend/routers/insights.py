from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.reflection import Reflection
from app.engine.insight_engine import InsightEngine

router = APIRouter()

@router.get("/{patient_id}")
def get_patient_insights(patient_id: int, db: Session = Depends(get_db)):
  reflections = db.query(Reflection).filter(
    Reflection.patient_id == patient_id
  ).all()

  engine = InsightEngine()
  insights = engine.analyze(reflections)

  return insights