from typing import Dict, Any, List
from backend.models.session import InterviewSession
from backend.schemas.interview import FeedbackSchema
from backend.services.gemini import gemini_service

class FeedbackGenerator:
    """
    Feedback Module for AI Interview Agent.
    
    Responsibilities:
    - Formats complete session conversation history and evaluation logs.
    - Interacts with Gemini Service to generate structured final interview report.
    - Produces FeedbackSchema containing summary, strengths, gaps, and next learning steps.
    """

    def generate(self, session: InterviewSession) -> FeedbackSchema:
        """
        Generate structured final feedback report at the end of the interview.
        """
        candidate_name = session.candidate.member.name
        job_role = session.candidate.member.jobRole or "AI Candidate"

        # Format transcript
        transcript_lines: List[str] = []
        for idx, turn in enumerate(session.turn_history, start=1):
            q = turn.get("question", "N/A")
            a = turn.get("answer", "N/A")
            day = turn.get("day", "N/A")
            transcript_lines.append(f"Turn {idx} (Day {day}):\nInterviewer: {q}\nCandidate: {a}\n")

        transcript_str = "\n".join(transcript_lines) if transcript_lines else "Interview completed."

        # Format evaluation logs
        eval_lines: List[str] = []
        for idx, ev in enumerate(session.evaluation_history, start=1):
            score = ev.get("score", "N/A")
            reason = ev.get("reasoning", "N/A")
            gaps = ", ".join(ev.get("gaps", []))
            strengths = ", ".join(ev.get("strengths", []))
            eval_lines.append(f"Turn {idx}: Score={score}/10, Reasoning={reason}, Strengths=[{strengths}], Gaps=[{gaps}]")

        eval_str = "\n".join(eval_lines) if eval_lines else "No evaluations recorded."

        # Call Gemini service helper
        raw_fb = gemini_service.generate_final_feedback(
            candidate_name=candidate_name,
            job_role=job_role,
            transcript_str=transcript_str,
            evaluations_summary_str=eval_str
        )

        return FeedbackSchema(
            summary=raw_fb.get("summary", f"{candidate_name} completed the technical interview."),
            strengths=raw_fb.get("strengths", ["Solid AI engineering core understanding"]),
            gaps=raw_fb.get("gaps", ["Can deepen practical edge-case reasoning"]),
            next=raw_fb.get("next", ["Review advanced topic implementation trade-offs"])
        )

# Global feedback generator instance
feedback_generator = FeedbackGenerator()
