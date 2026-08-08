'use client';

import React, { useEffect, useRef } from 'react';

interface RealHumanAvatarProps {
  isSpeaking: boolean;
  isThinking: boolean;
  candidateName: string;
}

export default function RealHumanAvatar({ isSpeaking, isThinking, candidateName }: RealHumanAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let blinkTimer = 0;
    let isBlinking = false;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      time += 0.03;
      blinkTimer += 0.03;

      if (blinkTimer > 3.5) {
        isBlinking = true;
        if (blinkTimer > 3.7) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2 - 10;

      // Subtle head sway & tilt
      const headSwayX = Math.sin(time * 1.2) * 3;
      const headSwayY = Math.cos(time * 1.5) * 2;
      const headX = centerX + headSwayX;
      const headY = centerY + headSwayY;

      // 1. Studio Lighting Background Disc
      const studioGlow = ctx.createRadialGradient(headX, headY, 20, headX, headY, 140);
      studioGlow.addColorStop(0, 'rgba(241, 245, 249, 0.9)');
      studioGlow.addColorStop(0.7, 'rgba(226, 232, 240, 0.6)');
      studioGlow.addColorStop(1, 'rgba(203, 213, 225, 0.2)');

      ctx.fillStyle = studioGlow;
      ctx.beginPath();
      ctx.arc(headX, headY, 135, 0, Math.PI * 2);
      ctx.fill();

      // 2. Executive Suit & Shoulders
      ctx.fillStyle = '#1e293b'; // Charcoal executive suit jacket
      ctx.beginPath();
      ctx.ellipse(headX, headY + 115, 80, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // White Shirt Collar & Tie
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(headX - 22, headY + 75);
      ctx.lineTo(headX + 22, headY + 75);
      ctx.lineTo(headX, headY + 105);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4f46e5'; // Indigo silk tie
      ctx.beginPath();
      ctx.moveTo(headX - 6, headY + 78);
      ctx.lineTo(headX + 6, headY + 78);
      ctx.lineTo(headX + 8, headY + 115);
      ctx.lineTo(headX, headY + 125);
      ctx.lineTo(headX - 8, headY + 115);
      ctx.closePath();
      ctx.fill();

      // Neck
      const neckGrad = ctx.createLinearGradient(headX - 16, headY, headX + 16, headY);
      neckGrad.addColorStop(0, '#e2a87c');
      neckGrad.addColorStop(0.5, '#f5c9a5');
      neckGrad.addColorStop(1, '#d89b6e');
      ctx.fillStyle = neckGrad;
      ctx.fillRect(headX - 16, headY + 45, 32, 35);

      // 3. Human Head Mesh Base Shape
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 8;

      const headGrad = ctx.createRadialGradient(
        headX - 15,
        headY - 20,
        10,
        headX,
        headY,
        60
      );
      headGrad.addColorStop(0, '#ffe5d4');
      headGrad.addColorStop(0.6, '#f5c9a5');
      headGrad.addColorStop(1, '#df9e75');

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(headX, headY, 52, 65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ears
      ctx.fillStyle = '#e5a882';
      ctx.beginPath();
      ctx.ellipse(headX - 53, headY, 8, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(headX + 53, headY, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Professional Hair Style (Styled Dark Hair)
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.ellipse(headX, headY - 35, 54, 34, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Hair strands / volume
      ctx.beginPath();
      ctx.moveTo(headX - 54, headY - 25);
      ctx.quadraticCurveTo(headX - 30, headY - 65, headX + 10, headY - 62);
      ctx.quadraticCurveTo(headX + 45, headY - 55, headX + 54, headY - 25);
      ctx.lineTo(headX + 52, headY - 45);
      ctx.quadraticCurveTo(headX, headY - 70, headX - 52, headY - 45);
      ctx.closePath();
      ctx.fill();

      // 5. Eyebrows
      ctx.strokeStyle = '#2d241e';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';

      const browTilt = isThinking ? -0.1 : 0;
      // Left brow
      ctx.beginPath();
      ctx.moveTo(headX - 34, headY - 22 + browTilt * 10);
      ctx.quadraticCurveTo(headX - 22, headY - 26, headX - 10, headY - 21);
      ctx.stroke();

      // Right brow
      ctx.beginPath();
      ctx.moveTo(headX + 10, headY - 21);
      ctx.quadraticCurveTo(headX + 22, headY - 26, headX + 34, headY - 22 - browTilt * 10);
      ctx.stroke();

      // 6. Realistic 3D Human Eyes
      const eyeY = headY - 10;
      const eyeDistance = 22;

      [-1, 1].forEach((side) => {
        const eyeX = headX + side * eyeDistance;

        if (isBlinking) {
          // Eyelid Closed
          ctx.strokeStyle = '#5c3d2e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(eyeX - 10, eyeY);
          ctx.lineTo(eyeX + 10, eyeY);
          ctx.stroke();
        } else {
          // Eye Socket White
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY, 10, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Iris (Deep Hazel Blue)
          const pupilLookX = Math.sin(time * 0.8) * 1.5;
          const irisGrad = ctx.createRadialGradient(
            eyeX + pupilLookX,
            eyeY,
            1,
            eyeX + pupilLookX,
            eyeY,
            5
          );
          irisGrad.addColorStop(0, '#1e3a8a');
          irisGrad.addColorStop(0.7, '#2563eb');
          irisGrad.addColorStop(1, '#1d4ed8');

          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(eyeX + pupilLookX, eyeY, 5, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(eyeX + pupilLookX, eyeY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Catchlight Specular Reflection
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeX + pupilLookX - 1.5, eyeY - 1.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Nose
      ctx.strokeStyle = '#c98a60';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX, headY - 8);
      ctx.lineTo(headX, headY + 12);
      ctx.quadraticCurveTo(headX + 4, headY + 15, headX - 1, headY + 15);
      ctx.stroke();

      // 7. Dynamic Lip-Sync Mouth Animation
      const mouthY = headY + 34;

      // Calculate mouth opening aperture for lip-sync when speaking
      let mouthAperture = 2;
      if (isSpeaking) {
        mouthAperture = 4 + Math.abs(Math.sin(time * 14)) * 12;
      } else if (isThinking) {
        mouthAperture = 2;
      }

      // Inside Mouth cavity when open
      if (mouthAperture > 3) {
        ctx.fillStyle = '#6b1724';
        ctx.beginPath();
        ctx.ellipse(headX, mouthY + 2, 14, mouthAperture, 0, 0, Math.PI * 2);
        ctx.fill();

        // Upper Teeth
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX - 8, mouthY + 2 - mouthAperture + 1, 16, 3);
      }

      // Upper Lip
      ctx.fillStyle = '#d9777f';
      ctx.beginPath();
      ctx.moveTo(headX - 16, mouthY);
      ctx.quadraticCurveTo(headX - 8, mouthY - 3, headX, mouthY - 1);
      ctx.quadraticCurveTo(headX + 8, mouthY - 3, headX + 16, mouthY);
      ctx.quadraticCurveTo(headX, mouthY + 2, headX - 16, mouthY);
      ctx.fill();

      // Lower Lip
      ctx.fillStyle = '#c96870';
      ctx.beginPath();
      ctx.moveTo(headX - 15, mouthY + 1);
      ctx.quadraticCurveTo(headX, mouthY + mouthAperture + 4, headX + 15, mouthY + 1);
      ctx.quadraticCurveTo(headX, mouthY + 2, headX - 15, mouthY + 1);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isThinking]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      {/* Real 3D Human Avatar Canvas */}
      <div className="relative w-full aspect-square max-w-[290px] flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live Speaking Status Pill */}
        <div className="absolute bottom-1 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-semibold flex items-center gap-2 shadow-lg text-white">
          {isSpeaking ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-indigo-300">Speaking Question...</span>
            </>
          ) : isThinking ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300">Evaluating Answer...</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-200">Listening to {candidateName.split(' ')[0]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
