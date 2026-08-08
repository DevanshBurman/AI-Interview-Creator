from pydantic import BaseModel, Field
from typing import List, Optional

class EvaluationResult(BaseModel):
    score: int = Field(..., description="Technical score from 1 to 10")
    technical_correctness: bool = Field(..., description="Whether answer is technically correct")
    conceptual_understanding: bool = Field(True, description="Whether candidate demonstrates core conceptual understanding")
    practical_reasoning: bool = Field(True, description="Whether candidate shows practical reasoning/trade-off awareness")
    communication_clarity: bool = Field(True, description="Whether answer is clearly communicated")
    followUpRequired: bool = Field(False, description="Whether a follow-up probing question should be generated")
    gaps: List[str] = Field(default_factory=list, description="List of technical gaps or missing details")
    strengths: List[str] = Field(default_factory=list, description="List of demonstrated technical strengths")
    reasoning: str = Field(..., description="Evaluation summary explanation")
