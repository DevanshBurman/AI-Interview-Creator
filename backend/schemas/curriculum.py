from pydantic import BaseModel, Field
from typing import List, Optional

class CurriculumDay(BaseModel):
    day: int = Field(..., description="Curriculum day number (1-31)")
    title: str = Field(..., description="Daily topic title")
    type: str = Field(..., description="Topic type, e.g. SETUP, CONCEPT, BUILD")
    tools: List[str] = Field(default_factory=list, description="Tools and technologies introduced")
    objectives: List[str] = Field(default_factory=list, description="Key learning objectives for the day")

class CurriculumModule(BaseModel):
    n: int = Field(..., description="Module number (1-8)")
    title: str = Field(..., description="Module title")
    days: List[int] = Field(..., description="Range of day numbers [start_day, end_day]")

class CurriculumData(BaseModel):
    cohort: str = Field(..., description="Cohort title and metadata")
    modules: List[CurriculumModule] = Field(default_factory=list, description="List of modules")
    days: List[CurriculumDay] = Field(default_factory=list, description="List of daily topics")
