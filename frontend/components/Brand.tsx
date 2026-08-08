import React from 'react';

export const Brand: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 32 }) => (
  <div
    className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md ${className}`}
    style={{ width: size, height: size }}
  >
    <svg
      width={size * 0.7}
      height={size * 0.7}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Conversation Frame */}
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="3"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Document Lines */}
      <path
        d="M7 8H14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 12H11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* AI Intelligence Spark */}
      <path
        d="M17 10L18.2 12.5L20.7 13.7L18.2 14.9L17 17.4L15.8 14.9L13.3 13.7L15.8 12.5L17 10Z"
        fill="#A5B4FC"
      />
    </svg>
  </div>
);
