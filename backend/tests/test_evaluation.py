import pytest
from backend.modules.evaluation import evaluation_engine
from backend.schemas.evaluation import EvaluationResult

def test_evaluate_strong_answer():
    question = "Can you explain why vector embeddings are useful for semantic search?"
    answer = "Vector embeddings convert high-dimensional textual concepts into dense numerical vectors where semantic similarity corresponds to geometric distance using metrics like cosine similarity or dot product. This allows RAG systems to perform semantic retrieval beyond exact keyword matching."
    objectives = ["Understand vector embeddings", "Explain similarity metrics"]

    res = evaluation_engine.evaluate_response(
        question=question,
        answer=answer,
        day_num=7,
        day_title="Embeddings Explained",
        objectives=objectives
    )

    assert isinstance(res, EvaluationResult)
    assert res.score >= 6
    assert res.technical_correctness is True
    assert res.conceptual_understanding is True
    assert res.practical_reasoning is True
    assert res.communication_clarity is True
    assert res.followUpRequired is False

def test_evaluate_short_answer_requires_followup():
    question = "How does HNSW index work in vector databases?"
    answer = "It is a graph."
    objectives = ["Understand vector index types"]

    res = evaluation_engine.evaluate_response(
        question=question,
        answer=answer,
        day_num=8,
        day_title="Vector Databases Overview",
        objectives=objectives
    )

    assert isinstance(res, EvaluationResult)
    assert res.followUpRequired is True

def test_evaluate_empty_answer():
    res = evaluation_engine.evaluate_response(
        question="What is RAG?",
        answer="",
        day_num=11,
        day_title="RAG End-to-End",
        objectives=["RAG architecture"]
    )

    assert res.score == 1
    assert res.technical_correctness is False
    assert res.followUpRequired is True
    assert "empty" in res.reasoning.lower()
