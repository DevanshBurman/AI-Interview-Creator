import React from 'react';
import { Brand } from './Brand';
import { Sparkles, Sun, Moon } from 'lucide-react';

export const Header: React.FC<{
  onChangeCandidate?: () => void;
  activeStep?: 'select' | 'interview' | 'results';
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}> = ({ onChangeCandidate, activeStep = 'select', darkMode = false, onToggleDarkMode }) => (
  <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Brand Lockup */}
      <div
        className="flex items-center space-x-3 cursor-pointer group"
        onClick={onChangeCandidate}
      >
        <Brand size={36} className="group-hover:scale-105 transition-transform" />
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg">
              ABTalks
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
              AI Cohort Interviewer
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Technical interviews built from your learning journey
          </p>
        </div>
      </div>

      {/* Header Right Status & Dark Mode Switcher */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Adaptive 3D Engine</span>
        </div>

        {/* Theme Toggle Button */}
        {onToggleDarkMode && (
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-sm flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        )}

        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">System</span> Ready
        </div>
      </div>
    </div>
  </header>
);
