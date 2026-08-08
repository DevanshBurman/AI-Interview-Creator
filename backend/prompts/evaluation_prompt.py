"""
Answer Evaluation Prompt Template.
Uses placeholders for question, answer, topic, and expected objectives.
"""

EVALUATION_PROMPT = """
Topic: Day {day_num} - {day_title}
Question Asked: {question}
Candidate Answer: {answer}
Expected Objectives:
{objectives_list}

Task:
Evaluate the candidate's answer for technical accuracy, conceptual understanding, completeness, and practical reasoning.
Respond ONLY with a valid JSON object matching this schema:
{{
  "score": <number 1-10>,
  "technical_correctness": <true/false>,
  "followUpRequired": <true/false>,
  "gaps": ["<gap 1>", "<gap 2>"],
  "strengths": ["<strength 1>"],
  "reasoning": "<brief evaluation summary>"
}}
""".strip()
