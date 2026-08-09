import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Candidate Data Available',
  description = 'Unable to load technical cohort candidate profiles. Please check backend connection.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto shadow-sm ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Reload Profiles
        </Button>
      )}
    </div>
  );
};
