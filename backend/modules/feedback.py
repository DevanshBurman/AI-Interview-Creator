from typing import Dict, Any, List
from backend.models.session import InterviewSession
from backend.schemas.interview import FeedbackSchema, TopicBreakdown, AnswerComparison
from backend.services.gemini import gemini_service

class FeedbackGenerator:
    """
    Feedback Module for AI Interview Agent.
    Synthesizes transcript answers and evaluation history into dynamic evidence-based feedback.
    """

    def generate(self, session: InterviewSession) -> FeedbackSchema:
        """
        Generate structured final feedback report at the end of the interview.
        """
        candidate_name = session.candidate.member.name
        job_role = session.candidate.member.jobRole or "AI Candidate"

        # 1. Format transcript & turn data
        transcript_lines: List[str] = []
        short_answers_count = 0
        detailed_answers_count = 0
        all_gaps: List[str] = []
        all_strengths: List[str] = []

        day_turns_map: Dict[int, List[Dict[str, Any]]] = {}

        weakest_turn: Dict[str, Any] = {}
        lowest_turn_score = 999

        for idx, turn in enumerate(session.turn_history, start=1):
            q = turn.get("question", "N/A")
            a = turn.get("answer", "")
            day = turn.get("day", 7)
            words = a.strip().split()
            word_count = len(words)

            if day not in day_turns_map:
                day_turns_map[day] = []
            day_turns_map[day].append(turn)

            if word_count < 10:
                short_answers_count += 1
                all_gaps.append(f"Brief/surface-level response on Day {day} topic ('{a[:30]}...')")
            else:
                detailed_answers_count += 1

            transcript_lines.append(f"Turn {idx} (Day {day}):\nInterviewer: {q}\nCandidate: {a}\n")

        transcript_str = "\n".join(transcript_lines) if transcript_lines else "Interview completed."

        # 2. Format evaluation logs
        eval_lines: List[str] = []
        scores: List[int] = []
        for idx, ev in enumerate(session.evaluation_history, start=1):
            sc = int(ev.get("score", 7))
            scores.append(sc)
            reason = ev.get("reasoning", "N/A")
            gaps = ev.get("gaps", [])
            strengths = ev.get("strengths", [])

            all_gaps.extend(gaps)
            all_strengths.extend(strengths)

            eval_lines.append(f"Turn {idx}: Score={sc}/10, Reasoning={reason}, Strengths={strengths}, Gaps={gaps}")

            if sc < lowest_turn_score and idx <= len(session.turn_history):
                lowest_turn_score = sc
                weakest_turn = {
                    "question": session.turn_history[idx - 1].get("question", "Technical question"),
                    "answer": session.turn_history[idx - 1].get("answer", "No answer"),
                }

        eval_str = "\n".join(eval_lines) if eval_lines else "No evaluations recorded."
        avg_score = round(sum(scores) / max(1, len(scores)), 1)
        readiness_score = max(0, min(100, int(round(avg_score * 10))))

        if readiness_score >= 80:
            readiness_label = "Strong"
        elif readiness_score >= 55:
            readiness_label = "Interview Ready"
        else:
            readiness_label = "Developing"

        # 3. Construct Per-Topic Breakdowns from actual turns
        topic_breakdowns: List[TopicBreakdown] = []

        day_titles = {
          7: "Embeddings & Vector Spaces",
          8: "Vector Databases Overview",
          10: "Retrieval & Matching Engine",
          12: "Prompt Engineering Fundamentals",
          13: "Function Calling & Structured Outputs",
          16: "Chatbot Backend & API Integration",
          22: "Multi-Agent Orchestration",
          23: "Model Context Protocol (MCP)",
          28: "Docker & Kubernetes Deployment",
          31: "Capstone Project & Final Demo",
        }

        for day, turns in day_turns_map.items():
            day_scores = []
            day_evidence = []
            day_gaps = []
            day_strengths = []

            for t in turns:
                # Find matching evaluation
                turn_q = t.get("question", "")
                turn_a = t.get("answer", "")
                word_c = len(turn_a.strip().split())

                # Find eval by question match or position
                eval_item = None
                for ev in session.evaluation_history:
                    if ev.get("question") == turn_q or ev.get("reasoning"):
                        eval_item = ev
                        break

                sc = eval_item.get("score", 2) if eval_item else (8 if word_c >= 15 else 3)
                day_scores.append(sc)

                if word_c < 5:
                    day_evidence.append(f"Candidate gave a brief response ('{turn_a}') lacking technical depth.")
                    day_gaps.append("Brief answer without explanation")
                else:
                    day_evidence.append(f"Provided {word_c}-word explanation covering core concept.")
                    day_strengths.append("Provided detailed response")

            day_avg = round(sum(day_scores) / max(1, len(day_scores)), 1)
            t_score = int(round(day_avg * 10))

            topic_breakdowns.append(
                TopicBreakdown(
                    day=day,
                    title=day_titles.get(day, f"Day {day} Technical Topic"),
                    score=t_score,
                    evidence=" ".join(day_evidence),
                    strengths=day_strengths,
                    gaps=day_gaps,
                )
            )

        # 4. Refine Strengths vs Gaps based on candidate score
        unique_strengths = list(dict.fromkeys([s for s in all_strengths if s]))
        unique_gaps = list(dict.fromkeys([g for g in all_gaps if g]))

        if avg_score < 4.5:
            # Low score: do not claim strong communication or technical mastery!
            final_strengths = unique_strengths[:2] if unique_strengths else [
                "Completed all 8 interview turns",
                "Willingness to attempt assigned curriculum questions",
            ]
            final_gaps = unique_gaps[:4] if unique_gaps else [
                f"Candidate provided mostly brief responses ({short_answers_count} brief response(s))",
                "Lacks technical depth on key architectural concepts",
                "Requires practice articulating multi-paragraph explanations",
            ]
        else:
            final_strengths = unique_strengths[:3] if unique_strengths else [
                "Demonstrated solid conceptual understanding",
                "Provided clear technical communication",
            ]
            final_gaps = unique_gaps[:3] if unique_gaps else [
                "Could expand on edge-case scenarios and production trade-offs",
            ]

        # 5. Answer Comparison
        answer_comp = None
        if weakest_turn.get("question"):
            q_text = weakest_turn["question"]
            c_ans = weakest_turn["answer"]
            ideal_ans = (
                f"A strong answer for this topic would clearly define the core algorithm, "
                f"discuss architecture trade-offs (e.g. latency vs accuracy), and explain practical implementation details."
            )
            answer_comp = AnswerComparison(
                question=q_text,
                candidateAnswer=c_ans,
                strongerAnswer=ideal_ans,
            )

        # 6. Next objectives
        final_next = [
            f"Review core concepts from Day {session.covered_days[0] if session.covered_days else 7}",
            "Practice providing structured, multi-paragraph technical answers with concrete examples",
            "Focus on explaining trade-offs and architecture decisions during probing questions",
        ]

        summary_text = (
            f"{candidate_name} ({job_role}) completed all 8 interview turns with an average evaluation score of {avg_score}/10. "
            f"Candidate provided {detailed_answers_count} detailed response(s) and {short_answers_count} brief response(s)."
        )

        return FeedbackSchema(
            summary=summary_text,
            strengths=final_strengths,
            gaps=final_gaps,
            next=final_next,
            readinessScore=readiness_score,
            readinessLabel=readiness_label,
            topicBreakdowns=topic_breakdowns,
            answerComparison=answer_comp,
            selectedDays=session.covered_days,
            completedDays=len(session.covered_days),
            totalQuestions=len(session.turn_history),
        )

# Global feedback generator instance
feedback_generator = FeedbackGenerator()
