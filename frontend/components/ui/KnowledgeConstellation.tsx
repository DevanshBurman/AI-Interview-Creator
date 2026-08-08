import React, { useState } from 'react';
import { TopicBreakdown } from '../../types/interview';

export interface KnowledgeConstellationProps {
  topics: TopicBreakdown[];
  className?: string;
}

export const KnowledgeConstellation: React.FC<KnowledgeConstellationProps> = ({
  topics,
  className = '',
}) => {
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);

  if (!topics || topics.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        No topic constellation nodes recorded.
      </div>
    );
  }

  // Calculate coordinates for nodes in a clean radial layout
  const width = 560;
  const height = 280;
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = 190;
  const radiusY = 95;

  const nodeCoords = topics.map((topic, i) => {
    const angle = (i / topics.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    return { ...topic, x, y };
  });

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/80 p-5 shadow-2xl ${className}`}>
      {/* Background Star Particle Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none studio-ambient-glow" />

      <div className="flex items-center justify-between mb-2 px-2 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
            3D Interactive Knowledge Constellation
          </span>
        </div>
        <span className="text-[11px] font-mono text-indigo-300">
          {topics.length} Assessed Nodes
        </span>
      </div>

      <div className="relative w-full h-[270px] flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Ambient Glow Center */}
          <circle cx={centerX} cy={centerY} r="120" fill="url(#centerGlow3D)" opacity="0.35" />

          <defs>
            <radialGradient id="centerGlow3D" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0B0F19" stopOpacity="0" />
            </radialGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Peripheral Connection Beams */}
          {nodeCoords.map((node, idx) => {
            const nextNode = nodeCoords[(idx + 1) % nodeCoords.length];
            return (
              <line
                key={`line-${idx}`}
                x1={node.x}
                y1={node.y}
                x2={nextNode.x}
                y2={nextNode.y}
                stroke="rgba(129, 140, 248, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />
            );
          })}

          {/* Radial Hub Rays */}
          {nodeCoords.map((node, idx) => (
            <line
              key={`hub-line-${idx}`}
              x1={centerX}
              y1={centerY}
              x2={node.x}
              y2={node.y}
              stroke="rgba(99, 102, 241, 0.3)"
              strokeWidth="1.2"
            />
          ))}

          {/* 3D Core Intelligence Hub */}
          <circle cx={centerX} cy={centerY} r="18" fill="#4F46E5" opacity="0.4" />
          <circle cx={centerX} cy={centerY} r="8" fill="#818CF8" filter="url(#glowEffect)" />
          <circle cx={centerX} cy={centerY} r="3" fill="#FFFFFF" />

          {/* Topic Constellation Nodes */}
          {nodeCoords.map((node, idx) => {
            const isHigh = node.score >= 70;
            const isMedium = node.score >= 45 && node.score < 70;
            const nodeColor = isHigh ? '#34D399' : isMedium ? '#FBBF24' : '#F87171';
            const isActive = activeNodeIndex === idx;

            return (
              <g
                key={`node-${idx}`}
                className="cursor-pointer transition-transform duration-300"
                onMouseEnter={() => setActiveNodeIndex(idx)}
                onMouseLeave={() => setActiveNodeIndex(null)}
                tabIndex={0}
                role="button"
                aria-label={`Topic node Day ${node.day}: ${node.title}, Score ${node.score}%`}
              >
                {/* 3D Pulsing Outer Aura */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isActive ? 24 : 17}
                  fill={nodeColor}
                  opacity={isActive ? '0.4' : '0.18'}
                  className="transition-all duration-300"
                />

                {/* Solid Node Core with Glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isActive ? 13 : 9.5}
                  fill={nodeColor}
                  stroke="#0B0F19"
                  strokeWidth="2.5"
                  filter={isActive ? 'url(#glowEffect)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Day Tag Label */}
                <text
                  x={node.x}
                  y={node.y > centerY ? node.y + 22 : node.y - 14}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontWeight="700"
                >
                  Day {node.day}
                </text>

                {/* Tabular Score */}
                <text
                  x={node.x}
                  y={node.y > centerY ? node.y + 33 : node.y - 2}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {node.score}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Focus Interactive Tooltip Card */}
        {activeNodeIndex !== null && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-indigo-500/50 backdrop-blur-md shadow-2xl text-center text-xs text-white max-w-sm pointer-events-none z-20 animate-fadeIn">
            <p className="font-extrabold text-indigo-300">
              Day {topics[activeNodeIndex].day}: {topics[activeNodeIndex].title}
            </p>
            <p className="text-[11px] text-slate-300 mt-1 leading-normal">
              Score: <span className="font-mono font-bold text-emerald-400">{topics[activeNodeIndex].score}%</span> &bull; {topics[activeNodeIndex].evidence}
            </p>
          </div>
        )}
      </div>

      {/* Accessible Text Summary Fallback */}
      <div className="sr-only">
        <h4>Assessed Topics Summary</h4>
        <ul>
          {topics.map((t) => (
            <li key={t.day}>
              Day {t.day}: {t.title} - Score {t.score}% ({t.evidence})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
