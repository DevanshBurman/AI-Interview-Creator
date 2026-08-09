# PROMPTS.md — AI Interview Creator

> This document logs every prompt and instruction used to build the **AI Interview Creator** system from scratch. These are the developer prompts given to the AI coding agent across all phases of the project. They serve as a complete build history and prompt engineering reference.

---

## Table of Contents

1. [Master Prompt](#master-prompt)
2. [Phase 1 — Project Initialization](#phase-1--project-initialization)
3. [Phase 2 — Schema & API Skeleton](#phase-2--schema--api-skeleton)
4. [Phase 3 — Data Loading (Curriculum & Candidates)](#phase-3--data-loading-curriculum--candidates)
5. [Phase 4 — Planner Module](#phase-4--planner-module)
6. [Phase 5 — Memory Module](#phase-5--memory-module)
7. [Phase 6 — Gemini Service](#phase-6--gemini-service)
8. [Phase 7 — Prompt Templates](#phase-7--prompt-templates)
9. [Phase 8 — Evaluation Module](#phase-8--evaluation-module)
10. [Phase 9 — Interview Orchestrator](#phase-9--interview-orchestrator)

---

## Master Prompt

> Applied at the start of every phase. Sets global rules and the source-of-truth for the entire build.

```
Master Prompt

Read every document inside the docs/ directory before making any changes.

The following documents define the entire project:

- PROJECT.md
- REQUIREMENTS.md
- SYSTEM_DESIGN.md
- API_SPEC.md
- AI_ARCHITECTURE.md

Treat these documents as the single source of truth.

Rules:

1. Never change the architecture unless instructed.
2. Follow the folder structure exactly.
3. Keep business logic outside Gemini.
4. Only implement the requested phase.
5. Never implement future phases.
6. Keep the code modular and production-quality.
7. Explain what files you will modify before writing code.
8. Stop after completing the requested phase.
```

**What this enforces:**
- Architecture is locked to the design docs — no agent improvisation
- Phased delivery — one concern at a time, no scope creep
- Business logic lives in Python modules, not inside Gemini prompts
- The agent must declare intent before writing any code
- Hard stop after each phase

---

## Phase 1 — Project Initialization

```
Read PROJECT.md.

Implement only Phase 1.

Tasks:

* Initialize the frontend using Next.js (App Router) with TypeScript.
* Initialize the backend using FastAPI.
* Configure Tailwind CSS.
* Configure shadcn/ui.
* Create the folder structure defined in PROJECT.md.
* Create requirements.txt and package.json.
* Configure environment variable loading.
* Ensure frontend and backend start successfully.

Do not implement any application logic.

Stop after Phase 1.
```

**Deliverables:**
- `frontend/` — Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
- `backend/` — FastAPI project scaffold with virtual environment
- `requirements.txt` and `package.json`
- `.env` / `.env.example` with environment variable loading
- All folder structure from `PROJECT.md` created (empty but present)
- Both servers start cleanly with no errors

**What was explicitly excluded:**
- No application routes or business logic
- No Gemini integration
- No UI components beyond base config

---

## Phase 2 — Schema & API Skeleton

```
Read PROJECT.md.

Implement only Phase 2.

Tasks:

Create:

* Pydantic request schemas
* Response schemas
* Session model
* Session Manager
* Folder structure for modules
* FastAPI router

Implement the POST /api/interview endpoint with mock responses only.

Do not implement Gemini.

Do not implement interview logic.

Stop after completion.
```

**Deliverables:**
- `backend/schemas/` — Pydantic models for request and response bodies
- `backend/models/session.py` — `InterviewSession` data model
- `backend/modules/session_manager.py` — In-memory session store (create/get/delete)
- `backend/api/` — FastAPI router with `POST /api/interview` returning mock JSON
- No real logic — endpoint returns hardcoded placeholder response

**What was explicitly excluded:**
- No Gemini calls
- No planner, evaluation, or feedback logic
- No data loading

---

## Phase 3 — Data Loading (Curriculum & Candidates)

```
Read PROJECT.md.

Implement only Phase 3.

Tasks:

Load:

* curriculum.json
* candidates.json

Requirements:

* Load once at application startup.
* Keep both datasets in memory.
* Create helper services to retrieve:
    - Candidate by ID
    - Curriculum Day
    - Learning Objectives

Do not implement interview logic.

Stop after completion.
```

**Deliverables:**
- `backend/data/curriculum.json` — 31-day AI cohort curriculum with objectives per day
- `backend/data/candidates.json` — Cohort candidate profiles with mission history
- `backend/services/data_loader.py` — Loads both files once at startup, caches in memory
- Helper functions:
  - `get_candidate_by_id(id)` → returns full candidate profile
  - `get_curriculum_day(day_num)` → returns day metadata + objectives
  - `get_objectives(day_num)` → returns list of learning objective strings

**What was explicitly excluded:**
- No interview logic
- No planner or evaluation
- No Gemini

---

## Phase 4 — Planner Module

```
Read PROJECT.md.

Implement only the Planner module.

Responsibilities:

* Analyze candidate profile.
* Prioritize completed missions.
* Include skipped topics only as optional probing.
* Select at least four curriculum days.
* Generate an interview roadmap.
* Plan eight interview questions.

Return structured roadmap data.

Do not generate interview questions yet.

Stop after completion.
```

**Deliverables:**
- `backend/modules/planner.py` — `InterviewPlanner` class
- Reads candidate missions from profile (passed vs. skipped)
- Selects ≥4 curriculum days from passed missions
- Skipped topics included as optional low-weight probing slots
- Generates a structured `InterviewRoadmap` with 8 planned question slots
- Each slot contains: `day`, `day_title`, `module_title`, `topic_type`, `objectives`
- Returns roadmap object (no questions text yet)

**What was explicitly excluded:**
- No Gemini calls
- No actual question text generation
- No evaluation logic

---

## Phase 5 — Memory Module

```
Read PROJECT.md.

Implement only the Memory module.

Store:

* Current question
* Previous questions
* Candidate answers
* Covered curriculum days
* Interview roadmap
* Evaluation history
* Interview progress

Memory should exist only during the interview session.

Stop after completion.
```

**Deliverables:**
- `backend/modules/memory.py` — `InterviewMemory` class (or functions on `InterviewSession`)
- Methods:
  - `record_question(session, question_text, slot_index, day)`
  - `record_answer(session, answer_text)`
  - `record_evaluation(session, eval_result)`
  - `mark_completed(session)`
- All state is session-scoped — no persistence to disk or database
- Session object holds: `turn_history`, `candidate_responses`, `covered_days`, `current_question`, `current_question_index`, `evaluations`, `is_completed`

**What was explicitly excluded:**
- No database persistence
- No Gemini
- No evaluation logic

---

## Phase 6 — Gemini Service

```
Read PROJECT.md.

Implement only the Gemini service.

Requirements:

* Read API key from .env.
* Isolate all Gemini communication.
* Create reusable helper methods.

Do not place prompts inside business logic.

Do not implement interview flow.

Stop after completion.
```

**Deliverables:**
- `backend/services/gemini.py` — `GeminiService` class
- Reads `GEMINI_API_KEY` from environment at startup
- Wraps Google Generative AI SDK (`google-generativeai`)
- Helper methods:
  - `generate_question(...)` → calls Gemini, returns question string
  - `generate_followup_question(...)` → calls Gemini, returns follow-up string
  - `evaluate_answer(...)` → calls Gemini, returns parsed JSON evaluation
  - `generate_feedback(...)` → calls Gemini, returns parsed JSON report
- All prompt construction done via imported prompt templates (not hardcoded strings here)
- Error handling for API failures

**What was explicitly excluded:**
- No prompts defined inside this file
- No interview orchestration logic
- No evaluation business rules

---

## Phase 7 — Prompt Templates

```
Read PROJECT.md.

Create reusable prompt templates.

Create separate prompts for:

* Question Generation
* Follow-up Generation
* Answer Evaluation
* Feedback Generation

Store them in the prompts directory.

Use placeholders instead of hardcoded values.

Stop after completion.
```

**Deliverables:**
- `backend/prompts/system_prompt.py` — Interviewer persona, tone, constraints
- `backend/prompts/question_prompt.py` — Question generation template with `{candidate_name}`, `{day_num}`, `{objectives_list}`, etc.
- `backend/prompts/followup_prompt.py` — Follow-up probe template with `{previous_question}`, `{candidate_answer}`
- `backend/prompts/evaluation_prompt.py` — Evaluation template returning strict JSON schema
- `backend/prompts/feedback_prompt.py` — Final report template returning strict JSON schema
- `backend/prompts/templates.py` — Central import aggregator (`__all__` exports)

**Prompt design rules applied:**
- All dynamic values are `{placeholder}` format — no hardcoded names or days
- Evaluation and Feedback prompts end with: `"Do not add any text outside the JSON object"`
- Question/Follow-up prompts end with: `"Return only the question text"`

---

## Phase 8 — Evaluation Module

```
Read PROJECT.md.

Implement only the Evaluation module.

Evaluate:

* Technical correctness
* Conceptual understanding
* Practical reasoning
* Communication clarity

Return structured evaluation results.

Determine whether a follow-up question is required.

Stop after completion.
```

**Deliverables:**
- `backend/modules/evaluation.py` — `EvaluationEngine` class
- `evaluate_response(question, answer, day_num, day_title, objectives)` method
- Builds evaluation prompt → calls `gemini_service.evaluate_answer()` → parses JSON response
- Returns `EvaluationResult` Pydantic model with:
  - `score` (1–10)
  - `assessment` (`strong` / `partial` / `weak`)
  - `technical_correctness` (bool)
  - `followUpRequired` (bool)
  - `gaps` (list of strings)
  - `strengths` (list of strings)
  - `conceptsTested` (list of strings)
  - `reasoning` (string)
- `followUpRequired` drives the orchestrator's branching decision

**What was explicitly excluded:**
- No orchestration logic
- No question generation
- No session management

---

## Phase 9 — Interview Orchestrator

```
Read PROJECT.md.

Implement only the Interview Orchestrator.

Responsibilities:

* Initialize interview.
* Load candidate.
* Build interview roadmap.
* Manage interview state.
* Coordinate Planner.
* Coordinate Memory.
* Coordinate Evaluation.
* Coordinate Gemini.
* Decide when to ask follow-up questions.
* Decide when to move to the next curriculum topic.
* Decide interview completion.
* Generate final feedback.

The Orchestrator owns the entire interview lifecycle.

Stop after completion.
```

**Deliverables:**
- `backend/orchestrator/interview.py` — `InterviewOrchestrator` class
- `start_interview(session_id, candidate)` method:
  1. Creates session via `SessionManager`
  2. Builds roadmap via `Planner`
  3. Generates first question via `GeminiService`
  4. Records in `Memory`
  5. Returns `InterviewResponse`
- `process_turn(session_id, message)` method:
  1. Loads session from `SessionManager`
  2. Records answer in `Memory`
  3. Evaluates response via `EvaluationEngine`
  4. Records evaluation in `Memory`
  5. **Decision branch:**
     - `followUpRequired == True` and no prior follow-up on this slot → generate follow-up via Gemini
     - Otherwise → advance to next curriculum slot
  6. If last slot reached → `FeedbackGenerator.generate(session)` → return final report
- `interview_orchestrator` — singleton instance exported at module bottom

**Branching logic:**
```
evaluate_response()
       │
       ├── followUpRequired == True AND not already_asked_followup?
       │         └── generate_followup_question() → return follow-up
       │
       └── followUpRequired == False OR already_asked_followup?
                 ├── next_slot_idx > total_planned?
                 │         └── generate_feedback() → return done=True
                 └── else
                           └── generate_question(next_slot) → return next question
```

**What was explicitly excluded:**
- No direct Gemini calls in orchestrator (delegated to GeminiService)
- No prompt construction in orchestrator (delegated to prompt templates)
- No persistence logic

---

## Build Summary

| Phase | Module | Key Output |
|---|---|---|
| 1 | Project Init | Next.js + FastAPI scaffold, folder structure |
| 2 | API Skeleton | Pydantic schemas, session model, mock endpoint |
| 3 | Data Loading | `curriculum.json`, `candidates.json`, helper services |
| 4 | Planner | 8-question roadmap from candidate's mission history |
| 5 | Memory | Session-scoped state store for full interview context |
| 6 | Gemini Service | Isolated LLM communication layer |
| 7 | Prompt Templates | 5 modular prompt files with dynamic placeholders |
| 8 | Evaluation | Per-answer scoring + follow-up decision flag |
| 9 | Orchestrator | Full interview lifecycle coordinator |

---

*AI Interview Creator — ABTalks Cohort Assessment Platform.*
