'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_CANDIDATES } from '../utils/candidates';
import { CandidateProfile, ChatMessage, Feedback, InterviewResponse } from '../types/interview';
import { postInterview } from '../services/api';
import { speakText, stopSpeech } from '../utils/voice';
import ThreeDAvatar from '../components/ThreeDAvatar';
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
  Radio
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

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Handle Voice / Text-to-Speech playback for AI question
  const handleSpeak = (text: string) => {
    if (isMuted) return;
    speakText(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      isMuted
    );
  };

  // Start Interview Flow
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

  // Submit Answer Turn Flow
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

  // Toggle Microphone Speech Recognition
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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Lighting Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStep('select')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                AI Executive Interviewer
              </h1>
              <p className="text-xs text-slate-400 font-medium">Interactive 3D Voice Persona</p>
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
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                <span>{isMuted ? 'Voice Muted' : 'Voice Enabled'}</span>
              </button>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Active
            </span>

            {step !== 'select' && (
              <button
                onClick={() => setStep('select')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
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
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
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
              3D Hologram AI Interviewer
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Select Candidate Profile
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Experience a production-grade 3D AI interviewer with voice synthesis, adaptive question progression, and detailed performance evaluation.
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
                      ? 'bg-slate-900/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-lg shadow-inner">
                          {cand.member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white">{cand.member.name}</h3>
                          <p className="text-xs text-indigo-400 font-medium">{cand.member.jobRole}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 text-xs font-mono">
                        {cand.member.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 mb-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
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
                  Building Roadmap & Voice Persona...
                </>
              ) : (
                <>
                  Start 3D Voice Interview ({selectedCandidate.member.name})
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* VIEW 2: Professional 3D Voice Technical Interview Studio */}
      {step === 'interview' && (
        <section className="max-w-7xl mx-auto px-4 py-4 flex-1 flex flex-col md:flex-row gap-6 w-full h-[calc(100vh-75px)]">
          {/* Left Column: 3D Holographic AI Interviewer Persona Card */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col items-center justify-between flex-1 shadow-2xl relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  3D AI Persona
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono">
                  Gemini-1.5 Engine
                </span>
              </div>

              {/* Interactive 3D Canvas Avatar */}
              <div className="w-full h-64 my-auto">
                <ThreeDAvatar
                  isSpeaking={isSpeaking}
                  isThinking={isSubmitting}
                  candidateName={selectedCandidate.member.name}
                />
              </div>

              {/* Question Progress & Candidate Status Card */}
              <div className="w-full space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Candidate</span>
                  <span className="text-white font-bold">{selectedCandidate.member.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Role</span>
                  <span className="text-indigo-400 font-semibold">{selectedCandidate.member.jobRole}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Roadmap Progress</span>
                    <span className="text-indigo-400 font-mono font-bold">
                      Q{Math.min(turnCount, 8)} of 8
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/80">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min((turnCount / 8) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Conversational Transcript & Voice Input */}
          <div className="flex-1 flex flex-col h-full bg-slate-900/80 border border-slate-800/80 rounded-2xl backdrop-blur-md p-4 shadow-2xl overflow-hidden">
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
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-lg">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                        isAI
                          ? 'bg-slate-950/80 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
                          : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5 opacity-70">
                        <span className="font-semibold">{isAI ? 'AI Technical Interviewer' : selectedCandidate.member.name}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {!isAI && (
                      <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0 shadow-lg">
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
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm text-slate-400 flex items-center space-x-2 rounded-tl-none">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs ml-2">Evaluating response depth & generating question...</span>
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
                  className="w-full p-4 pr-24 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
                />

                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    title={isRecording ? 'Stop Voice Recording' : 'Start Voice Input'}
                    className={`p-2.5 rounded-xl transition-all ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="submit"
                    disabled={!inputAnswer.trim() || isSubmitting}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-lg shadow-indigo-600/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* VIEW 3: Final Executive Evaluation Report */}
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
            {/* Executive Summary */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
              <h3 className="text-base font-bold text-indigo-400 mb-2 flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Performance Executive Summary
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">{feedback.summary}</p>
            </div>

            {/* Grid of Strengths & Knowledge Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Key Strengths */}
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-md">
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
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-md">
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
            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-md">
              <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Recommended Next Learning Objectives
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feedback.next.map((nxt, idx) => (
                  <li key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2.5">
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
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700 flex items-center gap-2 shadow-lg"
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
