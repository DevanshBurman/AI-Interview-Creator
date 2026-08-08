# API_SPEC.md

# AI Interview Agent - API Specification

Version: 2.0

---

# 1. Overview

The AI Interview Agent exposes a single REST endpoint that supports the complete interview lifecycle.

The endpoint is responsible for:

- Initializing interview sessions
- Conducting multi-turn interviews
- Maintaining interview state
- Returning structured interview feedback upon completion

The application follows the official hackathon API contract.

---

# 2. Base URL

```
/api
```

Example

```
http://localhost:8000/api
```

---

# 3. Authentication

Authentication is **not required**.

Interview state is maintained using the supplied `sessionId`.

---

# 4. Endpoint

```
POST /api/interview
```

This endpoint handles the complete interview lifecycle.

---

# 5. Request Types

## 5.1 Interview Initialization

Starts a new interview.

### Request

```json
{
    "sessionId": "abc-123",
    "candidate": {
        ...
    }
}
```

### Description

The backend should:

- Create a new interview session
- Analyze the supplied candidate profile
- Generate an interview roadmap
- Return the opening interview question

---

## 5.2 Conversation Turn

Every subsequent request contains the candidate's latest response.

### Request

```json
{
    "sessionId": "abc-123",
    "message": "RAG retrieves relevant documents before generating an answer."
}
```

### Description

The backend should:

- Load interview session
- Evaluate the response
- Update interview memory
- Decide whether to ask a follow-up
- Generate the next question
- Return the updated interview state

---

# 6. Response Types

## 6.1 Interview In Progress

```json
{
    "reply": "Can you explain why vector embeddings are useful?",
    "done": false
}
```

---

## 6.2 Interview Completed

```json
{
    "reply": "Interview completed successfully.",
    "done": true,
    "feedback": {
        "summary": "Strong understanding of Prompt Engineering and RAG.",
        "strengths": [
            "Good conceptual understanding",
            "Clear communication"
        ],
        "gaps": [
            "Limited knowledge of Vector Databases"
        ],
        "next": [
            "Study vector similarity search",
            "Practice retrieval optimization"
        ]
    }
}
```

---

# 7. Interview Lifecycle

```text
Client

↓

POST /api/interview
(candidate)

↓

Interview Started

↓

reply

↓

POST /api/interview
(message)

↓

reply

↓

POST /api/interview
(message)

↓

reply

↓

...

↓

Interview Complete

↓

feedback
```

---

# 8. Session Management

Each interview is uniquely identified by a `sessionId`.

The backend maintains interview state using this identifier.

Each session stores:

- Candidate profile
- Interview roadmap
- Current question index
- Previous questions
- Candidate responses
- Covered curriculum days
- Evaluation history
- Interview completion status

Sessions remain active only during the interview.

---

# 9. Validation Rules

## Interview Initialization

The request must contain:

- sessionId
- candidate object

The candidate profile must conform to the supplied schema.

---

## Conversation Turn

The request must contain:

- sessionId
- message

The backend shall reject:

- Missing sessionId
- Unknown sessions
- Empty responses
- Completed interviews

---

# 10. Error Responses

Example

```json
{
    "success": false,
    "message": "Invalid session."
}
```

Example

```json
{
    "success": false,
    "message": "Candidate profile is missing."
}
```

Example

```json
{
    "success": false,
    "message": "Interview has already completed."
}
```

---

# 11. HTTP Status Codes

| Status | Description |
|---------|-------------|
| 200 | Successful request |
| 400 | Invalid request |
| 404 | Session not found |
| 422 | Validation error |
| 500 | Internal server error |
| 503 | AI service unavailable |

---

# 12. API Workflow

```text
Interview Initialization

↓

Planner creates roadmap

↓

Generate Question

↓

Candidate replies

↓

Evaluate response

↓

Need follow-up?

├── Yes
│      ↓
│  Follow-up
│
└── No
       ↓
  Next topic

↓

Interview finished?

├── No → Continue

└── Yes
       ↓
Return feedback
```

---

# 13. Response Time Goals

The API should:

- Respond within approximately five seconds.
- Maintain lightweight in-memory sessions.
- Minimize unnecessary AI requests.

---

# 14. Future Extensions

The current API is intentionally minimal.

Potential future extensions include:

```
GET /api/interview/{sessionId}

DELETE /api/interview/{sessionId}

GET /api/interview/transcript/{sessionId}
```

These endpoints are outside the scope of the current hackathon.

---

# 15. Compliance

The API implementation shall satisfy all official hackathon requirements:

- Single REST endpoint
- Session-based interview management
- Conversational interview flow
- Minimum eight interview questions
- Coverage of at least four curriculum days
- Intelligent follow-up questions
- Structured interview feedback
- No authentication