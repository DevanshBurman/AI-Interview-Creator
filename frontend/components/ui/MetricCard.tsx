import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  descriptor?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  descriptor,
  icon,
  trend,
  trendType = 'positive',
  className = '',
}) => {
  const trendColors = {
    positive: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-700',
    negative: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-700',
    neutral: 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };

  return (
    <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">{label}</span>
        {icon && <div className="text-slate-400 dark:text-slate-300">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{value}</span>
        {trend && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${trendColors[trendType]}`}>
            {trend}
          </span>
        )}
      </div>
      {descriptor && <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-1">{descriptor}</p>}
    </div>
  );
};
