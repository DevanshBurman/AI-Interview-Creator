import logging
from typing import Optional, Dict, Any

from backend.schemas.candidate import CandidateProfile
from backend.schemas.interview import InterviewResponse, FeedbackSchema
from backend.models.session import InterviewSession
from backend.modules.session_manager import session_manager
from backend.modules.planner import planner
from backend.modules.memory import memory
from backend.modules.evaluation import evaluation_engine
from backend.modules.feedback import feedback_generator
from backend.services.gemini import gemini_service

logger = logging.getLogger(__name__)

class InterviewOrchestrator:
    """
    Interview Orchestrator.
    
    Responsibilities:
    - Owns the entire interview lifecycle:
        1. Initialize interview & load candidate profile.
        2. Coordinate Planner to generate 8-question roadmap covering 4+ curriculum days.
        3. Coordinate Memory to store context, turns, covered days, and progress.
        4. Coordinate Evaluation to assess technical depth across 4 core criteria.
        5. Coordinate Gemini to generate questions, follow-ups, and final feedback.
        6. Decide when to ask follow-up questions vs advance to next curriculum topic.
        7. Determine interview completion and produce structured FeedbackSchema.
    """

    def start_interview(self, session_id: str, candidate: CandidateProfile) -> InterviewResponse:
        """
        Initialize a new interview session for candidate.
        """
        # 1. Create or reset session in SessionManager
        session = session_manager.create_session(session_id, candidate)

        # 2. Coordinate Planner to build 8-question roadmap (covering >= 4 curriculum days)
        roadmap = planner.build_roadmap(candidate)
        session.roadmap = roadmap
        session.covered_days = list(roadmap.covered_days)

        # 3. Get first question slot (Slot 1)
        slot1 = roadmap.slots[0]

        # 4. Coordinate Gemini to generate initial question
        question_text = gemini_service.generate_question(
            candidate_name=candidate.member.name,
            job_role=candidate.member.jobRole or "AI Candidate",
            day_num=slot1.day,
            day_title=slot1.day_title,
            module_title=slot1.module_title,
            topic_type=slot1.topic_type,
            objectives=slot1.objectives,
            conversation_context="Interview starting."
        )

        # 5. Record question in Memory
        memory.record_question(session, question_text, slot_index=1, day=slot1.day)

        logger.info(f"Started interview for session '{session_id}' candidate '{candidate.member.name}'.")

        return InterviewResponse(
            reply=question_text,
            done=False
        )

    def process_turn(self, session_id: str, message: str) -> InterviewResponse:
        """
        Process candidate response turn, evaluate, decide follow-up vs next topic, or finish interview.
        """
        # 1. Load session from SessionManager
        session = session_manager.get_session(session_id)
        if session is None:
            raise ValueError("Session not found. Please start an interview session first.")

        if session.is_completed:
            raise ValueError("Interview has already completed.")

        if not session.roadmap or not session.roadmap.slots:
            raise ValueError("Session roadmap is missing.")

        # 2. Record candidate answer in Memory
        memory.record_answer(session, message)

        current_slot_idx = session.current_question_index  # 1-indexed (1 to 8)
        current_slot = session.roadmap.slots[current_slot_idx - 1]

        # 3. Coordinate Evaluation Engine to score response across 4 criteria
        eval_result = evaluation_engine.evaluate_response(
            question=session.current_question or current_slot.day_title,
            answer=message,
            day_num=current_slot.day,
            day_title=current_slot.day_title,
            objectives=current_slot.objectives
        )

        # 4. Record evaluation in Memory
        memory.record_evaluation(session, eval_result.model_dump())

        # Check if last question asked was already a follow-up for this slot
        already_asked_followup = (
            len(session.turn_history) >= 2 and
            session.turn_history[-2].get("slot_index") == current_slot_idx
        )

        # 5. Decision Logic: Follow-up vs Progression
        if eval_result.followUpRequired and not already_asked_followup:
            # Generate follow-up question via Gemini
            followup_text = gemini_service.generate_followup_question(
                candidate_name=session.candidate.member.name,
                day_num=current_slot.day,
                day_title=current_slot.day_title,
                previous_question=session.current_question or current_slot.day_title,
                candidate_answer=message,
                objectives=current_slot.objectives
            )

            # Record follow-up question in Memory (stays on same slot_index)
            memory.record_question(session, followup_text, slot_index=current_slot_idx, day=current_slot.day)

            logger.info(f"Session '{session_id}' - Follow-up requested for slot {current_slot_idx} (Day {current_slot.day}).")
            return InterviewResponse(
                reply=followup_text,
                done=False
            )

        # 6. Advance to next topic
        next_slot_idx = current_slot_idx + 1

        # Check Interview Completion (if total planned questions reached)
        if next_slot_idx > session.roadmap.total_planned_questions:
            # Mark session complete in Memory
            memory.mark_completed(session)

            # Generate final feedback via FeedbackGenerator
            feedback_data = feedback_generator.generate(session)

            logger.info(f"Session '{session_id}' completed successfully.")
            return InterviewResponse(
                reply="Interview completed.",
                done=True,
                feedback=feedback_data
            )

        # 7. Next Curriculum Topic Question
        next_slot = session.roadmap.slots[next_slot_idx - 1]
        ctx_summary = f"Covered days: {session.covered_days}. Turns completed: {len(session.candidate_responses)}."

        next_q_text = gemini_service.generate_question(
            candidate_name=session.candidate.member.name,
            job_role=session.candidate.member.jobRole or "AI Candidate",
            day_num=next_slot.day,
            day_title=next_slot.day_title,
            module_title=next_slot.module_title,
            topic_type=next_slot.topic_type,
            objectives=next_slot.objectives,
            conversation_context=ctx_summary
        )

        # Record next question in Memory
        memory.record_question(session, next_q_text, slot_index=next_slot_idx, day=next_slot.day)

        logger.info(f"Session '{session_id}' - Advancing to slot {next_slot_idx} (Day {next_slot.day}).")

        return InterviewResponse(
            reply=next_q_text,
            done=False
        )

# Global orchestrator instance
interview_orchestrator = InterviewOrchestrator()
