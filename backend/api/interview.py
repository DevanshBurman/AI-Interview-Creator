from fastapi import APIRouter, HTTPException, status
from backend.schemas.interview import (
    InterviewRequest,
    InterviewResponse,
    ErrorResponse,
)
from backend.orchestrator.interview import interview_orchestrator

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
    Main HTTP endpoint for interview lifecycle defined in Technical Specification:
    1. Start interview: payload includes `sessionId` and `candidate` profile object.
    2. Conversation turn: payload includes `sessionId` and `message` text response.
    3. End interview: when interview completes, returns reply, done=True, and structured feedback.
    """
    session_id = payload.sessionId

    # Scenario 1: Start Interview (candidate profile provided)
    if payload.candidate is not None:
        try:
            return interview_orchestrator.start_interview(session_id, payload.candidate)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    # Scenario 2: Conversation Turn (candidate message provided)
    if payload.message is not None:
        if not payload.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty."
            )

        try:
            return interview_orchestrator.process_turn(session_id, payload.message)
        except ValueError as ve:
            err_msg = str(ve)
            if "Session not found" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=err_msg
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=err_msg
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    # Scenario 3: Neither candidate nor message provided
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="Invalid request payload. Either 'candidate' or 'message' must be provided."
    )
