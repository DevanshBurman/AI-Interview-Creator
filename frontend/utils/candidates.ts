import { CandidateProfile } from '../types/interview';

export const SAMPLE_CANDIDATES: CandidateProfile[] = [
  {
    member: {
      id: "CAND-001",
      name: "Sarah Johnson",
      jobRole: "Senior Data Engineer",
      yearsExperience: 9,
      education: "MS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 2 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 4 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 2 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 2 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 3 },
      { day: 29, title: "Monitoring, Logging & Observability", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 }
  },
  {
    member: {
      id: "CAND-002",
      name: "Alex Turner",
      jobRole: "Backend Software Engineer",
      yearsExperience: 5,
      education: "B.Tech Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 3 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 2 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 4 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 5 },
      { day: 13, title: "Function Calling & Structured Outputs", passed: true, attempts: 4 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
      { day: 18, title: "Streaming Responses", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 3 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 2 }
    ],
    signals: { commitDays: 22, missionsCompleted: 29, missionsFirstTry: 10 }
  },
  {
    member: {
      id: "CAND-003",
      name: "Emily Chen",
      jobRole: "AI Engineer",
      yearsExperience: 6,
      education: "MS Artificial Intelligence",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 1 },
      { day: 11, title: "RAG End-to-End & LLM API Basics", passed: true, attempts: 1 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 1 },
      { day: 13, title: "Function Calling & Structured Outputs", passed: true, attempts: 1 },
      { day: 21, title: "LangChain Agents", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 1 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 31, missionsCompleted: 31, missionsFirstTry: 30 }
  },
  {
    member: {
      id: "CAND-004",
      name: "David Miller",
      jobRole: "Business Analyst",
      yearsExperience: 8,
      education: "MBA",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 4 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 5 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 5 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 3 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 2 },
      { day: 20, title: "Conversation Memory & Context Management", passed: true, attempts: 3 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 4 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 5 },
      { day: 28, title: "Docker & Kubernetes Deployment", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 2 }
    ],
    signals: { commitDays: 18, missionsCompleted: 28, missionsFirstTry: 6 }
  }
];

export function getStrongestTopic(candidate: CandidateProfile): string {
  const passed = candidate.missions.filter((m) => m.passed && !m.skipped);
  if (passed.length === 0) return 'Cohort Fundamentals';

  const minAttempts = Math.min(...passed.map((m) => m.attempts || 1));
  const topMissions = passed.filter((m) => (m.attempts || 1) === minAttempts);

  // Match role specialization for best representation
  if (candidate.member.jobRole?.includes('Data')) {
    const target = topMissions.find((m) => m.day === 31 || m.day === 8);
    if (target) return target.title;
  } else if (candidate.member.jobRole?.includes('Backend')) {
    const target = topMissions.find((m) => m.day === 28 || m.day === 16);
    if (target) return target.title;
  } else if (candidate.member.jobRole?.includes('AI Engineer')) {
    const target = topMissions.find((m) => m.day === 23 || m.day === 22);
    if (target) return target.title;
  } else if (candidate.member.jobRole?.includes('Analyst')) {
    const target = topMissions.find((m) => m.day === 16 || m.day === 31);
    if (target) return target.title;
  }

  return topMissions[topMissions.length - 1].title;
}

export function getHighlightMissions(candidate: CandidateProfile) {
  const passed = candidate.missions.filter((m) => m.passed && !m.skipped);
  const sorted = [...passed].sort((a, b) => {
    const attA = a.attempts || 1;
    const attB = b.attempts || 1;
    if (attA !== attB) return attA - attB;
    return b.day - a.day;
  });
  return sorted.slice(0, 3);
}
