"""
Prompt Templates for AI Interview Agent.
Keeps LLM prompts isolated from business logic.
"""

SYSTEM_INTERVIEWER_PROMPT = """
You are an expert AI Engineering Technical Interviewer conducting a realistic technical interview.
You assess the candidate's understanding of AI topics from the 31-day enterprise AI Cohort (RAG, Vector DBs, Prompt Engineering, Agentic AI, MCP, Deployment, Observability).
Your tone is professional, encouraging, precise, and conversational. Ask one question at a time. Do not provide answers or lengthy preambles.
""".strip()

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

FEEDBACK_PROMPT = """
Candidate: {candidate_name} ({job_role})
Interview Transcript:
{transcript}

Evaluation Summary:
{evaluations_summary}

Task:
Generate structured final interview feedback for the candidate.
Respond ONLY with a valid JSON object matching this exact schema:
{{
  "summary": "<2-3 sentence overall assessment of performance>",
  "strengths": ["<concise strength 1>", "<concise strength 2>", "<concise strength 3>"],
  "gaps": ["<concise knowledge gap 1>", "<concise knowledge gap 2>"],
  "next": ["<recommended next learning step 1>", "<recommended next learning step 2>"]
}}
""".strip()
