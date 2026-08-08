import { CandidateProfile, InterviewResponse } from '../types/interview';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function postInterview(payload: {
  sessionId: string;
  candidate?: CandidateProfile;
  message?: string;
}): Promise<InterviewResponse> {
  const res = await fetch(`${API_BASE}/api/interview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || `API request failed with status ${res.status}`);
  }

  return res.json();
}
