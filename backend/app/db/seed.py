"""Demo dataset and database bootstrap.

The deployed demo runs against a real Postgres database (Neon on Vercel), so
anything a visitor writes persists. This module creates the schema and loads a
realistic three-patient caseload the first time the app starts against an
empty database, and can reset the database back to that state on request.
"""
import logging
import threading
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, engine
from app.models.core_models import Base

# Import every model so Base.metadata knows about all tables.
from app.models.reflection import Reflection
from app.models.session_summary import SessionSummary  # noqa: F401
from app.models.therapist_note import TherapistNote
from app.models.soap_note import SOAPNote
from app.models.dap_note import DAPNote
from app.models.user import User, UserRole
from app.models.patient_profile import PatientProfile
from app.models.onboarding_screener import OnboardingScreener

logger = logging.getLogger(__name__)

# Arbitrary constant used as a Postgres advisory lock key so concurrent cold
# starts don't seed the same empty database twice.
_SEED_LOCK_KEY = 4_812_390_117

_bootstrapped = False
_bootstrap_lock = threading.Lock()


def _is_postgres() -> bool:
    return engine.dialect.name == "postgresql"


def _stamp_alembic_head() -> None:
    """Mark a freshly created schema as up to date so later migrations apply cleanly."""
    from alembic import command
    from alembic.config import Config

    backend_dir = Path(__file__).resolve().parents[2]
    cfg = Config()
    cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    command.stamp(cfg, "head")


def seed_demo_data(db: Session) -> None:
    """Insert the demo caseload. Dates are relative to now so the data always looks recent."""
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
    db.flush()

    profiles = [
        PatientProfile(
            patient_id=alice.id,
            date_of_birth=date(1990, 3, 14),
            pronouns="she/her",
            emergency_contact_name="Mark Johnson",
            emergency_contact_phone="555-0101",
            presenting_concerns="Chronic work-related stress, difficulty setting boundaries, recurring sleep problems that worsen during high-pressure periods.",
            goals="Develop sustainable coping strategies for workplace stress\nImprove sleep hygiene and consistency\nBuild confidence in asserting boundaries with colleagues",
            onboarding_completed=True,
            consent_given=True,
        ),
        PatientProfile(
            patient_id=bob.id,
            date_of_birth=date(1985, 7, 22),
            pronouns="he/him",
            emergency_contact_name="Linda Smith",
            emergency_contact_phone="555-0202",
            presenting_concerns="Generalized anxiety, particularly around family dynamics and financial stress. Tendency toward social withdrawal when anxious.",
            goals="Reduce avoidance behaviors\nImprove ability to tolerate uncertainty\nStrengthen communication with family members",
            onboarding_completed=True,
            consent_given=True,
        ),
        PatientProfile(
            patient_id=carol.id,
            date_of_birth=date(1978, 11, 5),
            pronouns="she/her",
            emergency_contact_name="James Rivera",
            emergency_contact_phone="555-0303",
            presenting_concerns="Persistent low mood, severe sleep disruption, and feelings of hopelessness. History of depressive episodes.",
            goals="Stabilize sleep and daily routine\nAddress hopelessness with behavioral activation\nImprove engagement between sessions",
            onboarding_completed=True,
            consent_given=True,
        ),
    ]
    db.add_all(profiles)
    db.flush()

    screeners = [
        # Alice: mild depression, mild anxiety
        OnboardingScreener(patient_id=alice.id, screener_type="phq9", responses=[1, 1, 2, 1, 0, 0, 1, 0, 0], total_score=6, severity_label="Mild", crisis_flag=False),
        OnboardingScreener(patient_id=alice.id, screener_type="gad7", responses=[2, 1, 2, 1, 1, 1, 1], total_score=9, severity_label="Mild", crisis_flag=False),
        # Bob: minimal depression, mild anxiety
        OnboardingScreener(patient_id=bob.id, screener_type="phq9", responses=[1, 0, 1, 1, 0, 0, 0, 0, 0], total_score=3, severity_label="Minimal", crisis_flag=False),
        OnboardingScreener(patient_id=bob.id, screener_type="gad7", responses=[2, 2, 2, 1, 1, 1, 0], total_score=9, severity_label="Mild", crisis_flag=False),
        # Carol: moderate depression, moderate anxiety
        OnboardingScreener(patient_id=carol.id, screener_type="phq9", responses=[3, 3, 3, 3, 2, 2, 1, 2, 0], total_score=19, severity_label="Moderately Severe", crisis_flag=False),
        OnboardingScreener(patient_id=carol.id, screener_type="gad7", responses=[2, 2, 3, 2, 2, 1, 2], total_score=14, severity_label="Moderate", crisis_flag=False),
    ]
    db.add_all(screeners)

    # One formal note per format so the Documentation tab has something to show.
    db.add_all([
        SOAPNote(
            patient_id=alice.id,
            therapist_id=therapist.id,
            session_date=(now - timedelta(days=6)).date(),
            subjective=(
                "Alice reports escalating work stress ahead of a performance review next week. "
                "Describes difficulty falling asleep and early waking most nights, and worries her "
                "work quality is already slipping."
            ),
            objective=(
                "Appeared fatigued and more guarded than prior sessions. Between-session mood ratings "
                "fell from 4/5 to 2/5 over the past week while symptom severity rose to 4/5."
            ),
            assessment=(
                "Anticipatory anxiety tied to the upcoming review, compounded by sleep disruption. "
                "Catastrophic predictions about performance appear to be sustaining an anxiety loop."
            ),
            plan=(
                "Introduced sleep hygiene protocol and cognitive restructuring for review-related "
                "predictions. Monitor mood and sleep daily; consider PCP referral if sleep has not "
                "improved after the review."
            ),
        ),
        DAPNote(
            patient_id=bob.id,
            therapist_id=therapist.id,
            session_date=(now - timedelta(days=3)).date(),
            data=(
                "Bob completed the behavioral activation task (a 30-minute walk) and described it as "
                "regulating. The family visit passed; he called it tense but manageable. Affect "
                "noticeably brighter, mood ratings trending up to 4/5."
            ),
            assessment=(
                "Behavioral activation is reducing avoidance. Bob tolerated discomfort without fully "
                "withdrawing, showing improved insight into his anxiety patterns."
            ),
            plan=(
                "Build a graded list of avoided social situations and approach one before next "
                "session. Continue between-session check-ins."
            ),
        ),
    ])


def ensure_database() -> None:
    """Create any missing tables and seed the demo data if the database has no users.

    Idempotent and cheap after the first successful call in a process.
    """
    global _bootstrapped
    if _bootstrapped:
        return
    with _bootstrap_lock:
        if _bootstrapped:
            return
        created = False
        with SessionLocal() as db:
            if _is_postgres():
                db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": _SEED_LOCK_KEY})
            Base.metadata.create_all(bind=db.connection())
            if db.scalar(select(func.count()).select_from(User)) == 0:
                logger.info("Empty database detected; loading demo data.")
                seed_demo_data(db)
                created = True
            db.commit()
        if created and _is_postgres():
            try:
                _stamp_alembic_head()
            except Exception:  # stamping is a convenience for local migrations, never fatal
                logger.exception("Could not stamp alembic head")
        _bootstrapped = True


def reset_database() -> None:
    """Wipe every table and reload the demo data."""
    with SessionLocal() as db:
        if _is_postgres():
            db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": _SEED_LOCK_KEY})
            Base.metadata.create_all(bind=db.connection())
            tables = ", ".join(t.name for t in Base.metadata.sorted_tables)
            db.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))
        else:
            Base.metadata.drop_all(bind=db.connection())
            Base.metadata.create_all(bind=db.connection())
        seed_demo_data(db)
        db.commit()
