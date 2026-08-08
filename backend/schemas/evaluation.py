"""
Evaluation Schema for ABTalks AI Cohort Interviewer.
Defines structured evaluation result with assessment-based logic.
"""

from pydantic import BaseModel, Field
from typing import List, Literal


class EvaluationResult(BaseModel):
    """
    Structured evaluation result from assessment of a candidate's answer.
    Uses strong/partial/weak assessment categories for adaptive follow-up logic.
    """
    score: int = Field(..., ge=1, le=10, description="Technical score from 1 to 10")
    assessment: Literal["strong", "partial", "weak"] = Field(
        "partial", description="Overall assessment: strong | partial | weak"
    )
    technical_correctness: bool = Field(..., description="Whether answer is technically correct")
    conceptual_understanding: bool = Field(True, description="Whether candidate demonstrates core conceptual understanding")
    practical_reasoning: bool = Field(True, description="Whether candidate shows practical reasoning/trade-off awareness")
    communication_clarity: bool = Field(True, description="Whether answer is clearly communicated")
    followUpRequired: bool = Field(False, description="Whether a follow-up probing question should be generated")
    questionType: Literal["planned", "follow-up", "recovery"] = Field(
        "planned", description="Type of next question recommended"
    )
    gaps: List[str] = Field(default_factory=list, description="List of technical gaps or missing details")
    strengths: List[str] = Field(default_factory=list, description="List of demonstrated technical strengths")
    conceptsTested: List[str] = Field(default_factory=list, description="Concepts tested in this evaluation")
    reasoning: str = Field(..., description="Evaluation summary explanation")
