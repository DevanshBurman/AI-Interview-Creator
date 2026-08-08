import React from 'react';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';

type InterviewPlanProps = {
  totalQuestions?: number;
  totalDays?: number;
  topics?: string[];
  progress?: number; // 0-100
};

export const InterviewPlan: React.FC<InterviewPlanProps> = ({ totalQuestions = 8, totalDays = 4, topics = [], progress = 0 }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2 text-slate-900">Interview Plan</h3>
      <p className="text-sm text-slate-600 mb-4">{totalQuestions} questions over {totalDays} curriculum days</p>
      {topics.length > 0 && (
        <ul className="space-y-1 mb-4">
          {topics.map((t, i) => (
            <li key={i} className="text-xs text-slate-700">• {t}</li>
          ))}
        </ul>
      )}
      <ProgressBar value={progress} />
    </Card>
  );
};
