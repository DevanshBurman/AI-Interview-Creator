from typing import Dict, Optional
import threading
from backend.models.session import InterviewSession
from backend.schemas.candidate import CandidateProfile

class SessionManager:
    """
    Thread-safe in-memory session manager for tracking active interview sessions.
    Interview state exists only during the session lifecycle.
    """

    def __init__(self):
        self._sessions: Dict[str, InterviewSession] = {}
        self._lock = threading.Lock()

    def create_session(self, session_id: str, candidate: CandidateProfile) -> InterviewSession:
        """Create a new interview session or overwrite existing session with new candidate profile."""
        with self._lock:
            session = InterviewSession(
                sessionId=session_id,
                candidate=candidate,
                roadmap=None,
                current_question_index=0,
                previous_questions=[],
                candidate_responses=[],
                evaluation_history=[],
                covered_days=[],
                is_completed=False,
            )
            self._sessions[session_id] = session
            return session

    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        """Retrieve an active interview session by session ID."""
        with self._lock:
            return self._sessions.get(session_id)

    def has_session(self, session_id: str) -> bool:
        """Check if a session ID exists."""
        with self._lock:
            return session_id in self._sessions

    def delete_session(self, session_id: str) -> bool:
        """Delete a session by ID."""
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False

    def clear_all_sessions(self) -> None:
        """Clear all active sessions (for testing/cleanup)."""
        with self._lock:
            self._sessions.clear()

# Global singleton instance
session_manager = SessionManager()
