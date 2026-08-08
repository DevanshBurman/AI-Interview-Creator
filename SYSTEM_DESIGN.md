# SYSTEM_DESIGN.md

# AI Interview Agent - System Design

Version: 2.0

---

# 1. Overview

The AI Interview Agent is designed as a modular AI-powered interview system that conducts personalized technical interviews based on a candidate's learning journey through the AI Cohort curriculum.

The application follows a lightweight orchestration architecture where a central Interview Orchestrator coordinates interview planning, context management, evaluation, and feedback generation.

Rather than relying on a single monolithic prompt or a complex multi-agent framework, the system separates deterministic application logic from AI reasoning. Business logic is implemented in Python, while the Large Language Model (LLM) is responsible only for generating natural language questions, evaluating responses, and producing interview feedback.

The system complies with the official hackathon API specification by exposing a single REST endpoint that maintains interview state using the supplied `sessionId`.

---

# 2. Design Goals

The architecture is designed to:

- Conduct realistic multi-turn interviews.
- Personalize questions using candidate progress.
- Reference curriculum learning objectives.
- Maintain conversational context.
- Generate intelligent follow-up questions.
- Minimize unnecessary LLM calls.
- Keep business logic independent from AI providers.
- Remain simple, modular, and extensible.

---

# 3. High-Level Architecture

```text
                    Candidate
                        │
                        ▼
              Frontend (Next.js)
                        │
                        ▼
              POST /api/interview
                        │
                        ▼
              Backend (FastAPI)
                        │
                        ▼
           Interview Orchestrator
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   Planner     Memory    Evaluation
        │          │          │
        └──────────┼──────────┘
                   │
                   ▼
              Gemini Service
                   │
                   ▼
           Interview Response
                   │
                   ▼
          Feedback Generator
```

---

# 4. Core Components

## 4.1 Frontend

Responsibilities:

- Start interview
- Display questions
- Accept responses
- Show interview progress
- Display final feedback

Technology:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## 4.2 Backend

Responsibilities:

- Expose REST API
- Maintain interview sessions
- Coordinate interview workflow
- Validate requests
- Invoke AI services

Technology:

- FastAPI
- Python

---

## 4.3 Interview Orchestrator

The Interview Orchestrator is the central controller of the application.

Responsibilities:

- Create interview sessions
- Load curriculum
- Load candidate profile
- Call Planner
- Update Memory
- Evaluate answers
- Decide whether to ask a follow-up
- Determine interview completion
- Generate final feedback

The Orchestrator contains all interview workflow logic.

---

# 5. Internal Modules

## 5.1 Planner

Purpose

Create an interview roadmap before the interview begins.

Input

- Curriculum JSON
- Candidate Profile

Responsibilities

- Analyze completed missions
- Identify skipped topics
- Select curriculum days
- Balance interview coverage
- Determine question order

Output

```json
{
  "coveredDays": [3, 8, 14, 22],
  "plannedQuestions": 8
}
```

---

## 5.2 Memory

Purpose

Maintain interview state throughout the session.

Stores:

- Session ID
- Questions asked
- Candidate responses
- Covered curriculum days
- Evaluation history
- Current question index

Memory exists only for the current interview session.

---

## 5.3 Evaluation

Purpose

Evaluate candidate responses.

Evaluation Criteria

- Technical correctness
- Conceptual understanding
- Completeness
- Communication clarity
- Practical reasoning

Output

```json
{
  "score": 8,
  "followUpRequired": true,
  "weakAreas": [
    "Vector Similarity"
  ]
}
```

---

## 5.4 Feedback

Purpose

Generate the final interview report.

Output

- Interview summary
- Strengths
- Knowledge gaps
- Recommended next learning topics

The feedback format follows the official technical specification.

---

# 6. AI Service

Gemini is responsible for:

- Generating interview questions
- Generating follow-up questions
- Evaluating answers
- Producing final feedback

Gemini is **not** responsible for:

- Session management
- Interview flow
- State tracking
- API handling
- Business logic

This separation makes the system deterministic and easier to maintain.

---

# 7. Interview Workflow

```text
Start Interview

↓

Load Candidate

↓

Load Curriculum

↓

Planner creates roadmap

↓

Generate Question

↓

Candidate Response

↓

Evaluate Response

↓

Update Memory

↓

Need Follow-up?

├── Yes
│      ↓
│  Generate Follow-up
│
└── No
       ↓
  Next Curriculum Topic

↓

Interview Complete?

├── No → Continue
│
└── Yes
       ↓
Generate Final Feedback

↓

Return Final Response
```

---

# 8. Session Lifecycle

Each interview session progresses through the following states:

```text
Created

↓

Initialized

↓

Interview In Progress

↓

Generating Feedback

↓

Completed
```

Interview state is maintained using the supplied `sessionId`.

No persistent storage is required.

---

# 9. Data Flow

```text
Candidate Profile
        │
        ▼
 Interview Orchestrator
        │
Curriculum JSON
        │
        ▼
      Planner
        │
        ▼
 Gemini Question Generation
        │
        ▼
 Candidate Response
        │
        ▼
     Evaluation
        │
        ▼
      Memory
        │
        ▼
 Next Question Decision
        │
        ▼
 Gemini
```

---

# 10. REST API

The application exposes a single endpoint:

```http
POST /api/interview
```

Request Types

### Interview Initialization

```json
{
    "sessionId": "abc-123",
    "candidate": {}
}
```

### Conversation Turn

```json
{
    "sessionId": "abc-123",
    "message": "..."
}
```

### Final Response

```json
{
    "reply": "...",
    "done": true,
    "feedback": {
        "summary": "...",
        "strengths": [],
        "gaps": [],
        "next": []
    }
}
```

---

# 11. Folder Structure

```text
backend/

├── app/
│
├── api/
│
├── orchestrator/
│      interview.py
│
├── services/
│      gemini.py
│
├── modules/
│      planner.py
│      memory.py
│      evaluation.py
│      feedback.py
│
├── prompts/
│
├── models/
│
├── schemas/
│
├── utils/
│
└── main.py
```

Frontend

```text
frontend/

├── app/
├── components/
├── hooks/
├── services/
├── types/
└── utils/
```

---

# 12. Error Handling

The system should gracefully handle:

- Invalid session IDs
- Missing candidate profiles
- Invalid curriculum data
- Empty candidate responses
- AI service failures
- Invalid request payloads

All errors should return structured JSON responses.

---

# 13. Performance Considerations

The system is optimized by:

- Loading curriculum once during startup.
- Loading candidate data once during startup.
- Maintaining lightweight in-memory sessions.
- Calling Gemini only when natural language generation or evaluation is required.
- Avoiding unnecessary repeated prompt construction.

---

# 14. Deployment

Frontend

- Vercel

Backend

- Railway

Environment Variables

- GEMINI_API_KEY

---

# 15. Design Principles

The architecture follows these principles:

- Single Responsibility Principle
- Separation of Concerns
- Stateless REST API
- Session-based interview state
- Modular implementation
- AI-assisted reasoning
- Provider-independent AI integration
- Readable and maintainable code

The resulting architecture balances simplicity, modularity, and extensibility while satisfying all functional requirements of the AI Cohort Hackathon.