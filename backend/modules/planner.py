import random
from typing import List, Set, Dict, Any, Optional
from backend.schemas.candidate import CandidateProfile
from backend.schemas.roadmap import InterviewRoadmap, RoadmapSlot
from backend.services.data_loader import data_loader

class Planner:
    """
    Planner Module for AI Interview Agent.
    
    Responsibilities:
    - Analyzes candidate profile completed missions and skipped topics.
    - Prioritizes completed missions (`passed=True`).
    - Treats skipped topics (`skipped=True`) only as optional probing opportunities.
    - Selects at least 4 distinct curriculum days spread across modules.
    - Generates a dynamic, randomized sequence of 8 interview question slots (shuffled each run).
    """

    DEFAULT_FALLBACK_DAYS = [7, 11, 22, 28]

    def build_roadmap(self, candidate: CandidateProfile) -> InterviewRoadmap:
        """
        Analyze candidate profile and construct a randomized 8-question interview roadmap.
        """
        # 1. Analyze completed (passed) missions and skipped topics
        passed_days: List[int] = []
        skipped_days: List[int] = []

        for mission in candidate.missions:
            if mission.passed:
                if mission.day not in passed_days:
                    passed_days.append(mission.day)
            elif mission.skipped:
                if mission.day not in skipped_days:
                    skipped_days.append(mission.day)

        # Shuffle passed_days to ensure randomized topic progression for each candidate interview
        random.shuffle(passed_days)
        random.shuffle(skipped_days)

        # 2. Select distinct curriculum days (minimum 4 days)
        selected_days: List[int] = list(passed_days)

        # Ensure we have at least 4 distinct days by including skipped or fallback days if needed
        if len(selected_days) < 4:
            for s_day in skipped_days:
                if s_day not in selected_days:
                    selected_days.append(s_day)
                if len(selected_days) >= 4:
                    break

        if len(selected_days) < 4:
            fallback_copy = list(self.DEFAULT_FALLBACK_DAYS)
            random.shuffle(fallback_copy)
            for f_day in fallback_copy:
                if f_day not in selected_days:
                    selected_days.append(f_day)
                if len(selected_days) >= 4:
                    break

        # Primary pool for random topic rotation
        primary_pool = [d for d in selected_days if d not in skipped_days]
        if not primary_pool:
            primary_pool = list(selected_days)

        random.shuffle(primary_pool)

        # 3. Plan 8 question slots
        slots: List[RoadmapSlot] = []
        num_slots = 8

        # Allocate 1 slot for probing a skipped topic if available
        probing_day: Optional[int] = skipped_days[0] if skipped_days else None
        probing_slot_index = random.choice([5, 6, 7]) if probing_day else None  # randomize probing position

        primary_idx = 0

        for i in range(1, num_slots + 1):
            if i == probing_slot_index and probing_day is not None:
                day_num = probing_day
                topic_type = "probing"
                is_skipped = True
            else:
                day_num = primary_pool[primary_idx % len(primary_pool)]
                primary_idx += 1
                topic_type = "primary"
                is_skipped = False

            # Fetch curriculum metadata via data_loader helper
            curr_day = data_loader.get_curriculum_day(day_num)
            curr_module = data_loader.get_module_for_day(day_num)

            day_title = curr_day.title if curr_day else f"Day {day_num} Topic"
            module_n = curr_module.n if curr_module else 1
            module_title = curr_module.title if curr_module else "General AI"
            objectives = curr_day.objectives if curr_day else []

            slot = RoadmapSlot(
                slot_index=i,
                day=day_num,
                day_title=day_title,
                module_n=module_n,
                module_title=module_title,
                topic_type=topic_type,
                objectives=objectives,
                is_skipped_topic=is_skipped,
            )
            slots.append(slot)

        # Extract unique covered curriculum days across all 8 slots
        covered_days = list(set(slot.day for slot in slots))
        random.shuffle(covered_days)

        return InterviewRoadmap(
            candidate_id=candidate.member.id,
            candidate_name=candidate.member.name,
            covered_days=covered_days,
            total_planned_questions=num_slots,
            slots=slots,
            completed_days_count=len(passed_days),
            skipped_days_count=len(skipped_days),
        )

# Global planner instance
planner = Planner()
