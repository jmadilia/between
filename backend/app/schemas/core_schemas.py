from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List

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

  class Config:
      from_attributes = True

class PatientRead(BaseModel):
  id: int
  name: str
  role: str

  class Config:
      from_attributes = True
  
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

  class Config:
    from_attributes = True


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

  class Config:
    from_attributes = True


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

  class Config:
    from_attributes = True


class DAPNoteGenerateRequest(BaseModel):
  patient_id: int = Field(..., gt=0)
  session_date: date