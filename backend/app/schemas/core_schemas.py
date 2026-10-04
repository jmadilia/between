from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
from typing import List, Optional

class ReflectionBase(BaseModel):
  content: str = Field(
    ...,
    min_length=1,
    max_length=5000,
    description="Free-form reflection content",
  ),
  mood: int = Field(
    ...,
    ge=1,
    le=5,
    description="Mood score from 1 to 5",
  ),
  symptom_severity: int = Field(
    ...,
    ge=1,
    le=5,
    description="Symptom severity from 1 to 5"
  )


class ReflectionCreate(ReflectionBase):
  patient_id: int = Field(
    ...,
    gt=0,
    description="ID of the patient who owns this reflection",
  )

class ReflectionRead(ReflectionBase):
  id: int
  patient_id: int
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)

class PatientRead(BaseModel):
  id: int
  name: str
  role: str

  model_config = ConfigDict(from_attributes=True)
  
class InsightsRead(BaseModel):
  trends: list[str]
  flags: list[str]
  summary: str


class NoteCreate(BaseModel):
  patient_id: int = Field(..., gt=0)
  content: str = Field(..., min_length=1, max_length=10000)
  session_date: date


class NoteRead(BaseModel):
  id: int
  patient_id: int
  therapist_id: int
  content: str
  session_date: date
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)


class SOAPNoteDraft(BaseModel):
  subjective: str
  objective: str
  assessment: str
  plan: str


class SOAPNoteCreate(SOAPNoteDraft):
  patient_id: int = Field(..., gt=0)
  session_date: date


class SOAPNoteRead(SOAPNoteDraft):
  id: int
  patient_id: int
  therapist_id: int
  session_date: date
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)


class SOAPNoteGenerateRequest(BaseModel):
  patient_id: int = Field(..., gt=0)
  session_date: date


class DAPNoteDraft(BaseModel):
  data: str
  assessment: str
  plan: str


class DAPNoteCreate(DAPNoteDraft):
  patient_id: int = Field(..., gt=0)
  session_date: date


class DAPNoteRead(DAPNoteDraft):
  id: int
  patient_id: int
  therapist_id: int
  session_date: date
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)


class DAPNoteGenerateRequest(BaseModel):
  patient_id: int = Field(..., gt=0)
  session_date: date


# --- Onboarding ---

class PatientProfileCreate(BaseModel):
  patient_id: int = Field(..., gt=0)
  date_of_birth: Optional[date] = None
  pronouns: Optional[str] = Field(None, max_length=50)
  emergency_contact_name: Optional[str] = Field(None, max_length=200)
  emergency_contact_phone: Optional[str] = Field(None, max_length=50)
  presenting_concerns: Optional[str] = Field(None, max_length=5000)
  goals: Optional[str] = Field(None, max_length=2000)


class PatientProfileRead(PatientProfileCreate):
  id: int
  onboarding_completed: bool
  consent_given: bool
  consent_given_at: Optional[datetime] = None

  model_config = ConfigDict(from_attributes=True)


class ScreenerCreate(BaseModel):
  patient_id: int = Field(..., gt=0)
  screener_type: str = Field(..., pattern="^(phq9|gad7)$")
  responses: list[int] = Field(..., description="Each value must be 0–3")


class ScreenerRead(BaseModel):
  id: int
  patient_id: int
  screener_type: str
  responses: list[int]
  total_score: int
  severity_label: str
  crisis_flag: bool
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)


class OnboardingStatusRead(BaseModel):
  patient_id: int
  completed: bool
  profile_saved: bool
  screeners_saved: bool
  consent_given: bool


class ConsentCreate(BaseModel):
  patient_id: int = Field(..., gt=0)


class OnboardingDataRead(BaseModel):
  profile: Optional[PatientProfileRead] = None
  screeners: list[ScreenerRead]