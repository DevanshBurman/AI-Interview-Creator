from pydantic import BaseModel, Field
from typing import List, Optional

class RoadmapSlot(BaseModel):
    slot_index: int = Field(..., description="Position in the interview sequence (1-8)")
    day: int = Field(..., description="Curriculum day number (1-31)")
    day_title: str = Field(..., description="Title of the curriculum day topic")
    module_n: int = Field(..., description="Module number (1-8)")
    module_title: str = Field(..., description="Title of the module")
    topic_type: str = Field("primary", description="Slot type: 'primary' concept or 'probing' question")
    objectives: List[str] = Field(default_factory=list, description="Target learning objectives for this slot")
    is_skipped_topic: bool = Field(False, description="True if probing a topic skipped by candidate")

class InterviewRoadmap(BaseModel):
    candidate_id: str = Field(..., description="Candidate ID")
    candidate_name: str = Field(..., description="Candidate Name")
    covered_days: List[int] = Field(..., description="List of distinct curriculum days covered (min 4)")
    total_planned_questions: int = Field(8, description="Total planned questions count (8)")
    slots: List[RoadmapSlot] = Field(..., description="Sequence of 8 planned interview question slots")
    completed_days_count: int = Field(..., description="Number of passed mission days analyzed")
    skipped_days_count: int = Field(..., description="Number of skipped mission days analyzed")
