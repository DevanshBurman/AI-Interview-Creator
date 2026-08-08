"""
Feedback Generation Prompt Template.
Generates comprehensive structured final interview report with readiness score.
"""

FEEDBACK_PROMPT = """
You are generating the final technical interview report for an AI engineering cohort candidate.

Candidate: {candidate_name} ({job_role})
Interview Transcript:
{transcript}

Evaluation Summary:
{evaluations_summary}

Topics Assessed: N/A


Task:
Generate a comprehensive, data-driven final interview feedback report.
Respond ONLY with a valid JSON object matching EXACTLY this schema:
{{
  "summary": "<2-3 sentence overall performance assessment>",
  "readinessScore": <integer 0-100>,
  "readinessLabel": "<Developing | Interview Ready | Strong>",
  "demonstratedStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "knowledgeGaps": ["<gap 1>", "<gap 2>"],
  "communicationFeedback": "<1-2 sentences on communication quality>",
  "reviseNextPlan": ["<topic with specific action 1>", "<topic with specific action 2>", "<topic with specific action 3>"],
  "immediateNextActions": ["<action 1>", "<action 2>", "<action 3>"],
  "topicBreakdowns": [
    {{
      "day": <day number>,
      "title": "<day title>",
      "score": <integer 0-100>,
      "evidence": "<1 sentence evidence from the interview>",
      "strengths": ["<per-topic strength>"],
      "gaps": ["<per-topic gap>"]
    }}
  ],
  "weakAnswerQuestion": "<the question from the interview the candidate answered most weakly>",
  "weakAnswerCandidate": "<what the candidate said>",
  "weakAnswerStronger": "<example of a stronger, more complete answer showing what they missed>",
  "topicsSelectedExplanation": "<2-3 sentences explaining why these topics were selected based on the candidate's learning journey>"
}}

Readiness Score Guidelines:
- 0-40: Developing (significant gaps, not ready)
- 41-70: Interview Ready (competent but room for growth)  
- 71-100: Strong (demonstrates depth, ready for senior roles)

Do not invent topics not in the transcript. Be specific and actionable.
Do not add any text outside the JSON object.
""".strip()
