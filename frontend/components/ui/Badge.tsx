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
    neutral: 'bg-slate-100 border-slate-200 text-slate-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error: 'bg-rose-50 border-rose-200 text-rose-700',
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
