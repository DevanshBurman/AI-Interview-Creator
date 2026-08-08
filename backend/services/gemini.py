import json
import logging
import os
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

from backend.prompts.templates import (
    SYSTEM_INTERVIEWER_PROMPT,
    QUESTION_GENERATION_PROMPT,
    FOLLOWUP_QUESTION_PROMPT,
    EVALUATION_PROMPT,
    FEEDBACK_PROMPT,
)

load_dotenv()
logger = logging.getLogger(__name__)

class GeminiService:
    """
    Gemini Service Layer.
    
    Responsibilities:
    - Encapsulates all interactions with the Google Gemini API.
    - Reads GEMINI_API_KEY from environment variables.
    - Formats templates from the prompts directory.
    - Implements reusable AI reasoning methods:
        1. generate_question(...)
        2. generate_followup(...)
        3. evaluate_response(...)
        4. generate_final_feedback(...)
    - Handles errors gracefully with fallback responses.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = model_name
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"GeminiService client initialized with model '{self.model_name}'.")
            except Exception as e:
                logger.warning(f"Failed to initialize GenAI Client: {e}. Will fallback gracefully.")

    def is_configured(self) -> bool:
        """Check if Gemini client is active."""
        return self._client is not None and bool(self.api_key.strip())

    def _call_gemini_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Execute text generation call via Gemini API."""
        if not self._client:
            raise RuntimeError("Gemini API client is not configured or missing API key.")

        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        response = self._client.models.generate_content(
            model=self.model_name,
            contents=full_prompt
        )
        return response.text.strip() if response and response.text else ""

    def generate_question(
        self,
        candidate_name: str,
        job_role: str,
        day_num: int,
        day_title: str,
        module_title: str,
        topic_type: str,
        objectives: List[str],
        conversation_context: str = "None yet."
    ) -> str:
        """Generate next curriculum question."""
        objectives_str = "\n".join(f"- {obj}" for obj in objectives) if objectives else "- General understanding"
        prompt = QUESTION_GENERATION_PROMPT.format(
            candidate_name=candidate_name,
            job_role=job_role or "AI Candidate",
            day_num=day_num,
            day_title=day_title,
            module_title=module_title,
            topic_type=topic_type,
            objectives_list=objectives_str,
            conversation_context=conversation_context or "Interview just started."
        )

        try:
            if self.is_configured():
                res = self._call_gemini_text(prompt, system_prompt=SYSTEM_INTERVIEWER_PROMPT)
                if res:
                    return res
        except Exception as e:
            logger.error(f"Gemini generate_question API call failed: {e}")

        # Fallback question if API call fails or key is missing
        return f"Can you explain the core engineering concepts behind Day {day_num}: {day_title} and how you applied them?"

    def generate_followup_question(
        self,
        candidate_name: str,
        day_num: int,
        day_title: str,
        previous_question: str,
        candidate_answer: str,
        objectives: List[str]
    ) -> str:
        """Generate follow-up probing question."""
        objectives_str = "\n".join(f"- {obj}" for obj in objectives) if objectives else "- Depth of reasoning"
        prompt = FOLLOWUP_QUESTION_PROMPT.format(
            candidate_name=candidate_name,
            day_num=day_num,
            day_title=day_title,
            previous_question=previous_question,
            candidate_answer=candidate_answer,
            objectives_list=objectives_str
        )

        try:
            if self.is_configured():
                res = self._call_gemini_text(prompt, system_prompt=SYSTEM_INTERVIEWER_PROMPT)
                if res:
                    return res
        except Exception as e:
            logger.error(f"Gemini generate_followup_question failed: {e}")

        # Fallback follow-up question
        return f"Could you elaborate further on your technical implementation choices regarding {day_title}?"

    def evaluate_response(
        self,
        day_num: int,
        day_title: str,
        question: str,
        candidate_answer: str,
        objectives: List[str]
    ) -> Dict[str, Any]:
        """Evaluate candidate response for technical correctness and depth."""
        objectives_str = "\n".join(f"- {obj}" for obj in objectives) if objectives else "- Core technical principles"
        prompt = EVALUATION_PROMPT.format(
            day_num=day_num,
            day_title=day_title,
            question=question,
            answer=candidate_answer,
            objectives_list=objectives_str
        )

        try:
            if self.is_configured():
                res_text = self._call_gemini_text(prompt)
                # Sanitize markdown codeblocks if present
                clean_json = res_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                parsed = json.loads(clean_json)
                return {
                    "score": parsed.get("score", 7),
                    "technical_correctness": parsed.get("technical_correctness", True),
                    "followUpRequired": parsed.get("followUpRequired", False),
                    "gaps": parsed.get("gaps", []),
                    "strengths": parsed.get("strengths", []),
                    "reasoning": parsed.get("reasoning", "Evaluated via Gemini.")
                }
        except Exception as e:
            logger.error(f"Gemini evaluate_response failed: {e}")

        # Fallback evaluation structure
        words = candidate_answer.strip().split()
        if len(words) < 4:
            return {
                "score": 2,
                "technical_correctness": False,
                "followUpRequired": True,
                "gaps": [f"Insufficient or gibberish response '{candidate_answer}' provided."],
                "strengths": [],
                "reasoning": "Candidate response lacks technical substance."
            }

        return {
            "score": 7,
            "technical_correctness": True,
            "followUpRequired": len(words) < 15,
            "gaps": [],
            "strengths": ["Demonstrated basic topic familiarity"],
            "reasoning": "Fallback evaluation applied."
        }

    def generate_final_feedback(
        self,
        candidate_name: str,
        job_role: str,
        transcript_str: str,
        evaluations_summary_str: str
    ) -> Dict[str, Any]:
        """Generate structured final report at interview completion."""
        prompt = FEEDBACK_PROMPT.format(
            candidate_name=candidate_name,
            job_role=job_role or "AI Engineer",
            transcript=transcript_str or "Interview completed.",
            evaluations_summary=evaluations_summary_str or "No evaluation logs."
        )

        try:
            if self.is_configured():
                res_text = self._call_gemini_text(prompt)
                clean_json = res_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                parsed = json.loads(clean_json)
                return {
                    "summary": parsed.get("summary", f"{candidate_name} demonstrated good technical understanding."),
                    "strengths": parsed.get("strengths", ["Solid foundational knowledge"]),
                    "gaps": parsed.get("gaps", ["Can expand on edge-case scenarios"]),
                    "next": parsed.get("next", ["Continue practicing system architecture explanations"])
                }
        except Exception as e:
            logger.error(f"Gemini generate_final_feedback failed: {e}")

        # Fallback feedback structure
        return {
            "summary": f"{candidate_name} completed the technical interview covering key AI Cohort topics.",
            "strengths": [
                "Strong conceptual understanding of completed cohort missions",
                "Clear technical communication"
            ],
            "gaps": [
                "Depth in advanced vector similarity trade-offs",
                "Observability and monitoring considerations"
            ],
            "next": [
                "Practice explaining vector database retrieval optimizations",
                "Review production monitoring strategies for LLM systems"
            ]
        }

# Global gemini service instance
gemini_service = GeminiService()
