from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.patient_profile import PatientProfile
from app.models.onboarding_screener import OnboardingScreener
from app.models.user import User
from app.schemas.core_schemas import (
    ConsentCreate,
    OnboardingDataRead,
    OnboardingStatusRead,
    PatientProfileCreate,
    PatientProfileRead,
    ScreenerCreate,
    ScreenerRead,
)
from app.auth.deps import require_therapist

router = APIRouter()

_PHQ9_RANGES = [(0, 4, "Minimal"), (5, 9, "Mild"), (10, 14, "Moderate"), (15, 19, "Moderately Severe"), (20, 27, "Severe")]
_GAD7_RANGES = [(0, 4, "Minimal"), (5, 9, "Mild"), (10, 14, "Moderate"), (15, 21, "Severe")]


def _severity(score: int, ranges: list) -> str:
    for low, high, label in ranges:
        if low <= score <= high:
            return label
    return "Unknown"


@router.get("/status/{patient_id}", response_model=OnboardingStatusRead)
def get_onboarding_status(
    patient_id: int,
    db: Session = Depends(get_db),
) -> OnboardingStatusRead:
    profile = db.query(PatientProfile).filter(PatientProfile.patient_id == patient_id).first()
    screeners = db.query(OnboardingScreener).filter(OnboardingScreener.patient_id == patient_id).all()
    screener_types = {s.screener_type for s in screeners}
    return OnboardingStatusRead(
        patient_id=patient_id,
        completed=profile.onboarding_completed if profile else False,
        profile_saved=profile is not None,
        screeners_saved="phq9" in screener_types and "gad7" in screener_types,
        consent_given=profile.consent_given if profile else False,
    )


@router.post("/profile", response_model=PatientProfileRead)
def save_onboarding_profile(
    data: PatientProfileCreate,
    db: Session = Depends(get_db),
) -> PatientProfile:
    profile = db.query(PatientProfile).filter(PatientProfile.patient_id == data.patient_id).first()
    if profile:
        for field, value in data.model_dump(exclude={"patient_id"}).items():
            setattr(profile, field, value)
    else:
        profile = PatientProfile(**data.model_dump())
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/screener", response_model=ScreenerRead)
def save_onboarding_screener(
    data: ScreenerCreate,
    db: Session = Depends(get_db),
) -> OnboardingScreener:
    expected = 9 if data.screener_type == "phq9" else 7
    if len(data.responses) != expected:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{data.screener_type.upper()} requires exactly {expected} responses",
        )
    if any(r < 0 or r > 3 for r in data.responses):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Each response must be 0, 1, 2, or 3",
        )

    score = sum(data.responses)
    ranges = _PHQ9_RANGES if data.screener_type == "phq9" else _GAD7_RANGES
    severity = _severity(score, ranges)
    # PHQ-9 item 9 (index 8) asks about suicidal ideation
    crisis_flag = data.screener_type == "phq9" and data.responses[8] > 0

    # Replace any existing screener of the same type
    db.query(OnboardingScreener).filter(
        OnboardingScreener.patient_id == data.patient_id,
        OnboardingScreener.screener_type == data.screener_type,
    ).delete()

    screener = OnboardingScreener(
        patient_id=data.patient_id,
        screener_type=data.screener_type,
        responses=data.responses,
        total_score=score,
        severity_label=severity,
        crisis_flag=crisis_flag,
    )
    db.add(screener)
    db.commit()
    db.refresh(screener)
    return screener


@router.post("/consent", response_model=PatientProfileRead)
def save_consent(
    data: ConsentCreate,
    db: Session = Depends(get_db),
) -> PatientProfile:
    profile = db.query(PatientProfile).filter(PatientProfile.patient_id == data.patient_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found — complete the profile step first",
        )
    profile.consent_given = True
    profile.consent_given_at = datetime.now(timezone.utc)
    profile.onboarding_completed = True
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{patient_id}", response_model=OnboardingDataRead)
def get_onboarding_data(
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_therapist),
) -> OnboardingDataRead:
    profile = db.query(PatientProfile).filter(PatientProfile.patient_id == patient_id).first()
    screeners = db.query(OnboardingScreener).filter(OnboardingScreener.patient_id == patient_id).all()
    return OnboardingDataRead(profile=profile, screeners=screeners)
