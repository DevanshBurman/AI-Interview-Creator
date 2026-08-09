import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'indigo' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  const variantStyles = {
    neutral: 'bg-slate-100 dark:bg-[#251B42] border-slate-200 dark:border-[#9D4EDD]/40 text-slate-700 dark:text-[#E9D5FF]',
    indigo: 'bg-indigo-50 dark:bg-[#9D4EDD]/25 border-indigo-200 dark:border-[#9D4EDD]/40 text-indigo-700 dark:text-[#E9D5FF]',
    success: 'bg-emerald-50 dark:bg-[#00C2A8]/20 border-emerald-200 dark:border-[#00C2A8]/40 text-emerald-700 dark:text-[#5EEAD4]',
    warning: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-200',
    error: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
