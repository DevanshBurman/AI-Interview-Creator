import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2 shadow-sm hover:-translate-y-0.5 active:translate-y-0',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 shadow-md hover:-translate-y-0.5 active:translate-y-0',
  };

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-md',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20',
    outline:
      'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900',
    destructive:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
    'icon-only':
      'p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
