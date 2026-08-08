from pydantic import BaseModel, Field
from typing import Optional, List
from backend.schemas.candidate import CandidateProfile

class FeedbackSchema(BaseModel):
    summary: str = Field(..., description="High level summary of performance")
    strengths: List[str] = Field(default_factory=list, description="Key strengths demonstrated")
    gaps: List[str] = Field(default_factory=list, description="Knowledge gaps identified")
    next: List[str] = Field(default_factory=list, description="Recommended next learning objectives")

class InterviewRequest(BaseModel):
    sessionId: str = Field(..., description="Unique interview session ID")
    candidate: Optional[CandidateProfile] = Field(None, description="Candidate profile (provided on start)")
    message: Optional[str] = Field(None, description="Candidate answer message (provided during turns)")

class InterviewResponse(BaseModel):
    reply: str = Field(..., description="Interviewer text response or question")
    done: bool = Field(False, description="Whether the interview is completed")
    feedback: Optional[FeedbackSchema] = Field(None, description="Final interview feedback if done=True")

class ErrorResponse(BaseModel):
    success: bool = False
    message: str = Field(..., description="Error message description")
