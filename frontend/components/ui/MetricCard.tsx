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
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    negative: 'text-rose-700 bg-rose-50 border-rose-200',
    neutral: 'text-slate-700 bg-slate-100 border-slate-200',
  };

  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{value}</span>
        {trend && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${trendColors[trendType]}`}>
            {trend}
          </span>
        )}
      </div>
      {descriptor && <p className="text-[11px] text-slate-500 mt-1">{descriptor}</p>}
    </div>
  );
};
