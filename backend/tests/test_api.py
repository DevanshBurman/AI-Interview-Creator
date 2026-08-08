import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.modules.session_manager import session_manager

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_sessions():
    """Reset session manager state before each test."""
    session_manager.clear_all_sessions()

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_start_interview():
    payload = {
        "sessionId": "test-session-001",
        "candidate": {
            "member": {
                "id": "CAND-001",
                "name": "Sarah Johnson",
                "jobRole": "Senior Data Engineer",
                "yearsExperience": 9,
                "education": "MS Computer Science",
                "status": "COMPLETED"
            },
            "missions": [
                {"day": 7, "title": "Embeddings Explained", "passed": True, "attempts": 1}
            ],
            "signals": {"commitDays": 28, "missionsCompleted": 30}
        }
    }
    response = client.post("/api/interview", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["done"] is False
    assert "Welcome" in data["reply"]
    assert session_manager.has_session("test-session-001")

def test_conversation_turn():
    # 1. Start session
    start_payload = {
        "sessionId": "test-session-002",
        "candidate": {
            "member": {"id": "CAND-002", "name": "Alex Turner"}
        }
    }
    client.post("/api/interview", json=start_payload)

    # 2. Conversation turn
    turn_payload = {
        "sessionId": "test-session-002",
        "message": "Vector embeddings represent text as dense numerical vectors."
    }
    response = client.post("/api/interview", json=turn_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["done"] is False
    assert "Mock interviewer question" in data["reply"]

def test_session_not_found():
    turn_payload = {
        "sessionId": "non-existent-session",
        "message": "Hello"
    }
    response = client.post("/api/interview", json=turn_payload)
    assert response.status_code == 404
