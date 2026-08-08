# REQUIREMENTS.md

# AI Interview Agent

Version: 2.0

---

# 1. Project Overview

The AI Interview Agent is an intelligent interview system developed for the AI Cohort Hackathon. Its primary purpose is to simulate a realistic AI engineering interview by adapting questions to a candidate's learning journey throughout the AI Cohort curriculum.

The system analyzes the candidate's completed learning missions, references the official curriculum, conducts a multi-turn technical interview, asks intelligent follow-up questions, maintains conversational context, and generates structured feedback at the end of the interview.

The application is designed as a stateless REST service with session-based interview state management and complies with the official hackathon technical specification.

---

# 2. Problem Statement

The AI Cohort teaches modern enterprise AI engineering topics across a structured 31-day curriculum. While learners complete practical missions during the cohort, many struggle to effectively explain concepts and engineering decisions during technical interviews.

This project aims to bridge that gap by creating an AI-powered interviewer capable of conducting personalized, context-aware technical interviews based on each learner's progress.

Rather than acting as a chatbot, the system should simulate the behavior of an experienced technical interviewer.

---

# 3. Objectives

The system should:

- Conduct realistic technical interviews.
- Personalize questions using the supplied candidate profile.
- Reference the supplied curriculum when generating questions.
- Maintain conversational context throughout the interview.
- Generate intelligent follow-up questions.
- Evaluate technical understanding rather than memorization.
- Produce structured, actionable feedback.
- Fully comply with the official API specification.

---

# 4. Scope

## Included

The system includes:

- Curriculum-aware interview planning
- Candidate profile analysis
- Adaptive question generation
- Multi-turn interview conversations
- Context-aware follow-up questions
- Technical evaluation
- Final interview feedback
- Session management
- REST API

## Excluded

The following features are intentionally out of scope:

- Voice interaction
- User authentication
- User accounts
- Persistent databases
- Long-term conversation history
- Resume parsing
- Mobile application
- Video interviews
- Recruiter dashboard

---

# 5. Functional Requirements

## FR-1 Interview Initialization

The system shall:

- Accept a candidate profile through the API.
- Initialize a new interview session.
- Create an interview plan.
- Return the opening interview question.

---

## FR-2 Curriculum-Aware Planning

The system shall:

- Load the supplied curriculum JSON.
- Analyze the candidate profile.
- Prioritize completed learning missions.
- Optionally assess skipped topics to identify learning gaps.
- Ensure balanced curriculum coverage.

---

## FR-3 Interview Conversation

The system shall:

- Conduct a conversational interview.
- Ask one question at a time.
- Wait for the candidate's response.
- Continue until interview completion.

---

## FR-4 Curriculum Coverage

Each interview shall:

- Ask at least eight questions.
- Cover at least four different curriculum days.
- Progress naturally in difficulty.
- Avoid unnecessary repetition.

---

## FR-5 Adaptive Follow-up Questions

The system shall generate follow-up questions whenever:

- An answer is incomplete.
- An explanation lacks technical depth.
- Clarification is required.
- Additional reasoning should be explored.

Follow-up questions should remain related to the current topic before introducing a new concept.

---

## FR-6 Conversation Context

The system shall maintain:

- Current interview progress
- Previous questions
- Previous responses
- Covered curriculum days
- Candidate performance
- Follow-up history

The interviewer should use this context throughout the interview.

---

## FR-7 Response Evaluation

Each candidate response shall be evaluated for:

- Technical correctness
- Conceptual understanding
- Completeness
- Practical reasoning
- Communication clarity

The evaluation should influence future questioning.

---

## FR-8 Interview Completion

At the conclusion of the interview, the system shall generate:

- Interview summary
- Strengths
- Knowledge gaps
- Recommended next learning topics

The response format shall comply with the official technical specification.

---

## FR-9 API Compliance

The application shall expose a single HTTP endpoint:

```
POST /api/interview
```

The endpoint shall:

- Accept interview initialization requests.
- Accept subsequent interview messages.
- Maintain interview state using the supplied `sessionId`.
- Return the required response structure defined in the official technical specification.

---

# 6. Non-Functional Requirements

## Performance

The system should:

- Respond within approximately five seconds under normal conditions.
- Minimize unnecessary LLM calls.
- Efficiently manage interview sessions.

---

## Reliability

The system should gracefully handle:

- Invalid requests
- Missing candidate data
- Invalid session identifiers
- Empty responses
- AI service failures

The application should never terminate unexpectedly due to malformed input.

---

## Maintainability

The codebase should:

- Follow a modular architecture.
- Separate business logic from AI interactions.
- Be easy to extend.
- Be well documented.

---

## Scalability

Although designed for a hackathon, the architecture should support future expansion, including:

- Additional interview domains
- Multiple AI providers
- Resume-aware interviews
- Voice interfaces
- Persistent interview history

---

## Usability

The application should:

- Present one question at a time.
- Clearly indicate interview progress.
- Display feedback in an organized manner.
- Provide an interview experience similar to a real technical interview.

---

# 7. Input Data

The system receives the following resources.

## Curriculum JSON

Contains:

- Modules
- Daily topics
- Learning objectives
- Tools
- Curriculum structure

---

## Candidate Profile

Contains:

- Completed missions
- Attempt history
- Skipped topics
- Learning signals
- Progress metadata

---

# 8. Output

The system produces:

- Personalized interview questions
- Context-aware follow-up questions
- Multi-turn interview conversation
- Final structured feedback

---

# 9. Constraints

The implementation shall satisfy the following constraints:

- Single interview session
- No authentication
- No persistent storage
- No long-term memory
- No voice interaction
- API contract defined by the hackathon
- Minimum eight interview questions
- Coverage of at least four curriculum days

---

# 10. Success Criteria

The project shall be considered successful if it:

- Conducts a realistic technical interview.
- Personalizes questions using the candidate profile.
- References the curriculum during question generation.
- Generates meaningful follow-up questions.
- Maintains interview context.
- Produces structured interview feedback.
- Complies with the official API specification.
- Successfully deploys to a publicly accessible environment.

---

# 11. Future Enhancements

Potential future improvements include:

- Voice interviews
- Resume-aware interviews
- Coding assessment rounds
- Recruiter dashboard
- Multi-language support
- Interview analytics
- Candidate history
- Adaptive difficulty calibration

---

# 12. Acceptance Criteria

The implementation shall be accepted if it:

- Conducts a conversational interview.
- Covers a minimum of four curriculum days.
- Asks at least eight technical questions.
- Generates intelligent follow-up questions.
- Maintains session context.
- Produces structured feedback.
- Exposes the required API endpoint.
- Successfully passes the hackathon evaluation.