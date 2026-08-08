# PROJECT.md

# AI Interview Agent

Version: 2.0

---

# Project Overview

AI Interview Agent is an intelligent interview platform developed for the AI Cohort Hackathon.

The application conducts personalized AI engineering interviews using the official curriculum and candidate profile supplied by the organizers.

Rather than functioning as a chatbot, the application simulates the workflow of a real technical interviewer by planning interview topics, maintaining conversational context, evaluating responses, generating intelligent follow-up questions, and producing structured interview feedback.

The project is designed as a lightweight, modular application that separates application logic from AI reasoning while complying with the official hackathon API specification.

---

# Project Goals

The application should:

- Conduct realistic technical interviews.
- Personalize interviews using candidate progress.
- Reference curriculum learning objectives.
- Ask adaptive follow-up questions.
- Maintain conversational context.
- Evaluate technical understanding.
- Produce structured interview feedback.
- Comply with the official API specification.

---

# Official Constraints

The application must satisfy the following hackathon requirements:

- Single REST endpoint
- Session-based interview state
- Minimum eight interview questions
- Coverage of at least four curriculum days
- Context-aware conversation
- Structured feedback
- No authentication
- No persistent user accounts
- No long-term conversation history

---

# Technology Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## Backend

- FastAPI
- Python

---

## AI

- Google Gemini API

---

## Data Source

The application uses only the supplied hackathon resources.

- curriculum.json
- candidates.json

No vector database is required.

No external knowledge base is required.

---

# Architecture

The application follows an orchestration-based architecture.

```text
Frontend

↓

POST /api/interview

↓

FastAPI

↓

Interview Orchestrator

├── Planner
├── Memory
├── Evaluation
└── Feedback

↓

Gemini Service

↓

Response
```

The Interview Orchestrator manages the interview workflow.

Gemini is responsible only for reasoning and natural language generation.

Business logic always remains inside the backend.

---

# Interview Workflow

1. Receive interview request.
2. Create or load interview session.
3. Load candidate profile.
4. Load curriculum.
5. Generate interview roadmap.
6. Ask question.
7. Receive answer.
8. Evaluate response.
9. Update interview memory.
10. Decide whether to ask a follow-up.
11. Continue until interview completion.
12. Generate structured feedback.
13. Return final response.

---

# Core Modules

## Interview Orchestrator

Responsibilities:

- Manage interview lifecycle
- Control interview flow
- Coordinate internal modules
- Maintain session state

---

## Planner Module

Responsibilities:

- Analyze candidate profile
- Analyze curriculum
- Select curriculum days
- Build interview roadmap

---

## Memory Module

Responsibilities:

- Store interview history
- Store covered curriculum days
- Store previous questions
- Store candidate responses
- Store evaluation summaries

Memory exists only for the current interview session.

---

## Evaluation Module

Responsibilities:

- Evaluate technical answers
- Identify weak concepts
- Determine whether follow-up is required

---

## Feedback Module

Responsibilities:

- Generate interview summary
- Generate strengths
- Generate learning gaps
- Recommend next learning objectives

---

## Gemini Service

Responsibilities:

- Generate interview questions
- Generate follow-up questions
- Evaluate candidate answers
- Produce final interview feedback

Gemini should never manage interview state.

---

# Folder Structure

```text
project/

├── frontend/
│
├── backend/
│   ├── app/
│   ├── api/
│   ├── orchestrator/
│   ├── modules/
│   ├── services/
│   ├── prompts/
│   ├── models/
│   ├── schemas/
│   ├── utils/
│   └── main.py
│
├── docs/
│
├── assets/
│
├── README.md
│
└── PROMPTS.md
```

---

# Coding Standards

General Principles

- Keep functions focused.
- Follow Single Responsibility Principle.
- Prefer composition over inheritance.
- Prefer readability over cleverness.
- Avoid premature optimization.
- Keep files modular.

---

# Naming Conventions

Good

```python
InterviewSession

InterviewOrchestrator

Planner

EvaluationResult

generate_question()

generate_feedback()
```

Avoid

```python
helper()

manager()

util2()

data()

temp()
```

---

# API Guidelines

The application exposes exactly one endpoint.

```http
POST /api/interview
```

The endpoint must:

- Start interviews.
- Continue interviews.
- End interviews.

Session management must rely exclusively on the supplied `sessionId`.

---

# AI Integration Rules

The LLM should only perform reasoning tasks.

The backend must perform:

- Session management
- Request validation
- State management
- Workflow decisions
- Business logic

Never place business logic inside prompts.

Prompts should remain reusable and isolated inside the `prompts/` directory.

---

# Session Management

Interview sessions are maintained in memory.

Each session stores:

- sessionId
- interview roadmap
- current question
- previous questions
- candidate responses
- evaluation history
- covered curriculum days
- interview completion status

Sessions are discarded after interview completion.

---

# Error Handling

Gracefully handle:

- Invalid requests
- Missing candidate data
- Missing curriculum
- Invalid session IDs
- Empty responses
- AI service failures

Never expose internal exceptions.

Always return structured JSON responses.

---

# Performance Goals

- Average response time below five seconds.
- Load curriculum only once.
- Load candidate profiles only once.
- Keep interview sessions lightweight.
- Minimize unnecessary Gemini requests.

---

# UI Guidelines

The interface should be:

- Modern
- Minimal
- Professional
- Easy to navigate

Design principles:

- One question at a time
- Clear interview progress
- Large readable typography
- Simple answer input
- Clean feedback report

Avoid excessive animations.

---

# Development Principles

Every implementation should satisfy:

- Simplicity
- Maintainability
- Modularity
- Extensibility
- Deterministic backend logic
- AI-assisted reasoning

If there are multiple valid implementations, prefer the simpler solution.

---

# Development Roadmap

## Phase 1

Project initialization

- Frontend setup
- Backend setup
- Folder structure

---

## Phase 2

Backend foundation

- Models
- Schemas
- Session manager
- API endpoint

---

## Phase 3

Interview engine

- Planner
- Memory
- Evaluation
- Feedback

---

## Phase 4

Gemini integration

- Prompt templates
- AI service
- Question generation
- Evaluation prompts

---

## Phase 5

Frontend

- Landing page
- Interview page
- Results page

---

## Phase 6

Testing

- API testing
- UI testing
- Session testing
- Error handling

---

## Phase 7

Deployment

- Railway
- Vercel

---

## Phase 8

Documentation

- README
- PROMPTS.md
- Final screenshots

---

# Instructions for AI Coding Assistants

Before implementing any feature:

1. Read this document completely.
2. Treat it as the project's single source of truth.
3. Preserve the architecture.
4. Implement only the requested feature.
5. Do not modify unrelated files.
6. Keep business logic outside the LLM.
7. Follow the defined folder structure.
8. Generate production-quality, readable code.
9. Prefer modular implementations over large files.
10. If multiple approaches are possible, choose the simplest one that satisfies the project requirements.

Every generated change should move the project one step closer to a complete, deployable AI Interview Agent while remaining aligned with the official hackathon specification.