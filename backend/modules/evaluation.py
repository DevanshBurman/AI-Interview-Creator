"""
Evaluation Module for ABTalks AI Cohort Interviewer.

Implements adaptive evaluation with structured strong/partial/weak assessment.
- Strong answer → apply design, trade-off, scalability follow-up
- Partial answer → probe the missing concept
- Weak answer → ask one simpler recovery question, then move on
"""

import logging
from typing import List, Dict, Any, Literal

from backend.schemas.evaluation import EvaluationResult
from backend.services.gemini import gemini_service

logger = logging.getLogger(__name__)


class EvaluationEngine:
    """
    Evaluation Module for AI Interview Agent.

    Responsibilities:
    - Evaluates candidate responses using Gemini AI (with retry + fallback).
    - Returns structured EvaluationResult with strong/partial/weak assessment.
    - Drives adaptive flow: follow-up type, recovery vs. probing.
    - Never exposes model errors to the UI.
    """

    def evaluate_response(
        self,
        question: str,
        answer: str,
        day_num: int,
        day_title: str,
        objectives: List[str],
        previous_follow_up_count: int = 0,
    ) -> EvaluationResult:
        """
        Evaluate candidate response and determine adaptive next step.

        Args:
            question: The question that was asked
            answer: The candidate's answer
            day_num: Curriculum day number
            day_title: Curriculum day title
            objectives: Learning objectives for this day
            previous_follow_up_count: How many follow-ups already asked for this slot
        """
        clean_ans = answer.strip() if answer else ""
        words = clean_ans.split()
        word_count = len(words)

        # ---- Empty answer ----
        if not clean_ans:
            return EvaluationResult(
                score=1,
                assessment="weak",
                technical_correctness=False,
                conceptual_understanding=False,
                practical_reasoning=False,
                communication_clarity=False,
                followUpRequired=True,
                questionType="recovery",
                gaps=["No response provided"],
                strengths=[],
                conceptsTested=[],
                reasoning="Candidate provided an empty answer.",
            )

        # ---- Trivial / gibberish ----
        is_gibberish = word_count < 4 or (word_count == 1 and len(clean_ans) < 6)

        # ---- AI evaluation (with one retry) ----
        raw_eval: Dict[str, Any] = {}
        for attempt in range(2):
            try:
                raw_eval = gemini_service.evaluate_response(
                    day_num=day_num,
                    day_title=day_title,
                    question=question,
                    candidate_answer=clean_ans,
                    objectives=objectives,
                )
                break  # success
            except Exception as exc:
                logger.warning(f"Evaluation attempt {attempt + 1} failed: {exc}")
                if attempt == 1:
                    # Use deterministic fallback
                    raw_eval = self._fallback_eval(word_count, clean_ans, day_num)

        if is_gibberish:
            assessment: Literal["strong", "partial", "weak"] = "weak"
            score = 2
            technical_correctness = False
            conceptual_understanding = False
            practical_reasoning = False
            communication_clarity = False
            gaps = [f"Trivial or gibberish response on Day {day_num}"]
            strengths: List[str] = []
            concepts_tested: List[str] = []
            reasoning = f"Answer '{clean_ans}' lacks technical substance."
            question_type: Literal["planned", "follow-up", "recovery"] = "recovery"
            follow_up_required = True
        else:
            score = max(1, min(10, int(raw_eval.get("score", 7))))
            gaps = raw_eval.get("gaps", [])
            strengths = raw_eval.get("strengths", [])
            reasoning = raw_eval.get("reasoning", "Evaluated technical answer.")
            concepts_tested = raw_eval.get("conceptsTested", [])

            technical_correctness = bool(raw_eval.get("technical_correctness", True) and score >= 6)
            conceptual_understanding = bool(score >= 5 and len(gaps) <= 2)
            practical_reasoning = bool(score >= 6 and word_count >= 15)
            communication_clarity = bool(word_count >= 8)

            # Determine assessment level
            if score >= 8 and technical_correctness and not gaps:
                assessment = "strong"
            elif score >= 5 and (technical_correctness or conceptual_understanding):
                assessment = "partial"
            else:
                assessment = "weak"

            # Determine question type for next question
            ai_follow_up = bool(raw_eval.get("followUpRequired", False))
            follow_up_required = ai_follow_up and previous_follow_up_count == 0
            
            if assessment == "strong":
                question_type = "follow-up" if follow_up_required else "planned"
            elif assessment == "partial":
                question_type = "follow-up" if follow_up_required else "planned"
            else:
                question_type = "recovery" if follow_up_required else "planned"

        logger.info(
            f"Evaluation: score={score}, assessment={assessment}, "
            f"question_type={question_type}, follow_up={follow_up_required}, "
            f"day={day_num}"
        )

        return EvaluationResult(
            score=score,
            assessment=assessment,
            technical_correctness=technical_correctness,
            conceptual_understanding=conceptual_understanding,
            practical_reasoning=practical_reasoning,
            communication_clarity=communication_clarity,
            followUpRequired=follow_up_required,
            questionType=question_type,
            gaps=gaps,
            strengths=strengths,
            conceptsTested=concepts_tested,
            reasoning=reasoning,
        )

    def _fallback_eval(self, word_count: int, answer: str, day_num: int) -> Dict[str, Any]:
        """Deterministic fallback evaluation when AI fails."""
        if word_count < 4:
            return {
                "score": 2,
                "technical_correctness": False,
                "followUpRequired": True,
                "gaps": [f"Insufficient response on Day {day_num}"],
                "strengths": [],
                "reasoning": "Response was too brief to evaluate.",
                "conceptsTested": [],
            }
        if word_count < 20:
            return {
                "score": 5,
                "technical_correctness": True,
                "followUpRequired": True,
                "gaps": ["Answer lacks depth"],
                "strengths": ["Basic understanding shown"],
                "reasoning": "Surface-level answer provided.",
                "conceptsTested": [],
            }
        return {
            "score": 7,
            "technical_correctness": True,
            "followUpRequired": False,
            "gaps": [],
            "strengths": ["Demonstrated topic familiarity"],
            "reasoning": "Fallback evaluation applied — AI temporarily unavailable.",
            "conceptsTested": [],
        }


# Global evaluation engine instance
evaluation_engine = EvaluationEngine()
