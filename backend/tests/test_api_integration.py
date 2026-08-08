import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.data_loader import data_loader
from backend.modules.session_manager import session_manager

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_state():
    data_loader.load_data()
    session_manager.clear_all_sessions()

def test_full_api_interview_flow():
    session_id = "http-integration-001"
    cand_profile = data_loader.get_candidate_by_id("CAND-001").model_dump()

    # 1. First request: Initialize Interview with candidate profile
    start_payload = {
        "sessionId": session_id,
        "candidate": cand_profile
    }
    res = client.post("/api/interview", json=start_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["done"] is False
    assert "reply" in data
    assert len(data["reply"]) > 5
    assert data.get("feedback") is None

    # 2. Subsequent requests: Conduct multi-turn conversation
    turns_count = 0
    done = False
    last_response_data = data

    detailed_answer = (
        "Vector embeddings convert textual concepts into dense floating point vectors where semantic similarity "
        "corresponds to geometric distance. We use vector databases like Qdrant and HNSW indexing for fast similarity search in RAG applications."
    )

    while not done and turns_count < 20:
        turns_count += 1
        turn_payload = {
            "sessionId": session_id,
            "message": detailed_answer
        }
        res = client.post("/api/interview", json=turn_payload)
        assert res.status_code == 200
        last_response_data = res.json()
        done = last_response_data["done"]

    # 3. Final request verification: Interview complete with structured feedback
    assert last_response_data["done"] is True
    assert last_response_data["reply"] == "Interview completed."
    fb = last_response_data["feedback"]
    assert fb is not None
    assert "summary" in fb
    assert "strengths" in fb and isinstance(fb["strengths"], list)
    assert "gaps" in fb and isinstance(fb["gaps"], list)
    assert "next" in fb and isinstance(fb["next"], list)

def test_api_validation_errors():
    # Session not found (404)
    res = client.post("/api/interview", json={"sessionId": "unknown-123", "message": "Hello"})
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

    # Empty message (400)
    # First start valid session
    cand_profile = data_loader.get_candidate_by_id("CAND-002").model_dump()
    client.post("/api/interview", json={"sessionId": "valid-123", "candidate": cand_profile})

    # Empty message turn
    res = client.post("/api/interview", json={"sessionId": "valid-123", "message": "   "})
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

    # Invalid payload (422)
    res = client.post("/api/interview", json={"sessionId": "valid-123"})
    assert res.status_code == 422
