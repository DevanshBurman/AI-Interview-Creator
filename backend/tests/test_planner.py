import pytest
from backend.services.data_loader import data_loader
from backend.modules.planner import planner

@pytest.fixture(autouse=True)
def ensure_data_loaded():
    """Ensure data loader is ready."""
    data_loader.load_data()

def test_planner_cand_001_sarah():
    candidate = data_loader.get_candidate_by_id("CAND-001")
    assert candidate is not None

    roadmap = planner.build_roadmap(candidate)
    assert roadmap.candidate_id == "CAND-001"
    assert roadmap.candidate_name == "Sarah Johnson"
    assert roadmap.total_planned_questions == 8
    assert len(roadmap.slots) == 8
    assert len(roadmap.covered_days) >= 4

    # Check skipped topic probing (Day 29 is skipped for Sarah)
    probing_slots = [s for s in roadmap.slots if s.is_skipped_topic]
    assert len(probing_slots) >= 1
    assert probing_slots[0].day == 29

def test_planner_cand_002_alex():
    candidate = data_loader.get_candidate_by_id("CAND-002")
    assert candidate is not None

    roadmap = planner.build_roadmap(candidate)
    assert roadmap.candidate_id == "CAND-002"
    assert len(roadmap.slots) == 8
    assert len(roadmap.covered_days) >= 4

def test_planner_cand_003_emily():
    candidate = data_loader.get_candidate_by_id("CAND-003")
    assert candidate is not None

    roadmap = planner.build_roadmap(candidate)
    assert roadmap.candidate_id == "CAND-003"
    assert len(roadmap.slots) == 8
    assert len(roadmap.covered_days) >= 4
    # Emily completed all 31 missions
    assert roadmap.completed_days_count > 0

def test_planner_slot_structure():
    candidate = data_loader.get_candidate_by_id("CAND-001")
    roadmap = planner.build_roadmap(candidate)

    for idx, slot in enumerate(roadmap.slots, start=1):
        assert slot.slot_index == idx
        assert slot.day >= 1 and slot.day <= 31
        assert len(slot.day_title) > 0
        assert slot.module_n >= 1
        assert len(slot.module_title) > 0
        assert len(slot.objectives) > 0
