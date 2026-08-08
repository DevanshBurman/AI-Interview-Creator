export interface MemberProfile {
  id: str;
  name: string;
  jobRole?: string;
  yearsExperience?: number;
  education?: string;
  status?: string;
}

export interface MissionItem {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface CandidateSignals {
  commitDays?: number;
  missionsCompleted?: number;
  missionsFirstTry?: number;
}

export interface CandidateProfile {
  member: MemberProfile;
  missions: MissionItem[];
  signals?: CandidateSignals;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: Feedback;
}

export interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
}
