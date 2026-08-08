"""
Follow-up Generation Prompt Template.
Uses placeholders for dynamic candidate profile, previous Q&A, and objectives.
"""

FOLLOWUP_QUESTION_PROMPT = """
Target Candidate: {candidate_name}
Topic: Day {day_num} - {day_title}
Previous Question Asked: {previous_question}
Candidate's Response: {candidate_answer}
Target Objectives:
{objectives_list}

Task:
The candidate's response requires technical clarification or deeper investigation.
Generate a focused follow-up question (1-2 sentences) probing the specific technical gaps, trade-offs, or implementation details of their response.
Return only the follow-up question text without fluff.
""".strip()
