"""
Prompt Templates for AI Interview Agent.
Imports isolated prompt files to maintain modularity.
"""

from backend.prompts.system_prompt import SYSTEM_INTERVIEWER_PROMPT
from backend.prompts.question_prompt import QUESTION_GENERATION_PROMPT
from backend.prompts.followup_prompt import FOLLOWUP_QUESTION_PROMPT
from backend.prompts.evaluation_prompt import EVALUATION_PROMPT
from backend.prompts.feedback_prompt import FEEDBACK_PROMPT

__all__ = [
    "SYSTEM_INTERVIEWER_PROMPT",
    "QUESTION_GENERATION_PROMPT",
    "FOLLOWUP_QUESTION_PROMPT",
    "EVALUATION_PROMPT",
    "FEEDBACK_PROMPT",
]
