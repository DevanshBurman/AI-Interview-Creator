from fastapi import APIRouter, HTTPException, status
from backend.schemas.interview import (
    InterviewRequest,
    InterviewResponse,
    FeedbackSchema,
    ErrorResponse,
)
from backend.modules.session_manager import session_manager

router = APIRouter(prefix="/api", tags=["Interview"])

app_router = router  # alias for export

@router.post(
    "/interview",
    response_model=InterviewResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        404: {"model": ErrorResponse, "description": "Session Not Found"},
        422: {"model": ErrorResponse, "description": "Validation Error"},
    },
)
def handle_interview(payload: InterviewRequest):
    """
    POST /api/interview
    Main endpoint for interview lifecycle:
    1. Start interview (payload includes candidate profile)
    2. Conversation turn (payload includes candidate message)
    3. End interview (returns final feedback when complete)
    """
    session_id = payload.sessionId

    # Scenario 1: Start Interview (candidate profile provided)
    if payload.candidate is not None:
        session = session_manager.create_session(session_id, payload.candidate)
        return InterviewResponse(
            reply="Welcome. Let's begin your interview.",
            done=False
        )

    # Scenario 2: Conversation Turn (candidate message provided)
    if payload.message is not None:
        if not payload.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty."
            )

        session = session_manager.get_session(session_id)
        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found. Please start an interview session first."
            )

        if session.is_completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interview has already completed."
            )

        # Record response in mock mode
        session.candidate_responses.append(payload.message)
        session.update_timestamp()

        # Mock turn response (Phase 2 requirement: mock responses only)
        return InterviewResponse(
            reply="Mock interviewer question: Can you explain how vector embeddings work in RAG systems?",
            done=False
        )

    # Scenario 3: Neither candidate nor message provided
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="Invalid request. Provide 'candidate' to start or 'message' to respond."
    )
