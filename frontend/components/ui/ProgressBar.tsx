import React from 'react';

export interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showValueText?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'slate';
  height?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showValueText = false,
  color = 'indigo',
  height = 'h-2.5',
  className = '',
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  const colorStyles = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-900',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showValueText) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
          {label && <span>{label}</span>}
          {showValueText && <span className="tabular-nums font-mono">{normalizedValue}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 ${height} rounded-full overflow-hidden border border-slate-200`}>
        <div
          className={`${colorStyles[color]} h-full transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${normalizedValue}%` }}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
