'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Volume2, Radio, Sparkles } from 'lucide-react';

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
  const [mouthOpen, setMouthOpen] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  // Natural Lip-Sync Mouth Opening Animation when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    const interval = setInterval(() => {
      // Simulate realistic phonetic mouth opening variations (0 to 12px)
      setMouthOpen(Math.floor(Math.random() * 12) + 2);
    }, 120);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Natural Eye Blinking Cycle (every 3.5 seconds)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      {/* Studio Frame with Dynamic Natural Motion & Ambient Halo */}
      <div
        className={`relative w-full aspect-square max-w-[290px] rounded-2xl overflow-hidden border transition-all duration-700 shadow-2xl ${
          isSpeaking
            ? 'border-indigo-600 ring-4 ring-indigo-500/30 shadow-indigo-500/20 scale-[1.02]'
            : isThinking
            ? 'border-amber-500 ring-4 ring-amber-500/20 scale-[1.01]'
            : 'border-slate-300 scale-100'
        }`}
      >
        {/* Photorealistic Corporate Technical Interviewer Image with Natural Sway */}
        <div
          className={`relative w-full h-full transition-transform duration-1000 ${
            isSpeaking
              ? 'animate-pulse scale-[1.04] translate-y-[-2px]'
              : 'scale-100 translate-y-0'
          }`}
        >
          <Image
            src="/images/interviewer.png"
            alt="Real Corporate Technical Interviewer"
            fill
            className="object-cover"
            priority
          />

          {/* Natural Eye Blinking Overlay */}
          {isBlinking && (
            <div className="absolute top-[37%] left-[34%] right-[34%] h-3 bg-[#3d2e24] opacity-90 blur-[0.5px] rounded-full pointer-events-none transition-all duration-100" />
          )}

          {/* Live Lip-Sync Mouth Movement Overlay when Speaking */}
          {isSpeaking && (
            <div
              className="absolute top-[54%] left-[45%] w-[10%] bg-[#5c1c24] rounded-full opacity-80 transition-all duration-100 blur-[0.3px] shadow-inner"
              style={{
                height: `${mouthOpen}px`,
                transform: `scaleY(${mouthOpen > 0 ? 1 : 0.2})`,
              }}
            >
              {/* Upper Teeth specular highlight */}
              {mouthOpen > 5 && (
                <div className="w-full h-[2px] bg-white opacity-90 rounded-t-sm" />
              )}
            </div>
          )}
        </div>

        {/* Studio Ambient Gradient & Lighting Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20 pointer-events-none" />

        {/* Dynamic Voice Equalizer Waves Overlay when Speaking */}
        {isSpeaking && (
          <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center space-x-1.5 px-4 pointer-events-none">
            {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
              <span
                key={bar}
                className="w-1.5 bg-indigo-400 rounded-full animate-bounce shadow-md"
                style={{
                  height: `${14 + (bar % 3) * 10}px`,
                  animationDuration: `${0.35 + (bar % 4) * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Live Status Indicator Overlay */}
        <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] font-semibold flex items-center justify-between text-white shadow-xl">
          <div className="flex items-center gap-2 truncate">
            {isSpeaking ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />
                <span className="text-indigo-300 font-bold truncate">Asking Technical Question...</span>
              </>
            ) : isThinking ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-amber-300 font-bold truncate">Evaluating Response...</span>
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
