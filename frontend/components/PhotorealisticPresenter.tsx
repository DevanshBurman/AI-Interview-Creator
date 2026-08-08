'use client';

import React, { useEffect, useRef } from 'react';
import { Volume2, Radio } from 'lucide-react';

interface PhotorealisticPresenterProps {
  isSpeaking: boolean;
  isThinking: boolean;
  candidateName: string;
}

export default function PhotorealisticPresenter({
  isSpeaking,
  isThinking,
  candidateName,
}: PhotorealisticPresenterProps) {
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

    // Continuous 60FPS Animation Loop (Never Freezes)
    const render = () => {
      time += 0.035;
      blinkTimer += 0.035;

      if (blinkTimer > 3.2) {
        isBlinking = true;
        if (blinkTimer > 3.4) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2 - 5;

      // Subtle natural breathing & head sway
      const headSwayX = Math.sin(time * 1.4) * 3;
      const headSwayY = Math.cos(time * 1.8) * 2;
      const headX = centerX + headSwayX;
      const headY = centerY + headSwayY;

      // 1. Studio Lighting Background Disc
      const studioGlow = ctx.createRadialGradient(headX, headY, 20, headX, headY, 140);
      studioGlow.addColorStop(0, 'rgba(248, 250, 252, 1)');
      studioGlow.addColorStop(0.7, 'rgba(241, 245, 249, 0.8)');
      studioGlow.addColorStop(1, 'rgba(226, 232, 240, 0.3)');

      ctx.fillStyle = studioGlow;
      ctx.beginPath();
      ctx.arc(headX, headY, 135, 0, Math.PI * 2);
      ctx.fill();

      // 2. Executive Corporate Suit & Shoulders
      ctx.fillStyle = '#0f172a'; // Deep charcoal suit
      ctx.beginPath();
      ctx.ellipse(headX, headY + 115, 82, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // White Shirt Collar
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(headX - 24, headY + 74);
      ctx.lineTo(headX + 24, headY + 74);
      ctx.lineTo(headX, headY + 106);
      ctx.closePath();
      ctx.fill();

      // Indigo Tie
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.moveTo(headX - 6, headY + 76);
      ctx.lineTo(headX + 6, headY + 76);
      ctx.lineTo(headX + 8, headY + 116);
      ctx.lineTo(headX, headY + 126);
      ctx.lineTo(headX - 8, headY + 116);
      ctx.closePath();
      ctx.fill();

      // Neck
      const neckGrad = ctx.createLinearGradient(headX - 16, headY, headX + 16, headY);
      neckGrad.addColorStop(0, '#df9b6e');
      neckGrad.addColorStop(0.5, '#f5c9a5');
      neckGrad.addColorStop(1, '#d89467');
      ctx.fillStyle = neckGrad;
      ctx.fillRect(headX - 16, headY + 45, 32, 35);

      // 3. Human Head Mesh
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;

      const headGrad = ctx.createRadialGradient(
        headX - 15,
        headY - 20,
        10,
        headX,
        headY,
        60
      );
      headGrad.addColorStop(0, '#ffe4d6');
      headGrad.addColorStop(0.6, '#f5c9a5');
      headGrad.addColorStop(1, '#de9c73');

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(headX, headY, 53, 66, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ears
      ctx.fillStyle = '#e4a57f';
      ctx.beginPath();
      ctx.ellipse(headX - 54, headY, 8, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(headX + 54, headY, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Hair Style
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.ellipse(headX, headY - 36, 55, 35, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(headX - 55, headY - 25);
      ctx.quadraticCurveTo(headX - 30, headY - 66, headX + 10, headY - 63);
      ctx.quadraticCurveTo(headX + 45, headY - 56, headX + 55, headY - 25);
      ctx.lineTo(headX + 53, headY - 46);
      ctx.quadraticCurveTo(headX, headY - 72, headX - 53, headY - 46);
      ctx.closePath();
      ctx.fill();

      // 5. Eyebrows
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';

      const browTilt = isThinking ? -0.08 : 0;
      ctx.beginPath();
      ctx.moveTo(headX - 34, headY - 22 + browTilt * 10);
      ctx.quadraticCurveTo(headX - 22, headY - 26, headX - 10, headY - 21);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headX + 10, headY - 21);
      ctx.quadraticCurveTo(headX + 22, headY - 26, headX + 34, headY - 22 - browTilt * 10);
      ctx.stroke();

      // 6. Realistic Eyes
      const eyeY = headY - 10;
      const eyeDistance = 22;

      [-1, 1].forEach((side) => {
        const eyeX = headX + side * eyeDistance;

        if (isBlinking) {
          ctx.strokeStyle = '#573a2e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(eyeX - 10, eyeY);
          ctx.lineTo(eyeX + 10, eyeY);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY, 10, 6, 0, 0, Math.PI * 2);
          ctx.fill();

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

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(eyeX + pupilLookX, eyeY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeX + pupilLookX - 1.5, eyeY - 1.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Nose
      ctx.strokeStyle = '#c8885f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX, headY - 8);
      ctx.lineTo(headX, headY + 12);
      ctx.quadraticCurveTo(headX + 4, headY + 15, headX - 1, headY + 15);
      ctx.stroke();

      // 7. Dynamic Lip-Sync Mouth
      const mouthY = headY + 34;

      let mouthAperture = 2;
      if (isSpeaking) {
        mouthAperture = 4 + Math.abs(Math.sin(time * 16)) * 12;
      } else if (isThinking) {
        mouthAperture = 2;
      }

      if (mouthAperture > 3) {
        ctx.fillStyle = '#631622';
        ctx.beginPath();
        ctx.ellipse(headX, mouthY + 2, 14, mouthAperture, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX - 8, mouthY + 2 - mouthAperture + 1, 16, 3);
      }

      ctx.fillStyle = '#d6757d';
      ctx.beginPath();
      ctx.moveTo(headX - 16, mouthY);
      ctx.quadraticCurveTo(headX - 8, mouthY - 3, headX, mouthY - 1);
      ctx.quadraticCurveTo(headX + 8, mouthY - 3, headX + 16, mouthY);
      ctx.quadraticCurveTo(headX, mouthY + 2, headX - 16, mouthY);
      ctx.fill();

      ctx.fillStyle = '#c7666e';
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
      <div className="relative w-full aspect-square max-w-[290px] flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live Status Overlay */}
        <div className="absolute bottom-1 px-3 py-1.5 rounded-full bg-slate-950/90 border border-slate-800 text-[11px] font-semibold flex items-center gap-2 shadow-lg text-white">
          {isSpeaking ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />
              <span className="text-indigo-300 font-bold">Asking Question...</span>
            </>
          ) : isThinking ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <span className="text-amber-300 font-bold">Evaluating Answer...</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-slate-200">Listening to {candidateName.split(' ')[0]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
