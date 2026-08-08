'use client';

import React, { useEffect, useRef } from 'react';

interface ThreeDAvatarProps {
  isSpeaking: boolean;
  isThinking: boolean;
  candidateName: string;
}

export default function ThreeDAvatar({ isSpeaking, isThinking, candidateName }: ThreeDAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle orbits for 3D sphere hologram
    const particlesCount = 45;
    const particles = Array.from({ length: particlesCount }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi: Math.random() * Math.PI,
      radius: 75 + Math.random() * 25,
      speed: 0.008 + Math.random() * 0.012,
      size: 1.5 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#6366f1' : '#a855f7'
    }));

    const render = () => {
      time += isSpeaking ? 0.04 : isThinking ? 0.06 : 0.02;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 1. Outer Glow Aura
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        30,
        centerX,
        centerY,
        140
      );

      if (isSpeaking) {
        auraGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
        auraGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
        auraGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (isThinking) {
        auraGradient.addColorStop(0, 'rgba(236, 72, 153, 0.35)');
        auraGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
        auraGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        auraGradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        auraGradient.addColorStop(0.6, 'rgba(79, 70, 229, 0.1)');
        auraGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }

      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 140, 0, Math.PI * 2);
      ctx.fill();

      // 2. Speaking Pulsing Rings
      if (isSpeaking) {
        for (let r = 1; r <= 3; r++) {
          const pulseRadius = 85 + ((time * 40 * r) % 55);
          const alpha = 1 - (pulseRadius - 85) / 55;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 3. Central 3D Hologram Sphere Core
      const corePulse = isSpeaking
        ? Math.sin(time * 6) * 6
        : isThinking
        ? Math.sin(time * 8) * 4
        : Math.sin(time * 2) * 2;

      const baseRadius = 68 + corePulse;

      const coreGradient = ctx.createRadialGradient(
        centerX - baseRadius * 0.3,
        centerY - baseRadius * 0.3,
        5,
        centerX,
        centerY,
        baseRadius
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.2, '#818cf8');
      coreGradient.addColorStop(0.6, '#4f46e5');
      coreGradient.addColorStop(1, '#0f172a');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // 4. 3D Wireframe Orbit Rings
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * (0.4 + i * 0.2) * (i % 2 === 0 ? 1 : -1));

        ctx.strokeStyle = i === 0 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(129, 140, 248, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius + 15 + i * 10, (baseRadius + 15 + i * 10) * 0.35, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // 5. Orbiting 3D Particles
      particles.forEach((p) => {
        p.theta += p.speed * (isSpeaking ? 1.8 : 1.0);
        p.phi += p.speed * 0.5;

        const x = centerX + p.radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y = centerY + (p.radius * Math.cos(p.phi) * 0.4) + Math.sin(p.theta) * 15;
        const zScale = (Math.sin(p.phi) * Math.sin(p.theta) + 1) / 2;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.3 + zScale * 0.7;
        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.6 + zScale * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isThinking]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* 3D Hologram Avatar Canvas */}
      <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating Status Badge */}
        <div className="absolute bottom-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur text-[11px] font-semibold flex items-center gap-2 shadow-lg">
          {isSpeaking ? (
            <>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-indigo-300">Speaking Question...</span>
            </>
          ) : isThinking ? (
            <>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-300">Analyzing Answer...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Listening to {candidateName.split(' ')[0]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
