from typing import List, Dict, Any, Optional
from backend.schemas.evaluation import EvaluationResult
from backend.services.gemini import gemini_service

class EvaluationEngine:
    """
    Evaluation Module for AI Interview Agent.
    
    Responsibilities:
    - Evaluates candidate responses across four key criteria:
        1. Technical Correctness
        2. Conceptual Understanding
        3. Practical Reasoning
        4. Communication Clarity
    - Returns structured EvaluationResult schema.
    - Deterministically calculates whether a follow-up question is required.
    """

    def evaluate_response(
        self,
        question: str,
        answer: str,
        day_num: int,
        day_title: str,
        objectives: List[str]
    ) -> EvaluationResult:
        """
        Evaluate candidate response and determine follow-up necessity.
        """
        clean_ans = answer.strip() if answer else ""
        words = clean_ans.split()
        word_count = len(words)

        if not clean_ans:
            return EvaluationResult(
                score=1,
                technical_correctness=False,
                conceptual_understanding=False,
                practical_reasoning=False,
                communication_clarity=False,
                followUpRequired=True,
                gaps=["No response provided"],
                strengths=[],
                reasoning="Candidate provided an empty answer."
            )

        # 1. Detect single-character or trivial gibberish (e.g., 'h', 'f', 'g', 'asdf')
        is_gibberish = word_count < 4 or (word_count == 1 and len(clean_ans) < 6)

        # 2. Obtain AI reasoning evaluation from Gemini service
        raw_eval = gemini_service.evaluate_response(
            day_num=day_num,
            day_title=day_title,
            question=question,
            candidate_answer=clean_ans,
            objectives=objectives
        )

        if is_gibberish:
            score = 2
            technical_correctness = False
            conceptual_understanding = False
            practical_reasoning = False
            communication_clarity = False
            gaps = [f"Trivial or gibberish response '{clean_ans}' provided on Day {day_num}"]
            strengths = []
            reasoning = f"Answer '{clean_ans}' lacks technical substance."
        else:
            score = max(1, min(10, int(raw_eval.get("score", 7))))
            gaps = raw_eval.get("gaps", [])
            strengths = raw_eval.get("strengths", [])
            reasoning = raw_eval.get("reasoning", "Evaluated technical answer.")

            technical_correctness = bool(raw_eval.get("technical_correctness", True) and score >= 6)
            conceptual_understanding = bool(score >= 5 and len(gaps) <= 2)
            practical_reasoning = bool(score >= 6 and word_count >= 15)
            communication_clarity = bool(word_count >= 8)

        # 3. Determine if follow-up question is required
        ai_flag = bool(raw_eval.get("followUpRequired", False))
        follow_up_required = bool(ai_flag or score < 7 or word_count < 15 or not technical_correctness or is_gibberish)

        return EvaluationResult(
            score=score,
            technical_correctness=technical_correctness,
            conceptual_understanding=conceptual_understanding,
            practical_reasoning=practical_reasoning,
            communication_clarity=communication_clarity,
            followUpRequired=follow_up_required,
            gaps=gaps,
            strengths=strengths,
            reasoning=reasoning
        )

# Global evaluation engine instance
evaluation_engine = EvaluationEngine()
