'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_CANDIDATES } from '../utils/candidates';
import { CandidateProfile, ChatMessage, Feedback, InterviewResponse } from '../types/interview';
import { postInterview } from '../services/api';
import {
  User,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Brain,
  Award,
  BookOpen,
  Zap,
  BarChart2
} from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState<'select' | 'interview' | 'results'>('select');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(SAMPLE_CANDIDATES[0]);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  // Start Interview Flow
  const handleStartInterview = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([]);
    setTurnCount(0);
    setFeedback(null);

    try {
      const res: InterviewResponse = await postInterview({
        sessionId: newSessionId,
        candidate: selectedCandidate
      });

      const initialMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'interviewer',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([initialMessage]);
      setTurnCount(1);
      setStep('interview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start interview session. Ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Answer Turn Flow
  const handleSubmitAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputAnswer.trim() || isSubmitting) return;

    setErrorMsg(null);
    const userText = inputAnswer.trim();
    setInputAnswer('');

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'candidate',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSubmitting(true);

    try {
      const res: InterviewResponse = await postInterview({
        sessionId,
        message: userText
      });

      if (res.done && res.feedback) {
        setFeedback(res.feedback);
        setStep('results');
      } else {
        const interviewerMessage: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'interviewer',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, interviewerMessage]);
        setTurnCount((prev) => prev + 1);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStep('select')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                AI Interview Agent
              </h1>
              <p className="text-xs text-slate-400 font-medium">Personalized Technical Interviewer</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Active
            </span>
            {step !== 'select' && (
              <button
                onClick={() => setStep('select')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Candidate
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {errorMsg && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <p className="flex-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* VIEW 1: Candidate Selection */}
      {step === 'select' && (
        <section className="max-w-5xl mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              AI Cohort 31-Day Enterprise Program
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Select Candidate Profile
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              The interviewer automatically analyzes completed cohort missions, skipped topics, and job experience to generate a personalized 8-question technical interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {SAMPLE_CANDIDATES.map((cand) => {
              const isSelected = selectedCandidate.member.id === cand.member.id;
              const passedCount = cand.missions.filter((m) => m.passed).length;
              const skippedCount = cand.missions.filter((m) => m.skipped).length;

              return (
                <div
                  key={cand.member.id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`relative p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-lg">
                          {cand.member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white">{cand.member.name}</h3>
                          <p className="text-xs text-indigo-400 font-medium">{cand.member.jobRole}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                        {cand.member.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block">Experience</span>
                        <span className="font-medium">{cand.member.yearsExperience} Years</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Education</span>
                        <span className="font-medium truncate block">{cand.member.education}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Passed Missions</span>
                        <span className="font-medium text-emerald-400">{passedCount} Completed</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Skipped Topics</span>
                        <span className="font-medium text-amber-400">{skippedCount} Skipped</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                    <span>Signals: {cand.signals?.commitDays || 0} Commit Days</span>
                    {isSelected && (
                      <span className="text-indigo-400 font-semibold flex items-center gap-1">
                        Selected <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleStartInterview}
              disabled={isSubmitting}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Initializing Roadmap...
                </>
              ) : (
                <>
                  Start Technical Interview ({selectedCandidate.member.name})
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* VIEW 2: Live Conversational Technical Interview */}
      {step === 'interview' && (
        <section className="max-w-4xl mx-auto px-4 py-6 flex-1 flex flex-col w-full h-[calc(100vh-80px)]">
          {/* Candidate Context Header */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                {selectedCandidate.member.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{selectedCandidate.member.name}</h3>
                <p className="text-xs text-slate-400">{selectedCandidate.member.jobRole}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Interview Progress</span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  Question {Math.min(turnCount, 8)} of 8
                </span>
              </div>
              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min((turnCount / 8) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => {
              const isAI = msg.sender === 'interviewer';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {isAI && (
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                      isAI
                        ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1.5 opacity-70">
                      <span className="font-semibold">{isAI ? 'AI Technical Interviewer' : selectedCandidate.member.name}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {!isAI && (
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isSubmitting && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-400 flex items-center space-x-2 rounded-tl-none">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs ml-2">Evaluating response & generating next question...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Response Form Input */}
          <form onSubmit={handleSubmitAnswer} className="relative mt-auto">
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
              className="w-full p-4 pr-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputAnswer.trim() || isSubmitting}
              className="absolute right-3 bottom-4 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-lg shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      {/* VIEW 3: Final Structured Feedback Report */}
      {step === 'results' && feedback && (
        <section className="max-w-4xl mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Interview Evaluation Completed
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Technical Interview Feedback Report
            </h2>
            <p className="text-slate-400 text-sm">
              Candidate: <span className="text-white font-semibold">{selectedCandidate.member.name}</span> ({selectedCandidate.member.jobRole})
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Overall Performance Summary */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-indigo-400 mb-2 flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Performance Executive Summary
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">{feedback.summary}</p>
            </div>

            {/* Grid of Strengths & Knowledge Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Key Strengths */}
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Key Demonstrated Strengths
                </h4>
                <ul className="space-y-2">
                  {feedback.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Knowledge Gaps */}
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Identified Knowledge Gaps
                </h4>
                <ul className="space-y-2">
                  {feedback.gaps.map((gap, idx) => (
                    <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Next Learning Objectives */}
            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
              <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Recommended Next Learning Objectives
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feedback.next.map((nxt, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>{nxt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setStep('select')}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Conduct Another Interview
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
