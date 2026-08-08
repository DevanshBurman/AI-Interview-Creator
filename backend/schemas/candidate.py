from pydantic import BaseModel, Field
from typing import Optional, List

class MemberProfile(BaseModel):
    id: str = Field(..., description="Candidate unique ID, e.g. CAND-001")
    name: str = Field(..., description="Candidate full name")
    jobRole: Optional[str] = Field(None, description="Job title/role")
    yearsExperience: Optional[int] = Field(None, description="Years of work experience")
    education: Optional[str] = Field(None, description="Educational background")
    status: Optional[str] = Field(None, description="Status e.g. COMPLETED")

class MissionItem(BaseModel):
    day: int = Field(..., description="Curriculum day number")
    title: str = Field(..., description="Mission topic title")
    passed: Optional[bool] = Field(False, description="Whether mission was passed")
    attempts: Optional[int] = Field(0, description="Number of attempts")
    skipped: Optional[bool] = Field(False, description="Whether topic was skipped")

class CandidateSignals(BaseModel):
    commitDays: Optional[int] = Field(0, description="Total days active")
    missionsCompleted: Optional[int] = Field(0, description="Completed missions count")
    missionsFirstTry: Optional[int] = Field(0, description="Missions passed on first attempt")

class CandidateProfile(BaseModel):
    member: MemberProfile
    missions: List[MissionItem] = []
    signals: Optional[CandidateSignals] = None
