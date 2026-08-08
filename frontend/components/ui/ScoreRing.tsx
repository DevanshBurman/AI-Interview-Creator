import React from 'react';

export interface ScoreRingProps {
  score: number; // 0-100
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  label,
  size = 150,
  strokeWidth = 12,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10B981'; // Emerald
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let badgeText = 'Strong';

  if (score < 55) {
    strokeColor = '#F59E0B'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
    badgeText = 'Developing';
  } else if (score < 80) {
    strokeColor = '#6366F1'; // Violet/Indigo
    glowColor = 'rgba(99, 102, 241, 0.4)';
    badgeText = 'Interview Ready';
  }

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      {/* Halo Glow Disc */}
      <div
        className="absolute rounded-full blur-xl transition-all duration-700 opacity-60"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          backgroundColor: strokeColor,
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>

      {/* Center Score Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
        <span className="text-4xl font-extrabold text-white tabular-nums tracking-tight drop-shadow-md">
          {score}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 mt-0.5">
          {label || badgeText}
        </span>
      </div>
    </div>
  );
};
