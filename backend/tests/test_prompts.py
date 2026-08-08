import pytest
from backend.prompts import (
    SYSTEM_INTERVIEWER_PROMPT,
    QUESTION_GENERATION_PROMPT,
    FOLLOWUP_QUESTION_PROMPT,
    EVALUATION_PROMPT,
    FEEDBACK_PROMPT,
)

def test_system_prompt_exists():
    assert len(SYSTEM_INTERVIEWER_PROMPT) > 20
    assert "Interviewer" in SYSTEM_INTERVIEWER_PROMPT

def test_question_generation_prompt_placeholders():
    formatted = QUESTION_GENERATION_PROMPT.format(
        candidate_name="Alex Turner",
        job_role="Backend Engineer",
        day_num=8,
        day_title="Vector Databases Overview",
        module_title="Embeddings & Vector Search",
        topic_type="primary",
        objectives_list="- Learn Indexing",
        conversation_context="Started"
    )
    assert "Alex Turner" in formatted
    assert "Vector Databases Overview" in formatted

def test_followup_prompt_placeholders():
    formatted = FOLLOWUP_QUESTION_PROMPT.format(
        candidate_name="Alex Turner",
        day_num=8,
        day_title="Vector Databases Overview",
        previous_question="What is HNSW?",
        candidate_answer="Graph index.",
        objectives_list="- Indexing algorithms"
    )
    assert "What is HNSW?" in formatted
    assert "Graph index." in formatted

def test_evaluation_prompt_placeholders():
    formatted = EVALUATION_PROMPT.format(
        day_num=8,
        day_title="Vector Databases Overview",
        question="What is HNSW?",
        answer="Hierarchical Navigable Small World graph.",
        objectives_list="- Graph indexing"
    )
    assert "Hierarchical Navigable Small World" in formatted
    assert "score" in formatted

def test_feedback_prompt_placeholders():
    formatted = FEEDBACK_PROMPT.format(
        candidate_name="Alex Turner",
        job_role="Backend Engineer",
        transcript="Q1: ... A1: ...",
        evaluations_summary="Score: 8"
    )
    assert "Alex Turner" in formatted
    assert "transcript" in formatted.lower()
