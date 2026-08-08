"""
Interview Schemas for ABTalks AI Cohort Interviewer.
Defines all Pydantic models for API request/response and internal data structures.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict, Any
from backend.schemas.candidate import CandidateProfile


# ---------------------------------------------------------------------------
# Feedback / Report Schemas
# ---------------------------------------------------------------------------

class TopicBreakdown(BaseModel):
    """Per-topic score breakdown in the final report."""
    day: int = Field(..., description="Curriculum day number")
    title: str = Field(..., description="Curriculum day title")
    score: int = Field(..., ge=0, le=100, description="Score for this topic (0-100)")
    evidence: str = Field(..., description="Evidence from the interview supporting the score")
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)


class AnswerComparison(BaseModel):
    """Comparison of a weak candidate answer with an ideal stronger answer."""
    question: str = Field(..., description="The interview question asked")
    candidateAnswer: str = Field(..., description="What the candidate actually said")
    strongerAnswer: str = Field(..., description="Example of a stronger, more complete answer")


class FeedbackSchema(BaseModel):
    """Final interview feedback (inline, returned in interview response)."""
    summary: str = Field(..., description="High level summary of performance")
    strengths: List[str] = Field(default_factory=list, description="Key strengths demonstrated")
    gaps: List[str] = Field(default_factory=list, description="Knowledge gaps identified")
    next: List[str] = Field(default_factory=list, description="Recommended next learning objectives")
    readinessScore: int = Field(0, ge=0, le=100, description="Overall readiness score 0-100")
    readinessLabel: str = Field("Developing", description="Developing | Interview Ready | Strong")
    sessionId: Optional[str] = Field(None, description="Session ID for linking to full report")


class FullReportSchema(BaseModel):
    """Complete structured report returned by GET /api/report/{sessionId}."""
    sessionId: str
    candidateName: str
    targetRole: str
    readinessScore: int = Field(..., ge=0, le=100)
    readinessLabel: Literal["Developing", "Interview Ready", "Strong"]
    summary: str
    topicBreakdowns: List[TopicBreakdown] = Field(default_factory=list)
    demonstratedStrengths: List[str] = Field(default_factory=list)
    knowledgeGaps: List[str] = Field(default_factory=list)
    communicationFeedback: str = Field("")
    reviseNextPlan: List[str] = Field(default_factory=list, description="Prioritized topics with concrete actions")
    immediateNextActions: List[str] = Field(default_factory=list, description="Three immediate next steps")
    answerComparison: Optional[AnswerComparison] = Field(None, description="Weak vs stronger answer example")
    topicsSelectedExplanation: str = Field("", description="Why these topics were selected")
    selectedDays: List[int] = Field(default_factory=list)
    completedDays: int = Field(0)
    totalQuestions: int = Field(0)


# ---------------------------------------------------------------------------
# Adaptive Evaluation Schema
# ---------------------------------------------------------------------------

class AdaptiveEvaluation(BaseModel):
    """
    Schema-validated structured output from the adaptive evaluator.
    This is the core schema for driving interview flow.
    """
    assessment: Literal["strong", "partial", "weak"] = Field(
        ..., description="Overall assessment of the candidate's answer"
    )
    reasoning: str = Field(..., description="Brief candidate-specific evaluation reasoning")
    conceptsTested: List[str] = Field(
        default_factory=list, description="Concepts that were assessed in this turn"
    )
    followUpNeeded: bool = Field(
        False, description="Whether a follow-up probing question is needed"
    )
    questionType: Literal["planned", "follow-up", "recovery"] = Field(
        "planned", description="Type of next question to generate"
    )
    nextQuestion: str = Field(
        "", description="The adaptive next question to ask (empty if advancing)"
    )


# ---------------------------------------------------------------------------
# API Request / Response
# ---------------------------------------------------------------------------

class InterviewRequest(BaseModel):
    """POST /api/interview request body."""
    sessionId: str = Field(..., description="Unique interview session ID")
    candidate: Optional[CandidateProfile] = Field(None, description="Candidate profile (provided on start)")
    message: Optional[str] = Field(None, description="Candidate answer message (provided during turns)")


class InterviewProgress(BaseModel):
    """Live interview progress metadata returned with each response."""
    questionsAsked: int = Field(0, description="Number of questions asked so far")
    totalPlanned: int = Field(8, description="Total planned questions")
    daysAssessed: int = Field(0, description="Number of curriculum days covered so far")
    totalDaysTargeted: int = Field(4, description="Target curriculum days to cover")
    coveredDays: List[int] = Field(default_factory=list)
    currentQuestionType: Optional[str] = Field(None, description="planned | follow-up | recovery")
    currentDay: Optional[int] = Field(None, description="Curriculum day for current question")
    currentDayTitle: Optional[str] = Field(None, description="Curriculum day title for current question")


class InterviewResponse(BaseModel):
    """POST /api/interview response body."""
    reply: str = Field(..., description="Interviewer text response or question")
    done: bool = Field(False, description="Whether the interview is completed")
    feedback: Optional[FeedbackSchema] = Field(None, description="Final interview feedback if done=True")
    progress: Optional[InterviewProgress] = Field(None, description="Live interview progress data")


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    message: str = Field(..., description="Error message description")
