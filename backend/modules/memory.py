from typing import List, Dict, Any, Optional
from backend.models.session import InterviewSession
from backend.schemas.roadmap import InterviewRoadmap

class InterviewMemory:
    """
    Memory Module for AI Interview Agent.
    
    Responsibilities:
    - Stores current question, previous questions, candidate answers.
    - Tracks covered curriculum days and interview progress.
    - Stores evaluation history per turn.
    - Assembles full session memory context for AI reasoning and prompt building.
    - Memory exists only during the active interview session.
    """

    def record_question(self, session: InterviewSession, question_text: str, slot_index: int, day: int) -> None:
        """Record the active interviewer question and track covered curriculum day."""
        session.current_question = question_text
        session.current_question_index = slot_index

        if day not in session.covered_days:
            session.covered_days.append(day)

        session.update_timestamp()

    def record_answer(self, session: InterviewSession, answer_text: str) -> None:
        """Record candidate response and append to history."""
        if session.current_question and session.current_question not in session.previous_questions:
            session.previous_questions.append(session.current_question)

        session.candidate_responses.append(answer_text)

        # Record structured turn history entry
        turn_entry = {
            "slot_index": session.current_question_index,
            "question": session.current_question,
            "answer": answer_text,
            "day": session.covered_days[-1] if session.covered_days else None
        }
        session.turn_history.append(turn_entry)
        session.update_timestamp()

    def record_evaluation(self, session: InterviewSession, evaluation_data: Dict[str, Any]) -> None:
        """Store response evaluation results."""
        session.evaluation_history.append(evaluation_data)
        session.update_timestamp()

    def get_current_question(self, session: InterviewSession) -> Optional[str]:
        """Get current active question."""
        return session.current_question

    def get_previous_questions(self, session: InterviewSession) -> List[str]:
        """Get list of all previously asked questions."""
        return list(session.previous_questions)

    def get_candidate_answers(self, session: InterviewSession) -> List[str]:
        """Get list of all candidate responses."""
        return list(session.candidate_responses)

    def get_covered_days(self, session: InterviewSession) -> List[int]:
        """Get list of curriculum days covered so far."""
        return list(session.covered_days)

    def get_evaluation_history(self, session: InterviewSession) -> List[Dict[str, Any]]:
        """Get evaluation history."""
        return list(session.evaluation_history)

    def get_interview_progress(self, session: InterviewSession) -> Dict[str, Any]:
        """Calculate and return current interview progress indicators."""
        total_steps = 8
        if session.roadmap:
            total_steps = session.roadmap.total_planned_questions

        current_step = len(session.candidate_responses)
        percentage = min(100.0, round((current_step / total_steps) * 100.0, 1))

        return {
            "current_step": current_step,
            "total_steps": total_steps,
            "progress_percentage": percentage,
            "covered_days": list(session.covered_days),
            "is_completed": session.is_completed,
        }

    def get_full_context(self, session: InterviewSession) -> Dict[str, Any]:
        """Assemble full session memory context for AI reasoning and prompt construction."""
        return {
            "sessionId": session.sessionId,
            "candidate": {
                "id": session.candidate.member.id,
                "name": session.candidate.member.name,
                "jobRole": session.candidate.member.jobRole,
            },
            "roadmap": session.roadmap.model_dump() if session.roadmap else None,
            "current_question": session.current_question,
            "current_step_index": session.current_question_index,
            "previous_questions": list(session.previous_questions),
            "candidate_responses": list(session.candidate_responses),
            "turn_history": list(session.turn_history),
            "covered_days": list(session.covered_days),
            "evaluation_history": list(session.evaluation_history),
            "progress": self.get_interview_progress(session),
        }

    def mark_completed(self, session: InterviewSession) -> None:
        """Mark interview session as completed."""
        session.is_completed = True
        session.update_timestamp()

# Global memory instance
memory = InterviewMemory()
