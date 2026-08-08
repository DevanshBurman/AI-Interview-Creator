# AI_ARCHITECTURE.md

# AI Interview Agent - AI Architecture

Version: 2.0

---

# 1. Overview

The AI Interview Agent is an LLM-powered interview system that conducts personalized technical interviews using the official AI Cohort curriculum and candidate profile.

The system separates deterministic application logic from AI reasoning.

Business logic such as interview flow, session management, curriculum selection, and interview progression is implemented in Python, while the Large Language Model (Gemini) is responsible only for reasoning-intensive tasks such as question generation, answer evaluation, follow-up generation, and interview summarization.

This architecture keeps the application modular, deterministic, and easy to maintain while leveraging the reasoning capabilities of modern LLMs.

---

# 2. AI Design Principles

The AI layer follows these principles:

- Business logic remains outside the LLM.
- AI performs reasoning, not application control.
- Context is maintained by the backend.
- Prompt templates are reusable.
- Every LLM call has a single responsibility.
- Minimize unnecessary token usage.
- Generate explainable interview feedback.

---

# 3. AI Architecture

```text
               Candidate Profile
                      │
                      │
               Curriculum JSON
                      │
                      ▼
           Interview Orchestrator
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    Planner       Memory       Evaluation
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
               Prompt Builder
                      │
                      ▼
                Gemini Service
                      │
                      ▼
              Generated Response
                      │
                      ▼
           Interview Orchestrator
```

---

# 4. Interview Orchestrator

The Interview Orchestrator is the central decision-making component.

Responsibilities:

- Receive API requests
- Load interview session
- Load curriculum
- Load candidate profile
- Determine interview stage
- Build AI prompts
- Invoke Gemini
- Update session memory
- Decide interview completion
- Generate final feedback

The Orchestrator owns the interview workflow.

---

# 5. Internal AI Modules

The following modules support the Interview Orchestrator.

---

## 5.1 Planner

Purpose

Generate an interview roadmap before the interview begins.

Inputs

- Curriculum JSON
- Candidate Profile

Responsibilities

- Analyze completed missions
- Identify skipped topics
- Select curriculum coverage
- Determine interview order
- Balance interview difficulty

Output Example

```json
{
    "coveredDays": [3, 7, 14, 22],
    "questionCount": 8
}
```

The planner executes only once per interview.

---

## 5.2 Memory

Purpose

Maintain interview context.

Stores

- Current question
- Previous questions
- Candidate responses
- Evaluation history
- Covered curriculum days
- Interview progress
- Interview roadmap

Memory exists only for the duration of a session.

---

## 5.3 Evaluation

Purpose

Evaluate candidate responses.

Evaluation Criteria

- Technical correctness
- Conceptual understanding
- Practical reasoning
- Completeness
- Communication quality

Output Example

```json
{
    "score": 8,
    "followUpRequired": true,
    "confidence": "Medium",
    "missingConcepts": [
        "Vector Similarity Search"
    ]
}
```

The evaluation influences the next interview step.

---

## 5.4 Feedback

Purpose

Generate the final interview report.

Produces

- Interview summary
- Strengths
- Knowledge gaps
- Recommended next learning topics

The output format matches the official technical specification.

---

# 6. Gemini Service

Gemini is responsible only for reasoning tasks.

Responsibilities

- Generate interview questions
- Generate follow-up questions
- Evaluate technical answers
- Generate interview summary
- Generate structured feedback

Gemini never manages:

- Session state
- API requests
- Interview workflow
- Business rules
- Application logic

---

# 7. Prompt Strategy

Rather than using one large prompt, the application uses multiple specialized prompt templates.

Prompt Types

- Interview Planning Prompt
- Question Generation Prompt
- Follow-up Prompt
- Evaluation Prompt
- Feedback Prompt

Each prompt receives only the context required for its task.

This reduces token usage and improves response consistency.

---

# 8. Context Management

Every Gemini request receives contextual information assembled by the backend.

Possible context includes:

- Candidate profile
- Current curriculum day
- Learning objectives
- Previous questions
- Previous answers
- Interview roadmap
- Evaluation history

Only the relevant context is included in each request.

---

# 9. Adaptive Interview Strategy

The interview adapts based on candidate performance.

Strong Response

- Increase technical depth.
- Introduce implementation scenarios.
- Ask edge-case questions.

Average Response

- Continue with the interview roadmap.
- Maintain current difficulty.

Weak Response

- Generate clarification questions.
- Reduce complexity where appropriate.
- Reinforce weak concepts before progressing.

---

# 10. Curriculum Coverage

The Planner ensures:

- At least eight interview questions.
- Coverage of four or more curriculum days.
- Questions are primarily based on completed learning missions.
- Optional probing of skipped topics.
- Balanced topic distribution.

The interview should avoid unnecessary repetition.

---

# 11. AI Workflow

```text
Receive Candidate

↓

Load Curriculum

↓

Planner builds roadmap

↓

Generate Question

↓

Candidate Response

↓

Evaluation

↓

Update Memory

↓

Need Follow-up?

├── Yes
│
│   Generate Follow-up
│
└── No
│
Next Topic

↓

Interview Complete?

├── No
│
Continue Interview
│
└── Yes

Generate Feedback

↓

Return Final Response
```

---

# 12. Failure Handling

If Gemini fails:

- Retry the request.
- Preserve interview session state.
- Return structured API errors.
- Allow interview continuation when possible.

Unexpected AI outputs should be validated before being returned to the client.

---

# 13. Performance Strategy

To minimize latency:

- Load curriculum once during application startup.
- Load candidate profiles once during startup.
- Maintain lightweight in-memory interview sessions.
- Build prompts dynamically.
- Call Gemini only when reasoning is required.

---

# 14. Future Enhancements

The architecture supports future additions including:

- Multiple LLM providers
- Voice interviews
- Resume-aware interviews
- Coding assessments
- Recruiter review mode
- Personalized learning recommendations
- Multi-language interviews
- Persistent interview history

---

# 15. AI Architecture Summary

The AI Interview Agent combines deterministic backend orchestration with LLM-powered reasoning.

The backend is responsible for:

- Interview flow
- Session management
- Context management
- Curriculum handling
- API processing

The LLM is responsible for:

- Technical reasoning
- Natural language generation
- Candidate evaluation
- Adaptive questioning
- Interview summarization

This separation provides a maintainable, extensible, and production-inspired architecture while satisfying all functional requirements of the AI Cohort Hackathon.