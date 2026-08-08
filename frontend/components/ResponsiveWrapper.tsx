'use client';

import React, { useEffect, useState } from 'react';
import ThreeJSAvatar from './ThreeJSAvatar';
import RealHumanAvatar from './RealHumanAvatar';

export type ResponsiveWrapperProps = {
  isSpeaking?: boolean;
  isThinking?: boolean;
  candidateName?: string;
};

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  isSpeaking = false,
  isThinking = false,
  candidateName = 'Candidate',
}) => {
  const [canRender3D, setCanRender3D] = useState<boolean>(false);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    };

    const reducedMotion = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

    setCanRender3D(isDesktop && !reducedMotion && checkWebGL());
  }, []);

  if (canRender3D) {
    return (
      <ThreeJSAvatar
        isSpeaking={isSpeaking}
        isThinking={isThinking}
        candidateName={candidateName}
      />
    );
  }

  return (
    <RealHumanAvatar
      isSpeaking={isSpeaking}
      isThinking={isThinking}
      candidateName={candidateName}
    />
  );
};
