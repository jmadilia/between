from datetime import datetime, timedelta, timezone

from app.db.session import SessionLocal, engine
from app.models.core_models import Base
from app.models.reflection import Reflection
from app.models.session_summary import SessionSummary
from app.models.therapist_note import TherapistNote
from app.models.soap_note import SOAPNote
from app.models.dap_note import DAPNote
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

        notes = [
            # Alice — two notes bracketing her decline
            # First session: early warning signs, therapist flags work pressure
            TherapistNote(
                patient_id=alice.id,
                therapist_id=therapist.id,
                session_date=(now - timedelta(days=13)).date(),
                content=(
                    "Alice presented as engaged and largely optimistic. She acknowledged increasing "
                    "workload pressure over the past few weeks and an upcoming project deadline. Mood "
                    "appeared euthymic and affect was appropriate. We explored her current coping "
                    "strategies — she identified exercise and journaling as helpful anchors. Agreed to "
                    "monitor stress levels between sessions. Will revisit sleep quality at next appointment "
                    "as she noted occasional difficulty winding down at night."
                ),
            ),
            # Second session: mood has declined, sleep disrupted, performance review imminent
            TherapistNote(
                patient_id=alice.id,
                therapist_id=therapist.id,
                session_date=(now - timedelta(days=6)).date(),
                content=(
                    "Alice presented visibly fatigued and more guarded than in previous sessions. Sleep "
                    "has been significantly disrupted — difficulty falling asleep and early waking most "
                    "nights. Work stress has escalated sharply around a performance review scheduled for "
                    "next week. Explored the cognitive distortions driving her anticipatory anxiety and "
                    "introduced a brief sleep hygiene protocol. Alice expressed concern that her performance "
                    "is already declining, which appears to be reinforcing the anxiety loop. Plan: monitor "
                    "mood and sleep closely over the next week; consider PCP referral if sleep disruption "
                    "persists beyond the review period."
                ),
            ),

            # Bob — two notes tracking his anxiety arc and recovery
            # First session: avoidance patterns identified, behavioral activation introduced
            TherapistNote(
                patient_id=bob.id,
                therapist_id=therapist.id,
                session_date=(now - timedelta(days=11)).date(),
                content=(
                    "Bob discussed anticipatory anxiety around an upcoming family visit. He identified "
                    "his mother's critical communication style as a primary trigger and acknowledged "
                    "withdrawing socially in advance of the visit as a way to 'brace himself.' Explored "
                    "the avoidance pattern and its short-term relief vs. long-term cost. Introduced "
                    "behavioral activation as an alternative — set a concrete action item for the week: "
                    "one brief outdoor walk before the family visit."
                ),
            ),
            # Second session: behavioral activation worked, family visit navigated, momentum building
            TherapistNote(
                patient_id=bob.id,
                therapist_id=therapist.id,
                session_date=(now - timedelta(days=3)).date(),
                content=(
                    "Bob reported completing the behavioral activation task from last session — a "
                    "30-minute walk, which he said genuinely helped regulate his mood. Affect was "
                    "noticeably brighter. The family visit has passed; he described it as tense but "
                    "manageable, and reflected on his ability to tolerate discomfort without fully "
                    "withdrawing. Discussed maintaining this momentum: identifying other avoided social "
                    "situations and approaching them gradually. Bob showed good insight into his anxiety "
                    "patterns today — a meaningful shift from last session."
                ),
            ),

            # Carol — two notes, then silence (reinforces the disengagement signal)
            # First session: severe presentation, safety assessed, hopelessness present
            TherapistNote(
                patient_id=carol.id,
                therapist_id=therapist.id,
                session_date=(now - timedelta(days=19)).date(),
                content=(
                    "Carol presented with significant psychomotor slowing and tearfulness throughout "
                    "the session. Sleep is severely disrupted — fewer than four hours per night for the "
                    "past two weeks. She expressed feelings of hopelessness and low motivation. Conducted "
                    "safety assessment: no active plan or intent; protective factors include her daughter "
                    "and work obligations. Discussed the bidirectional relationship between sleep "
                    "deprivation and mood. Plan: refer to PCP for sleep evaluation; provide sleep hygiene "
                    "psychoeducation; consider increasing session frequency if symptoms worsen."
                ),
            ),
            # Second session: slight improvement, PCP referral in motion, re-engagement encouraged
            TherapistNote(
                patient_id=carol.id,
                therapist_id=therapist.id,
                session_date=(now - timedelta(days=14)).date(),
                content=(
                    "Carol appeared slightly more regulated than last session, though still notably "
                    "fatigued. PCP appointment is scheduled for next week. She completed one element of "
                    "the sleep hygiene plan (consistent wake time) but found others difficult to maintain. "
                    "Hopelessness is somewhat reduced — she attributed this to 'feeling heard.' Encouraged "
                    "continued use of the between-session reflection tool to track mood patterns. Plan: "
                    "follow up on PCP visit outcomes; closely monitor for disengagement or worsening mood "
                    "given her recent drop in between-session check-ins."
                ),
            ),
        ]

        db.add_all(notes)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()