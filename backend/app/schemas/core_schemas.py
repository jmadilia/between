from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class ReflectionBase(BaseModel):
  content: str = Field(
    ...,
    min_length=1,
    max_length=5000,
    description="Free-form reflection content",
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


class ReflectionList(BaseModel):
    items: List[ReflectionRead]