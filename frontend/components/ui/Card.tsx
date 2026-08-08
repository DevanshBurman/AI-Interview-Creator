import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'elevated' | 'glass' | 'dark-immersive' | 'interactive';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'standard',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    standard: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl transition-colors duration-300',
    elevated: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md rounded-2xl transition-colors duration-300',
    glass: 'glass-panel rounded-2xl',
    'dark-immersive': 'bg-slate-950 border border-slate-800 text-white rounded-2xl shadow-xl',
    interactive:
      'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/50 card-3d-hover cursor-pointer rounded-2xl transition-all duration-300',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
