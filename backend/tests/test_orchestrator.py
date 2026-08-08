import pytest
from backend.services.data_loader import data_loader
from backend.modules.session_manager import session_manager
from backend.orchestrator.interview import interview_orchestrator
from backend.schemas.interview import InterviewResponse, FeedbackSchema

@pytest.fixture(autouse=True)
def reset_environment():
    data_loader.load_data()
    session_manager.clear_all_sessions()

def test_start_interview_orchestration():
    candidate = data_loader.get_candidate_by_id("CAND-001")
    session_id = "orch-test-001"

    response = interview_orchestrator.start_interview(session_id, candidate)
    assert isinstance(response, InterviewResponse)
    assert response.done is False
    assert len(response.reply) > 10

    # Verify session state created in memory
    session = session_manager.get_session(session_id)
    assert session is not None
    assert session.roadmap is not None
    assert session.roadmap.total_planned_questions == 8
    assert len(session.covered_days) >= 4

def test_full_interview_lifecycle():
    candidate = data_loader.get_candidate_by_id("CAND-001")
    session_id = "orch-test-002"

    # 1. Start interview
    res = interview_orchestrator.start_interview(session_id, candidate)
    assert res.done is False

    # 2. Progress through interview until all 8 slots are completed
    turns_count = 0
    last_res = res
    detailed_answer = (
        "Vector embeddings convert text into dense floating-point vector representations "
        "capturing semantic meaning so geometric distance metric matches semantic similarity. "
        "We use HNSW graphs in vector databases like Qdrant to perform approximate nearest neighbor search."
    )

    while not last_res.done and turns_count < 20:
        turns_count += 1
        last_res = interview_orchestrator.process_turn(session_id, detailed_answer)

    # Verify final response is completed and includes feedback
    assert last_res is not None
    assert last_res.done is True
    assert last_res.feedback is not None
    assert isinstance(last_res.feedback, FeedbackSchema)
    assert len(last_res.feedback.summary) > 0
    assert len(last_res.feedback.strengths) > 0
    assert len(last_res.feedback.gaps) > 0
    assert len(last_res.feedback.next) > 0
