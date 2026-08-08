import pytest
from backend.services.data_loader import data_loader

@pytest.fixture(autouse=True)
def ensure_data_loaded():
    """Ensure data loader is initialized before tests."""
    data_loader.load_data()

def test_data_loaded_status():
    assert data_loader.is_loaded() is True

def test_get_candidate_by_id():
    candidate = data_loader.get_candidate_by_id("CAND-001")
    assert candidate is not None
    assert candidate.member.id == "CAND-001"
    assert candidate.member.name == "Sarah Johnson"
    assert candidate.member.jobRole == "Senior Data Engineer"

def test_get_curriculum_day():
    day_7 = data_loader.get_curriculum_day(7)
    assert day_7 is not None
    assert day_7.day == 7
    assert day_7.title == "Embeddings Explained"
    assert len(day_7.objectives) > 0

def test_get_learning_objectives():
    objectives = data_loader.get_learning_objectives(7)
    assert isinstance(objectives, list)
    assert len(objectives) > 0
    assert any("embedding" in obj.lower() for obj in objectives)

def test_get_module_for_day():
    module = data_loader.get_module_for_day(7)
    assert module is not None
    assert module.n == 3
    assert module.title == "Embeddings & Vector Search"

def test_get_all_candidates():
    candidates = data_loader.get_all_candidates()
    assert isinstance(candidates, list)
    assert len(candidates) > 0
    ids = [c.member.id for c in candidates]
    assert "CAND-001" in ids

def test_get_all_curriculum_days():
    days = data_loader.get_all_curriculum_days()
    assert isinstance(days, list)
    assert len(days) == 31
    assert days[0].day == 1
    assert days[-1].day == 31
