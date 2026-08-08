import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        aria-expanded={isOpen}
      >
        <div className="flex-1">{title}</div>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
            isOpen ? 'transform rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-slate-100 text-sm text-slate-700 leading-relaxed bg-slate-50/50 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};
