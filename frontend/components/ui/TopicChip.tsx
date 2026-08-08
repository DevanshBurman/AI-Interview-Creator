import React from 'react';

export interface TopicChipProps {
  day: number;
  title: string;
  status?: 'passed' | 'skipped' | 'active' | 'strength' | 'gap';
  score?: number;
  onClick?: () => void;
  className?: string;
}

export const TopicChip: React.FC<TopicChipProps> = ({
  day,
  title,
  status = 'passed',
  score,
  onClick,
  className = '',
}) => {
  const statusStyles = {
    passed: 'bg-indigo-50/80 border-indigo-200 text-indigo-900 hover:border-indigo-400',
    skipped: 'bg-amber-50/80 border-amber-200 text-amber-900',
    active: 'bg-indigo-600 text-white border-indigo-600 shadow-md animate-pulse',
    strength: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    gap: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${statusStyles[status]} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
    >
      <span className="px-1.5 py-0.5 rounded-md bg-white/70 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-800 border border-slate-200/50">
        Day {day}
      </span>
      <span className="truncate max-w-[180px]">{title}</span>
      {score !== undefined && (
        <span className="ml-auto font-mono text-[11px] font-bold tabular-nums">
          {score}%
        </span>
      )}
    </div>
  );
};
