'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_CANDIDATES, getStrongestTopic, getHighlightMissions } from '../utils/candidates';
import { CandidateProfile, ChatMessage, Feedback, InterviewResponse, TopicBreakdown } from '../types/interview';
import { postInterview } from '../services/api';
import { speakText, stopSpeech } from '../utils/voice';
import { Header } from '../components/Header';
import { ResponsiveWrapper } from '../components/ResponsiveWrapper';

// UI Components
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ScoreRing } from '../components/ui/ScoreRing';
import { TopicChip } from '../components/ui/TopicChip';
import { KnowledgeConstellation } from '../components/ui/KnowledgeConstellation';
import { Accordion } from '../components/ui/Accordion';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { EmptyState } from '../components/ui/EmptyState';

import {
  ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight,
  Radio, Bot, VolumeX, Volume2, User, Mic, MicOff, Send,
  Award, BarChart2, BookOpen, Printer, HelpCircle, Target
} from 'lucide-react';

const DAY_SHORT_TITLES: Record<number, string> = {
  7: 'Embeddings',
  8: 'Vector DBs',
  10: 'Retrieval Engine',
  11: 'RAG End-to-End',
  12: 'Prompt Engineering',
  13: 'Function Calling',
  16: 'Chatbot Backend',
  18: 'Streaming',
  20: 'Memory & Context',
  21: 'LangChain Agents',
  22: 'Multi-Agent',
  23: 'MCP Protocol',
  28: 'Docker & K8s',
  29: 'Observability',
  31: 'Capstone Project',
};

function getDayTitle(day: number): string {
  return DAY_SHORT_TITLES[day] || `Topic ${day}`;
}

export default function Home() {
  const [step, setStep] = useState<'select' | 'interview' | 'results'>('select');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(SAMPLE_CANDIDATES[0]);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coveredDays, setCoveredDays] = useState<number[]>([7, 8]);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldRecordRef = useRef<boolean>(false);
  const baseTextRef = useRef<string>('');


  // Initialize Dark Mode state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting, isSpeaking]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleSpeak = (text: string) => {
    if (isMuted) return;
    speakText(text, () => setIsSpeaking(true), () => setIsSpeaking(false), isMuted);
  };

  const handleStartInterview = async () => {
    stopSpeech();
    setErrorMsg(null);
    setIsSubmitting(true);
    baseTextRef.current = '';
    setInputAnswer('');
    const newSessionId = 'session-' + Date.now();

    setSessionId(newSessionId);
    setMessages([]);
    setTurnCount(0);
    setFeedback(null);
    setStep('interview');

    try {
      const res: InterviewResponse = await postInterview({
        sessionId: newSessionId,
        candidate: selectedCandidate,
      });

      if (res.progress?.coveredDays && res.progress.coveredDays.length > 0) {
        setCoveredDays(res.progress.coveredDays);
      }

      const dayNum = res.progress?.currentDay || 7;
      const dayTitleText = res.progress?.currentDayTitle || 'Embeddings Explained';
      const initialTag = `DAY ${dayNum} · ${dayTitleText.toUpperCase()}`;

      const initialMessage: ChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'interviewer',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topicTag: initialTag,
        questionType: 'planned',
      };

      setMessages([initialMessage]);
      setTurnCount(1);
      handleSpeak(res.reply);
    } catch (err: any) {
      setStep('select');
      setSessionId('');
      setMessages([]);
      setTurnCount(0);
      setFeedback(null);
      setErrorMsg(err.message || 'Failed to start interview session. Ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputAnswer.trim() || isSubmitting) return;

    stopSpeech();
    setIsSpeaking(false);
    setErrorMsg(null);
    const userText = inputAnswer.trim();
    setInputAnswer('');
    baseTextRef.current = '';
    shouldRecordRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);


    const userMessage: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'candidate',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSubmitting(true);

    try {
      const res: InterviewResponse = await postInterview({
        sessionId,
        message: userText,
      });

      if (res.progress?.coveredDays && res.progress.coveredDays.length > 0) {
        setCoveredDays(res.progress.coveredDays);
      }

      if (res.done && res.feedback) {
        setFeedback(res.feedback);
        setStep('results');
        handleSpeak('Interview completed. Here is your technical feedback evaluation report.');
      } else {
        const qType = res.progress?.currentQuestionType === 'follow-up' ? 'follow-up' : 'planned';
        const dayNum = res.progress?.currentDay || 8;
        const dayTitleText = res.progress?.currentDayTitle || 'Vector Databases';
        const dayTag = `DAY ${dayNum} · ${dayTitleText.toUpperCase()}`;

        const interviewerMessage: ChatMessage = {
          id: 'msg-ai-' + Date.now(),
          sender: 'interviewer',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          topicTag: dayTag,
          questionType: qType,
        };
        setMessages((prev) => [...prev, interviewerMessage]);
        setTurnCount((prev) => prev + 1);
        handleSpeak(res.reply);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser speech recognition is not supported. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      shouldRecordRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsRecording(false);
    } else {
      shouldRecordRef.current = true;
      baseTextRef.current = inputAnswer;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentSessionText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentSessionText += event.results[i][0].transcript;
        }
        const base = baseTextRef.current.trim();
        const text = currentSessionText.trim();
        setInputAnswer(base ? base + ' ' + text : text);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        shouldRecordRef.current = false;
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (shouldRecordRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  // Dynamically compute topic breakdowns based on candidate's real messages if backend report lacks topic breakdowns
  const candidateUserMessages = messages.filter((m) => m.sender === 'candidate');
  const avgWordCount = candidateUserMessages.length
    ? Math.round(candidateUserMessages.reduce((sum, m) => sum + m.text.split(' ').length, 0) / candidateUserMessages.length)
    : 0;

  const realTopicBreakdowns: TopicBreakdown[] = (feedback?.topicBreakdowns && feedback.topicBreakdowns.length > 0)
    ? feedback.topicBreakdowns
    : [
      {
        day: coveredDays[0] || 7,
        title: getDayTitle(coveredDays[0] || 7),
        score: avgWordCount < 5 ? 20 : avgWordCount < 15 ? 55 : 85,
        evidence: candidateUserMessages[0]
          ? `Candidate answered: "${candidateUserMessages[0].text.slice(0, 60)}${candidateUserMessages[0].text.length > 60 ? '...' : ''}" (${candidateUserMessages[0].text.split(' ').length} words).`
          : 'No response recorded.',
      },
      {
        day: coveredDays[1] || 8,
        title: getDayTitle(coveredDays[1] || 8),
        score: avgWordCount < 5 ? 25 : avgWordCount < 15 ? 60 : 75,
        evidence: candidateUserMessages[1]
          ? `Candidate answered: "${candidateUserMessages[1].text.slice(0, 60)}${candidateUserMessages[1].text.length > 60 ? '...' : ''}" (${candidateUserMessages[1].text.split(' ').length} words).`
          : 'Brief or empty response.',
      },
      {
        day: coveredDays[2] || 10,
        title: getDayTitle(coveredDays[2] || 10),
        score: avgWordCount < 5 ? 20 : avgWordCount < 15 ? 50 : 80,
        evidence: candidateUserMessages[2]
          ? `Candidate answered: "${candidateUserMessages[2].text.slice(0, 60)}${candidateUserMessages[2].text.length > 60 ? '...' : ''}" (${candidateUserMessages[2].text.split(' ').length} words).`
          : 'Requires technical elaboration.',
      },
      {
        day: coveredDays[3] || 23,
        title: getDayTitle(coveredDays[3] || 23),
        score: avgWordCount < 5 ? 15 : avgWordCount < 15 ? 45 : 70,
        evidence: candidateUserMessages[3]
          ? `Candidate answered: "${candidateUserMessages[3].text.slice(0, 60)}${candidateUserMessages[3].text.length > 60 ? '...' : ''}" (${candidateUserMessages[3].text.split(' ').length} words).`
          : 'Topic requires deep review.',
      },
    ];

  // Calculate readiness score dynamically if missing from backend feedback
  const computedReadinessScore = feedback?.readinessScore !== undefined
    ? feedback.readinessScore
    : Math.round(
      realTopicBreakdowns.reduce((acc, t) => acc + t.score, 0) / Math.max(1, realTopicBreakdowns.length)
    );

  const candidateWeakestMsg = candidateUserMessages.find((m) => m.text.split(' ').length < 10) || candidateUserMessages[0];

  return (
    <main className="min-h-screen bg-[#F9F9FB] dark:bg-[#0F0A1C] text-[#1A1A2E] dark:text-[#F9F9FB] flex flex-col font-sans relative selection:bg-[#560BAD] selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Cohort Aurora Ambient Background Layer */}

      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>

      {/* Header */}
      <Header
        onChangeCandidate={() => setStep('select')}
        activeStep={step}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Sub-header Controls Bar */}
      <div className="relative z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur border-b border-slate-200/60 dark:border-slate-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            <StatusIndicator type="connected" label="API Server Online" />
            {step === 'interview' && (
              <button
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (nextMute) stopSpeech();
                }}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 ${isMuted
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                  }`}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
                <span>{isMuted ? 'Voice Muted' : 'Voice Live'}</span>
              </button>
            )}
          </div>

          {step !== 'select' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep('select')}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Switch Candidate
            </Button>
          )}
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-sm flex items-center gap-3 shadow-md">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <p className="flex-1 font-medium">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 1: LOBBY / CANDIDATE SELECTION LAUNCHPAD                          */}
      {/* ========================================================================= */}
      {step === 'select' && (
        <section className="max-w-6xl mx-auto px-4 py-10 flex-1 flex flex-col justify-center w-full relative z-10">
          {/* Editorial Hero Section */}
          <div className="text-center space-y-4 mb-12 relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Personalized AI Cohort Interview Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
              Turn your learning journey into <span className="text-indigo-600 dark:text-indigo-400">interview confidence.</span>
            </h1>

            <p className="text-slate-600 dark:text-white/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Practice adaptive technical interviews built from the exact projects and concepts you have actually completed in your AI cohort.
            </p>

            {/* Trust Statement */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Questions are selected only from completed cohort topics. Skipped topics are excluded.
              </span>
            </div>
          </div>

          {/* 3-Step Process Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700 shadow-sm backdrop-blur-sm flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-extrabold flex items-center justify-center text-base flex-shrink-0">
                01
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Select Cohort Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-200 mt-1">Load candidate mission history & passed curriculum days.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700 shadow-sm backdrop-blur-sm flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-extrabold flex items-center justify-center text-base flex-shrink-0">
                02
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Adaptive AI Probing</h3>
                <p className="text-xs text-slate-500 dark:text-slate-200 mt-1">AI Interviewer evaluates depth & asks tailored follow-up questions.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700 shadow-sm backdrop-blur-sm flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-extrabold flex items-center justify-center text-base flex-shrink-0">
                03
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Actionable Feedback Report</h3>
                <p className="text-xs text-slate-500 dark:text-slate-200 mt-1">Receive readiness score, knowledge map, and targeted revision steps.</p>
              </div>
            </div>
          </div>

          {/* Candidate Selection Cards */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Select Candidate Profile
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-200 font-mono">
              {SAMPLE_CANDIDATES.length} Cohort Candidates Available
            </span>
          </div>

          {SAMPLE_CANDIDATES.length === 0 ? (
            <EmptyState onRetry={handleStartInterview} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 perspective-1000">
              {SAMPLE_CANDIDATES.map((cand) => {
                const isSelected = selectedCandidate.member.id === cand.member.id;
                const passedCount = cand.missions.filter((m) => m.passed).length;
                const skippedCount = cand.missions.filter((m) => m.skipped).length;

                return (
                  <Card
                    key={cand.member.id}
                    variant={isSelected ? 'elevated' : 'interactive'}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`relative p-6 transition-all duration-300 ${isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-600/30 dark:ring-indigo-500/40 bg-white dark:bg-slate-900 shadow-2xl glow-border-indigo'
                        : 'hover:border-indigo-300 dark:hover:border-slate-700'
                      }`}
                  >
                    {/* Header Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-indigo-950 dark:to-slate-900 text-white font-extrabold text-lg flex items-center justify-center shadow-md border border-white/10">
                          {cand.member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            {cand.member.name}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                          </h3>
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{cand.member.jobRole}</p>
                        </div>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {cand.member.id}
                      </Badge>
                    </div>

                    {/* Candidate Metrics Box */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 mb-4">
                      <div>
                        <span className="text-slate-500 dark:text-slate-200 block text-[11px]">Experience</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{cand.member.yearsExperience} Years</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-200 block text-[11px]">Education</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate block">{cand.member.education}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-200 block text-[11px]">Cohort Missions</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{passedCount} Completed</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-200 block text-[11px]">Skipped Topics</span>
                        <span className="font-extrabold text-amber-600 dark:text-amber-400">{skippedCount} Excluded</span>
                      </div>
                    </div>

                    {/* Topic Chips preview */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-200">
                        <span>Strongest Topic:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{getStrongestTopic(cand)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {getHighlightMissions(cand).map((m) => (
                          <TopicChip key={m.day} day={m.day} title={m.title} status="passed" />
                        ))}
                        {cand.missions.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-200 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            +{cand.missions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 dark:text-slate-200 font-mono">
                        {cand.signals?.commitDays || 20}+ Commit Days
                      </span>
                      {isSelected ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-1">
                          Ready to Launch <ArrowRight className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold">
                          Click to select
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Launch Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={handleStartInterview}
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="px-10 py-4 text-base"
            >
              Start Personalized Interview ({selectedCandidate.member.name})
            </Button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: LIVE INTERVIEW WORKSPACE                                        */}
      {/* ========================================================================= */}
      {step === 'interview' && (
        <section className="max-w-7xl mx-auto px-4 py-4 flex-1 flex flex-col lg:flex-row gap-6 w-full h-[calc(100vh-120px)] relative z-10">
          {/* Left Rail: Interview Intelligence */}
          <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto pr-1">
            {/* 3D Presenter Studio Container */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white flex flex-col items-center shadow-2xl relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  3D AI Studio Stage
                </span>
                <Badge variant="indigo" size="sm">
                  WebGL 3D
                </Badge>
              </div>

              {/* 3D Presenter Canvas Component */}
              <div className="w-full aspect-square my-auto relative">
                <ResponsiveWrapper
                  isSpeaking={isSpeaking}
                  isThinking={isSubmitting}
                  candidateName={selectedCandidate.member.name}
                />

                {/* Audio Soundwave Equalizer overlay when speaking */}
                {isSpeaking && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end justify-center space-x-1.5 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-indigo-500/40 z-20">
                    <span className="w-1.5 bg-indigo-400 rounded-full animate-soundwave-1" />
                    <span className="w-1.5 bg-indigo-400 rounded-full animate-soundwave-2" />
                    <span className="w-1.5 bg-indigo-400 rounded-full animate-soundwave-3" />
                    <span className="w-1.5 bg-indigo-400 rounded-full animate-soundwave-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Summary Card */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-200 uppercase tracking-wider">Candidate</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{selectedCandidate.member.name}</h3>
                </div>
                <Badge variant="indigo" size="sm">
                  {selectedCandidate.member.jobRole}
                </Badge>
              </div>

              {/* Live Interview Progress */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-200">Interview Progress</span>
                  <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">
                    Q{Math.min(turnCount, 8)} of 8
                  </span>
                </div>
                <ProgressBar value={Math.min((turnCount / 8) * 100, 100)} color="indigo" />
              </div>

              {/* Assessed Topics */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-200 uppercase tracking-wider block">
                  Curriculum Coverage ({coveredDays.length} Days)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {coveredDays.map((dayNum) => (
                    <TopicChip key={dayNum} day={dayNum} title={getDayTitle(dayNum)} status="passed" />
                  ))}
                </div>
              </div>

              {/* Personalized Rationale */}
              <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <span className="font-bold block mb-0.5">Personalized Strategy:</span>
                Questions selected from candidate's passed cohort missions. Probing technical accuracy & architecture choices.
              </div>
            </Card>
          </div>

          {/* Right Area: Conversation Workspace */}
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-lg overflow-hidden">
            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
              {messages.map((msg) => {
                const isAI = msg.sender === 'interviewer';
                return (
                  <div key={msg.id} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    {isAI && (
                      <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center flex-shrink-0 shadow-md border border-slate-800">
                        <Bot className="w-5 h-5 text-indigo-400" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed ${isAI
                          ? 'bg-slate-900 dark:bg-slate-800 text-slate-100 rounded-tl-none shadow-md border border-slate-800 dark:border-slate-700'
                          : 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        }`}
                    >
                      {/* Turn Metadata Bar */}
                      <div className="flex items-center justify-between text-[11px] mb-2 border-b border-white/10 pb-2 opacity-80">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{isAI ? 'Interviewer' : selectedCandidate.member.name}</span>
                          {isAI && msg.topicTag && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-mono text-[10px]">
                              {msg.topicTag}
                            </span>
                          )}
                        </div>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>

                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {!isAI && (
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Intelligent Scanning / Thinking State */}
              {isSubmitting && (
                <div className="flex gap-3 justify-start">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-300 flex items-center space-x-3 rounded-tl-none shadow-md">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300">
                      Evaluating explanation depth against cohort rubric...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Answer Composer */}
            <form onSubmit={handleSubmitAnswer} className="relative mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative flex items-center">
                <textarea
                  rows={3}
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSubmitAnswer();
                    }
                  }}
                  placeholder="Type your technical explanation here... (Press Ctrl+Enter to submit)"
                  className="w-full p-4 pr-28 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-gray-300 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none transition-all"
                />
                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
                    className={`p-2.5 rounded-xl transition-all ${isRecording
                        ? 'bg-rose-600 text-white animate-pulse shadow-md'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!inputAnswer.trim() || isSubmitting}
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: FINAL REPORT / PERFORMANCE DASHBOARD                            */}
      {/* ========================================================================= */}
      {step === 'results' && feedback && (
        <section className="max-w-5xl mx-auto px-4 py-10 flex-1 flex flex-col justify-center w-full relative z-10">
          {/* Dark Immersive Report Hero Banner */}
          <div className="relative rounded-3xl bg-slate-950 border border-slate-800 p-8 sm:p-10 mb-8 overflow-hidden shadow-2xl text-white glow-border-indigo">
            <div className="absolute inset-0 report-hero-glow pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Hero Left Info */}
              <div className="space-y-4 text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Technical Evaluation Report Completed</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {selectedCandidate.member.name}
                </h1>

                <p className="text-indigo-200 text-sm font-medium">
                  {selectedCandidate.member.jobRole} &bull; ABTalks AI Cohort Assessment
                </p>

                <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                  "{feedback.summary}"
                </p>

                <div className="flex flex-wrap gap-2 text-xs pt-2">
                  <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                    8 Questions Asked
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                    {coveredDays.length} Curriculum Days Assessed
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                    Adaptive Follow-ups Completed
                  </span>
                </div>
              </div>

              {/* Hero Right Score Ring */}
              <div className="flex flex-col items-center justify-center flex-shrink-0 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
                <ScoreRing
                  score={computedReadinessScore}
                  label={feedback.readinessLabel || (computedReadinessScore >= 80 ? 'Strong' : computedReadinessScore >= 55 ? 'Interview Ready' : 'Developing')}
                  size={150}
                />
                <span className="text-xs font-bold text-indigo-300 mt-3">
                  Readiness Rating
                </span>
              </div>
            </div>
          </div>

          {/* Main Report Body Grid */}
          <div className="space-y-8 mb-10">
            {/* Section A: Performance Atlas & Knowledge Constellation */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Performance Atlas & Knowledge Map
              </h2>

              <KnowledgeConstellation topics={realTopicBreakdowns} />

              {/* Topic Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {realTopicBreakdowns.map((tb) => (
                  <Card key={tb.day} className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <TopicChip day={tb.day} title={tb.title} status={tb.score >= 70 ? 'passed' : 'skipped'} />
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white tabular-nums">
                        {tb.score}%
                      </span>
                    </div>
                    <ProgressBar value={tb.score} color={tb.score >= 70 ? 'emerald' : tb.score >= 45 ? 'amber' : 'slate'} />
                    <p className="text-xs text-slate-600 dark:text-slate-200 leading-relaxed pt-1">
                      {tb.evidence}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Section B: Strengths vs Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 space-y-4">
                <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  What You Demonstrated (Strengths)
                </h3>
                <ul className="space-y-2.5">
                  {feedback.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 bg-amber-50/40 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 space-y-4">
                <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  What to Strengthen (Knowledge Gaps)
                </h3>
                <ul className="space-y-2.5">
                  {feedback.gaps.map((gap, idx) => (
                    <li key={idx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Section C: Revise Next - Concrete Prioritized Actions */}
            <Card className="p-6 space-y-4 bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Revise Next (Prioritized Action Plan)
                </h3>
                <Badge variant="indigo" size="sm">
                  Recommended Action
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {feedback.next.map((nxt, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {idx === 0 ? 'Review Concept' : idx === 1 ? 'Rebuild/Practice' : 'Reattempt Probing'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{nxt}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Section D: Improve This Answer Compare View */}
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Improve This Answer (Compare View)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-500 dark:text-slate-200 uppercase tracking-wider block text-[10px]">
                    Your Explanation ({feedback.answerComparison ? 'Selected Turn' : 'Weakest Response'})
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    "{feedback.answerComparison?.candidateAnswer || candidateWeakestMsg?.text || 'idk'}"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700 space-y-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block text-[10px]">
                    Stronger Technical Answer
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {feedback.answerComparison?.strongerAnswer ||
                      'Vector databases store high-dimensional embeddings generated by neural models and index them using approximate nearest neighbor algorithms like HNSW or IVF to achieve sub-linear query latency while preserving similarity search accuracy.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Section E: Collapsible Transparency Accordion */}
            <Accordion
              title={
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Why These Topics Were Selected
                  </span>
                </div>
              }
            >
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                <p>
                  <strong>Personalized Curriculum Selection:</strong> Topics were selected directly from the candidate's verified completed cohort missions (Days {coveredDays.join(', ')}).
                </p>
                <p>
                  <strong>Exclusion Guarantee:</strong> Skipped or incomplete topics were automatically excluded to maintain fairness.
                </p>
                <p>
                  <strong>Target Role Relevance:</strong> Selected questions focus heavily on vector search, embedding models, and multi-agent coordination relevant to the target role ({selectedCandidate.member.jobRole}).
                </p>
              </div>
            </Accordion>
          </div>

          {/* Bottom Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={handleStartInterview}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retake Focused Interview ({selectedCandidate.member.name})
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setStep('select')}
              leftIcon={<User className="w-4 h-4" />}
            >
              Choose Another Candidate
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print / Save PDF Report
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}
