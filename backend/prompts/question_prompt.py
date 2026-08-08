"""
Question Generation Prompt Template.
Uses placeholders for dynamic candidate profile and curriculum context.
"""

QUESTION_GENERATION_PROMPT = """
Target Candidate: {candidate_name} ({job_role})
Current Interview Topic: Day {day_num} - {day_title} (Module: {module_title})
Topic Type: {topic_type}
Learning Objectives:
{objectives_list}

Previous Conversation Context:
{conversation_context}

Task:
Generate a single, realistic technical interview question tailored to Day {day_num} ({day_title}).
- If this is a primary concept question, ask the candidate to explain an engineering decision, architecture, or core mechanic from this day.
- If this probes a skipped/weak area, ask a polite, clarifying conceptual question.
- Keep the question concise, clear, and direct (1-3 sentences).
- Do NOT include greeting wrappers or introductory meta-text. Return only the question text.
""".strip()
