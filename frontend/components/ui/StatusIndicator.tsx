import React from 'react';
import { Wifi, Radio, Mic, Sparkles } from 'lucide-react';

export interface StatusIndicatorProps {
  type: 'connected' | 'interview' | 'speaking' | 'thinking' | 'recording';
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  label,
  className = '',
}) => {
  const configs = {
    connected: {
      bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dotColor: 'bg-emerald-500',
      icon: <Wifi className="w-3.5 h-3.5" />,
      defaultText: 'API Connected',
      pulse: true,
    },
    interview: {
      bgColor: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      dotColor: 'bg-indigo-600',
      icon: <Radio className="w-3.5 h-3.5" />,
      defaultText: 'Live Interview Active',
      pulse: true,
    },
    speaking: {
      bgColor: 'bg-indigo-100 border-indigo-300 text-indigo-900',
      dotColor: 'bg-indigo-600',
      icon: <Radio className="w-3.5 h-3.5 animate-pulse" />,
      defaultText: 'Interviewer Speaking',
      pulse: true,
    },
    thinking: {
      bgColor: 'bg-amber-50 border-amber-200 text-amber-800',
      dotColor: 'bg-amber-500',
      icon: <Sparkles className="w-3.5 h-3.5 animate-spin" />,
      defaultText: 'Evaluating Response',
      pulse: true,
    },
    recording: {
      bgColor: 'bg-rose-50 border-rose-200 text-rose-700',
      dotColor: 'bg-rose-600',
      icon: <Mic className="w-3.5 h-3.5 animate-bounce" />,
      defaultText: 'Voice Recording',
      pulse: true,
    },
  };

  const config = configs[type];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${config.bgColor} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} ${config.pulse ? 'animate-pulse' : ''}`} />
      {config.icon}
      <span>{label || config.defaultText}</span>
    </div>
  );
};
