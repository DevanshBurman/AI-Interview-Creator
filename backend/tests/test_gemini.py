import pytest
from backend.services.gemini import GeminiService, gemini_service
from backend.prompts.templates import (
    QUESTION_GENERATION_PROMPT,
    FOLLOWUP_QUESTION_PROMPT,
    EVALUATION_PROMPT,
    FEEDBACK_PROMPT,
)

def test_gemini_service_initialization():
    srv = GeminiService(api_key="test-key")
    assert srv.api_key == "test-key"

def test_prompt_formatting():
    q_prompt = QUESTION_GENERATION_PROMPT.format(
        candidate_name="Sarah Johnson",
        job_role="Senior Data Engineer",
        day_num=7,
        day_title="Embeddings Explained",
        module_title="Embeddings & Vector Search",
        topic_type="primary",
        objectives_list="- Understand vector representations",
        conversation_context="None"
    )
    assert "Sarah Johnson" in q_prompt
    assert "Embeddings Explained" in q_prompt

    f_prompt = FOLLOWUP_QUESTION_PROMPT.format(
        candidate_name="Sarah Johnson",
        day_num=7,
        day_title="Embeddings Explained",
        previous_question="What is an embedding?",
        candidate_answer="It is a vector.",
        objectives_list="- Dense representations"
    )
    assert "What is an embedding?" in f_prompt

def test_generate_question_fallback():
    srv = GeminiService(api_key="")  # Unconfigured API key triggers fallback
    q = srv.generate_question(
        candidate_name="Alex Turner",
        job_role="Backend Software Engineer",
        day_num=11,
        day_title="RAG End-to-End",
        module_title="LLM Core",
        topic_type="primary",
        objectives=["Build RAG pipeline"]
    )
    assert isinstance(q, str)
    assert len(q) > 10
    assert "RAG End-to-End" in q or "11" in q

def test_evaluate_response_fallback():
    srv = GeminiService(api_key="")
    res = srv.evaluate_response(
        day_num=7,
        day_title="Embeddings",
        question="What is an embedding?",
        candidate_answer="A vector of floating numbers.",
        objectives=["Understand embeddings"]
    )
    assert isinstance(res, dict)
    assert "score" in res
    assert "technical_correctness" in res
    assert "followUpRequired" in res

def test_generate_final_feedback_fallback():
    srv = GeminiService(api_key="")
    fb = srv.generate_final_feedback(
        candidate_name="Sarah Johnson",
        job_role="Senior Data Engineer",
        transcript_str="Q: Hello\nA: Hi",
        evaluations_summary_str="Good performance"
    )
    assert isinstance(fb, dict)
    assert "summary" in fb
    assert "strengths" in fb
    assert "gaps" in fb
    assert "next" in fb
