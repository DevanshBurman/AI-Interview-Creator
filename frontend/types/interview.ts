export interface MemberProfile {
  id: string;
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

export interface TopicBreakdown {
  day: number;
  title: string;
  score: number; // 0-100
  evidence: string;
  strengths?: string[];
  gaps?: string[];
}

export interface AnswerComparison {
  question: string;
  candidateAnswer: string;
  strongerAnswer: string;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  readinessScore?: number; // 0-100
  readinessLabel?: 'Developing' | 'Interview Ready' | 'Strong';
  topicBreakdowns?: TopicBreakdown[];
  communicationFeedback?: string;
  answerComparison?: AnswerComparison;
  topicsSelectedExplanation?: string;
  selectedDays?: number[];
  completedDays?: number;
  totalQuestions?: number;
}

export interface InterviewProgress {
  questionsAsked: number;
  totalPlanned: number;
  daysAssessed: number;
  totalDaysTargeted: number;
  coveredDays: number[];
  currentQuestionType?: 'planned' | 'follow-up' | 'recovery';
  currentDay?: number;
  currentDayTitle?: string;
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: Feedback;
  progress?: InterviewProgress;
}

export interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  topicTag?: string;
  questionType?: 'planned' | 'follow-up' | 'recovery' | 'initial';
}

