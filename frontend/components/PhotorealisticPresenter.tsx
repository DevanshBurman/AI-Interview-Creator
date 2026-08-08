'use client';

import React from 'react';
import Image from 'next/image';
import { Volume2, Radio, Mic, Sparkles } from 'lucide-react';

interface PhotorealisticPresenterProps {
  isSpeaking: boolean;
  isThinking: boolean;
  candidateName: string;
}

export default function PhotorealisticPresenter({
  isSpeaking,
  isThinking,
  candidateName,
}: PhotorealisticPresenterProps) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      {/* Studio Frame with Dynamic Speaking Glow */}
      <div
        className={`relative w-full aspect-square max-w-[290px] rounded-2xl overflow-hidden border transition-all duration-300 shadow-xl ${
          isSpeaking
            ? 'border-indigo-600 ring-4 ring-indigo-500/30 shadow-indigo-500/20'
            : isThinking
            ? 'border-amber-500 ring-4 ring-amber-500/20'
            : 'border-slate-300'
        }`}
      >
        {/* Photorealistic Corporate Technical Interviewer Image */}
        <Image
          src="/images/interviewer.png"
          alt="Executive Technical Interviewer"
          fill
          className={`object-cover transition-transform duration-700 ${
            isSpeaking ? 'scale-105' : 'scale-100'
          }`}
          priority
        />

        {/* Studio Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

        {/* Live Speaking Audio Equalizer Wave Animation Overlay */}
        {isSpeaking && (
          <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center space-x-1.5 px-4 pointer-events-none">
            {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
              <span
                key={bar}
                className="w-1.5 bg-indigo-400 rounded-full animate-bounce shadow-md"
                style={{
                  height: `${12 + (bar % 3) * 8}px`,
                  animationDuration: `${0.4 + (bar % 4) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Live Status Pill Overlay */}
        <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-semibold flex items-center justify-between text-white shadow-lg">
          <div className="flex items-center gap-2 truncate">
            {isSpeaking ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />
                <span className="text-indigo-300 truncate">Speaking Question...</span>
              </>
            ) : isThinking ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-amber-300 truncate">Analyzing Answer...</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 truncate">Listening to {candidateName.split(' ')[0]}</span>
              </>
            )}
          </div>
          {isSpeaking && <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse flex-shrink-0" />}
        </div>
      </div>
    </div>
  );
}
