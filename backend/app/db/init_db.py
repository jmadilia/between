from datetime import datetime, timedelta, timezone

from app.db.session import SessionLocal, engine
from app.models.core_models import Base
from app.models.reflection import Reflection
from app.models.session_summary import SessionSummary
from app.models.user import User, UserRole


def init_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        therapist = User(name="Dr. Sarah Okonkwo", email="sarah@between.app", role=UserRole.therapist)
        alice = User(name="Alice Johnson", email="alice@example.com", role=UserRole.patient)
        bob = User(name="Bob Smith", email="bob@example.com", role=UserRole.patient)
        carol = User(name="Carol Rivera", email="carol@example.com", role=UserRole.patient)

        db.add_all([therapist, alice, bob, carol])
        db.flush()  # assigns IDs before we reference them below

        now = datetime.now(timezone.utc)

        reflections = [
            # Alice — mood declining, stress + sleep keywords
            Reflection(patient_id=alice.id, mood=4, symptom_severity=2, content="Felt pretty good today. Work was manageable.", created_at=now - timedelta(days=14)),
            Reflection(patient_id=alice.id, mood=3, symptom_severity=3, content="Stressed about a deadline at work. Hard to focus.", created_at=now - timedelta(days=10)),
            Reflection(patient_id=alice.id, mood=2, symptom_severity=4, content="Really overwhelmed. Stress has been building all week. Sleep has been terrible.", created_at=now - timedelta(days=6)),
            Reflection(patient_id=alice.id, mood=2, symptom_severity=4, content="Still not sleeping well. Anxious about an upcoming review at work.", created_at=now - timedelta(days=2)),

            # Bob — stable mood, anxiety keywords
            Reflection(patient_id=bob.id, mood=3, symptom_severity=3, content="Feeling anxious about a family visit. Hard to relax.", created_at=now - timedelta(days=12)),
            Reflection(patient_id=bob.id, mood=3, symptom_severity=2, content="A bit worried about finances but managing okay.", created_at=now - timedelta(days=8)),
            Reflection(patient_id=bob.id, mood=4, symptom_severity=2, content="Better day. Less anxious than usual. Took a walk.", created_at=now - timedelta(days=4)),

            # Carol — low engagement (last check-in > 3 days ago), sleep issues
            Reflection(patient_id=carol.id, mood=2, symptom_severity=5, content="Exhausted. Haven't been sleeping at all. Feeling hopeless.", created_at=now - timedelta(days=20)),
            Reflection(patient_id=carol.id, mood=3, symptom_severity=3, content="Slightly better but still tired. Sleep is still off.", created_at=now - timedelta(days=15)),
        ]

        db.add_all(reflections)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()