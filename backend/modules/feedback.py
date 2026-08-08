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
    - Synthesizes transcript answers and evaluation history into dynamic feedback.
    """

    def generate(self, session: InterviewSession) -> FeedbackSchema:
        """
        Generate structured final feedback report at the end of the interview.
        """
        candidate_name = session.candidate.member.name
        job_role = session.candidate.member.jobRole or "AI Candidate"

        # 1. Format transcript
        transcript_lines: List[str] = []
        short_answers_count = 0
        detailed_answers_count = 0
        topic_gaps: List[str] = []
        topic_strengths: List[str] = []

        for idx, turn in enumerate(session.turn_history, start=1):
            q = turn.get("question", "N/A")
            a = turn.get("answer", "")
            day = turn.get("day", "N/A")
            words = a.strip().split()
            word_count = len(words)

            if word_count < 10:
                short_answers_count += 1
                topic_gaps.append(f"Brief/surface-level response on Day {day} topic ({word_count} words)")
            else:
                detailed_answers_count += 1
                topic_strengths.append(f"Detailed explanation provided for Day {day} technical concepts")

            transcript_lines.append(f"Turn {idx} (Day {day}):\nInterviewer: {q}\nCandidate: {a}\n")

        transcript_str = "\n".join(transcript_lines) if transcript_lines else "Interview completed."

        # 2. Format evaluation logs
        eval_lines: List[str] = []
        scores: List[int] = []
        for idx, ev in enumerate(session.evaluation_history, start=1):
            sc = ev.get("score", 7)
            scores.append(sc)
            reason = ev.get("reasoning", "N/A")
            gaps = ", ".join(ev.get("gaps", []))
            strengths = ", ".join(ev.get("strengths", []))
            eval_lines.append(f"Turn {idx}: Score={sc}/10, Reasoning={reason}, Strengths=[{strengths}], Gaps=[{gaps}]")

        eval_str = "\n".join(eval_lines) if eval_lines else "No evaluations recorded."
        avg_score = round(sum(scores) / max(1, len(scores)), 1)

        # 3. Call Gemini service helper
        raw_fb = gemini_service.generate_final_feedback(
            candidate_name=candidate_name,
            job_role=job_role,
            transcript_str=transcript_str,
            evaluations_summary_str=eval_str
        )

        # If Gemini LLM is active, use its raw feedback. Otherwise dynamically construct from session data.
        if gemini_service.is_configured():
            return FeedbackSchema(
                summary=raw_fb.get("summary", f"{candidate_name} completed the technical interview with an average score of {avg_score}/10."),
                strengths=raw_fb.get("strengths", topic_strengths or ["Solid technical understanding"]),
                gaps=raw_fb.get("gaps", topic_gaps or ["Can expand on edge-case scenarios"]),
                next=raw_fb.get("next", ["Practice deep technical architectural explanations"])
            )

        # Dynamic fallback feedback based on actual candidate turns
        summary_text = (
            f"{candidate_name} ({job_role}) completed all 8 interview turns with an average evaluation score of {avg_score}/10. "
            f"Candidate provided {detailed_answers_count} detailed response(s) and {short_answers_count} brief response(s)."
        )

        final_strengths = topic_strengths[:3] if topic_strengths else [
            "Demonstrated willingness to engage across multiple curriculum topics",
            "Clear technical communication structure"
        ]

        final_gaps = topic_gaps[:3] if topic_gaps else [
            "Depth in vector database similarity trade-offs",
            "Observability and production monitoring considerations"
        ]

        final_next = [
            f"Review topics from Day {session.covered_days[0] if session.covered_days else 7} and Day {session.covered_days[1] if len(session.covered_days) > 1 else 8}",
            "Practice providing complete, multi-paragraph technical explanations during interview questions"
        ]

        return FeedbackSchema(
            summary=summary_text,
            strengths=final_strengths,
            gaps=final_gaps,
            next=final_next
        )

# Global feedback generator instance
feedback_generator = FeedbackGenerator()
