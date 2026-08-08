import pytest
from backend.services.data_loader import data_loader
from backend.modules.session_manager import session_manager
from backend.modules.planner import planner
from backend.modules.memory import memory

@pytest.fixture(autouse=True)
def setup_data_and_session():
    data_loader.load_data()
    session_manager.clear_all_sessions()

def test_memory_lifecycle():
    candidate = data_loader.get_candidate_by_id("CAND-001")
    session = session_manager.create_session("mem-test-001", candidate)
    roadmap = planner.build_roadmap(candidate)
    session.roadmap = roadmap

    # Initial state
    progress = memory.get_interview_progress(session)
    assert progress["current_step"] == 0
    assert progress["total_steps"] == 8
    assert progress["progress_percentage"] == 0.0
    assert progress["is_completed"] is False

    # Record question 1
    q1 = "Can you explain why vector embeddings are useful?"
    memory.record_question(session, q1, slot_index=1, day=7)
    assert memory.get_current_question(session) == q1
    assert 7 in memory.get_covered_days(session)

    # Record answer 1
    a1 = "Embeddings convert semantic meaning into dense floating point vectors."
    memory.record_answer(session, a1)
    assert len(memory.get_candidate_answers(session)) == 1
    assert memory.get_previous_questions(session)[0] == q1

    # Record evaluation 1
    eval1 = {"score": 8, "technical_correctness": True, "feedback": "Good answer"}
    memory.record_evaluation(session, eval1)
    assert len(memory.get_evaluation_history(session)) == 1

    # Verify updated progress
    progress = memory.get_interview_progress(session)
    assert progress["current_step"] == 1
    assert progress["progress_percentage"] == 12.5

    # Context assembly
    ctx = memory.get_full_context(session)
    assert ctx["sessionId"] == "mem-test-001"
    assert ctx["candidate"]["id"] == "CAND-001"
    assert len(ctx["turn_history"]) == 1
    assert ctx["turn_history"][0]["question"] == q1
    assert ctx["turn_history"][0]["answer"] == a1

    # Mark completed
    memory.mark_completed(session)
    assert session.is_completed is True
