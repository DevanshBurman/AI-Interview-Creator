"""
Feedback Generation Prompt Template.
Uses placeholders for candidate info, transcript, and evaluation summaries.
"""

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
