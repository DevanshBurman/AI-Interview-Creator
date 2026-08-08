import React, { useState } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-50 transition-all ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
