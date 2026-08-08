'use client';

const IOS_ANDROID_MALE_NAMES = [
  'daniel', 'fred', 'arthur', 'aaron', 'gordon', 'rishi', 'nicky',
  'david', 'guy', 'george', 'james', 'alex', 'male',
  'google us english male', 'google uk english male'
];

const FEMALE_NAMES = [
  'samantha', 'karen', 'victoria', 'zira', 'siri', 'tessa',
  'moira', 'fiona', 'veena', 'female'
];

function getMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Explicit Male Voice Match (iOS Daniel/Fred/Arthur, Windows David/Guy, Android Male)
  const maleMatch = voices.find((v) => {
    const nameLower = v.name.toLowerCase();
    return IOS_ANDROID_MALE_NAMES.some((m) => nameLower.includes(m));
  });
  if (maleMatch) return maleMatch;

  // 2. Any English voice that is NOT female
  const nonFemale = voices.find((v) => {
    const nameLower = v.name.toLowerCase();
    return v.lang.startsWith('en') && !FEMALE_NAMES.some((f) => nameLower.includes(f));
  });
  if (nonFemale) return nonFemale;

  return null;
}

/**
 * Text-to-Speech (TTS) helper configured for a Male Executive Technical Voice across Desktop & Mobile.
 */
export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  muted: boolean = false
) {
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onStart) onStart();
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 4000);
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  let hasSpoken = false;

  const doSpeak = (voice: SpeechSynthesisVoice | null) => {
    if (hasSpoken) return;
    hasSpoken = true;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Deep Baritone Male Pitch & Executive Pacing
    utterance.pitch = 0.75;
    utterance.rate = 0.95;

    if (voice) {
      utterance.voice = voice;
    }

    let hasEnded = false;
    const finish = () => {
      if (!hasEnded) {
        hasEnded = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);

    // Safety Timeout: Auto-finish after text duration so UI NEVER freezes
    const durationMs = Math.min(9000, Math.max(3500, text.length * 75));
    setTimeout(finish, durationMs);
  };

  // Check for male voice with retries to handle iOS Safari async voice hydration
  const attemptVoiceSelection = (retriesLeft: number) => {
    const maleVoice = getMaleVoice();

    // If male voice found or no retries left, speak now
    if (maleVoice || retriesLeft <= 0) {
      doSpeak(maleVoice);
      return;
    }

    // iOS Safari returns Samantha first before loading Daniel/Fred/Arthur 150ms later
    setTimeout(() => attemptVoiceSelection(retriesLeft - 1), 150);
  };

  // Pre-trigger voice loading on mobile devices
  window.speechSynthesis.getVoices();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      const voice = getMaleVoice();
      if (voice) doSpeak(voice);
    };
  }

  attemptVoiceSelection(3);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
