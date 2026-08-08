'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_CANDIDATES } from '../utils/candidates';
import { CandidateProfile, ChatMessage, Feedback, InterviewResponse } from '../types/interview';
import { postInterview } from '../services/api';
import { speakText, stopSpeech } from '../utils/voice';
import PhotorealisticPresenter from '../components/PhotorealisticPresenter';
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
  BarChart2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio,
  Building2,
  ShieldCheck
} from 'lucide-react';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
    speakText(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      isMuted
    );
  };

  const handleStartInterview = async () => {
    stopSpeech();
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
      handleSpeak(res.reply);
    } catch (err: any) {
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
        handleSpeak("Interview completed. Here is your technical feedback evaluation report.");
      } else {
        const interviewerMessage: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'interviewer',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      alert("Browser speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative selection:bg-indigo-600 selection:text-white">
      {/* Clean Corporate Header Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStep('select')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-lg text-slate-900">
                Enterprise AI Technical Interviewer
              </h1>
              <p className="text-xs text-slate-500 font-medium">Photorealistic Interviewer Persona</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {step === 'interview' && (
              <button
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (nextMute) stopSpeech();
                }}
                className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isMuted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                <span>{isMuted ? 'Voice Muted' : 'Voice Enabled'}</span>
              </button>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </span>

            {step !== 'select' && (
              <button
                onClick={() => setStep('select')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
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
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <p className="flex-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* VIEW 1: Candidate Selection */}
      {step === 'select' && (
        <section className="max-w-5xl mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-200/80 border border-slate-300 text-slate-800 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Professional Corporate Suite
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Select Technical Candidate
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
              The photorealistic AI Technical Interviewer evaluates candidates against the 31-day AI Cohort curriculum with real-time voice synthesis and technical evaluation.
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
                  className={`relative p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                    isSelected
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-lg">
                          {cand.member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{cand.member.name}</h3>
                          <p className="text-xs text-indigo-600 font-semibold">{cand.member.jobRole}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200">
                        {cand.member.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Experience</span>
                        <span className="font-semibold">{cand.member.yearsExperience} Years</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Education</span>
                        <span className="font-semibold truncate block">{cand.member.education}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Passed Missions</span>
                        <span className="font-semibold text-emerald-700">{passedCount} Completed</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Skipped Topics</span>
                        <span className="font-semibold text-amber-700">{skippedCount} Skipped</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <span>Signals: {cand.signals?.commitDays || 0} Commit Days</span>
                    {isSelected && (
                      <span className="text-indigo-600 font-bold flex items-center gap-1">
                        Selected <CheckCircle2 className="w-4 h-4 text-indigo-600" />
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
              className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Initializing Technical Persona...
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

      {/* VIEW 2: Photorealistic Presenter Studio */}
      {step === 'interview' && (
        <section className="max-w-7xl mx-auto px-4 py-4 flex-1 flex flex-col md:flex-row gap-6 w-full h-[calc(100vh-75px)]">
          {/* Left Column: Photorealistic Technical Interviewer Card */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-between flex-1 shadow-md relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  AI Technical Interviewer
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-mono">
                  Voice Synthesis
                </span>
              </div>

              {/* Photorealistic Presenter Component */}
              <div className="w-full h-64 my-auto">
                <PhotorealisticPresenter
                  isSpeaking={isSpeaking}
                  isThinking={isSubmitting}
                  candidateName={selectedCandidate.member.name}
                />
              </div>

              {/* Candidate Info & Question Progress Card */}
              <div className="w-full space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Candidate</span>
                  <span className="text-slate-900 font-bold">{selectedCandidate.member.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Target Role</span>
                  <span className="text-indigo-700 font-semibold">{selectedCandidate.member.jobRole}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Interview Progress</span>
                    <span className="text-slate-900 font-mono font-bold">
                      Q{Math.min(turnCount, 8)} of 8
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                    <div
                      className="bg-slate-900 h-full transition-all duration-500"
                      style={{ width: `${Math.min((turnCount / 8) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Professional Transcript & Voice Input */}
          <div className="flex-1 flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-4 shadow-md overflow-hidden">
            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((msg) => {
                const isAI = msg.sender === 'interviewer';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAI && (
                      <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                        isAI
                          ? 'bg-slate-100 border border-slate-200 text-slate-900 rounded-tl-none shadow-sm'
                          : 'bg-slate-900 text-white rounded-tr-none shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5 opacity-70">
                        <span className="font-bold">{isAI ? 'AI Technical Interviewer' : selectedCandidate.member.name}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {!isAI && (
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isSubmitting && (
                <div className="flex gap-3 justify-start">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-sm text-slate-600 flex items-center space-x-2 rounded-tl-none">
                    <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs ml-2 font-medium">Evaluating technical accuracy...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Response Textarea & Speech Input Controls */}
            <form onSubmit={handleSubmitAnswer} className="relative mt-auto">
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
                  placeholder="Type your technical explanation or click the microphone to speak... (Ctrl+Enter to submit)"
                  className="w-full p-4 pr-24 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none transition-all"
                />

                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    title={isRecording ? 'Stop Voice Recording' : 'Start Voice Input'}
                    className={`p-2.5 rounded-xl transition-all ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse shadow-md'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="submit"
                    disabled={!inputAnswer.trim() || isSubmitting}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* VIEW 3: Final Corporate Feedback Report */}
      {step === 'results' && feedback && (
        <section className="max-w-4xl mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-600" />
              Interview Evaluation Completed
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Technical Interview Feedback Report
            </h2>
            <p className="text-slate-600 text-sm">
              Candidate: <span className="text-slate-900 font-bold">{selectedCandidate.member.name}</span> ({selectedCandidate.member.jobRole})
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Executive Summary */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                Performance Executive Summary
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">{feedback.summary}</p>
            </div>

            {/* Grid of Strengths & Knowledge Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Key Strengths */}
              <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Key Demonstrated Strengths
                </h4>
                <ul className="space-y-2">
                  {feedback.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Knowledge Gaps */}
              <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200">
                <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Identified Knowledge Gaps
                </h4>
                <ul className="space-y-2">
                  {feedback.gaps.map((gap, idx) => (
                    <li key={idx} className="text-xs text-slate-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Next Learning Objectives */}
            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200">
              <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Recommended Next Learning Objectives
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feedback.next.map((nxt, idx) => (
                  <li key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 flex items-center gap-2.5 shadow-sm">
                    <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>{nxt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setStep('select')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-md flex items-center gap-2"
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
