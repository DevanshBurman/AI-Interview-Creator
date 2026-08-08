'use client';

const IOS_ANDROID_MALE_NAMES = [
  'male', 'google uk english male', 'google us english male',
  'daniel', 'fred', 'arthur', 'aaron', 'gordon', 'rishi', 'nicky',
  'david', 'guy', 'george', 'james', 'alex'
];

const FEMALE_NAMES = [
  'samantha', 'karen', 'victoria', 'zira', 'siri', 'tessa',
  'moira', 'fiona', 'veena', 'female', 'google us english', 'google uk english'
];

function getMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

  // 1. Explicit Male Match (Name contains male keywords)
  const explicitMale = englishVoices.find((v) => {
    const nameLower = v.name.toLowerCase();
    return IOS_ANDROID_MALE_NAMES.some((m) => nameLower.includes(m));
  });
  if (explicitMale) return explicitMale;

  // 2. Strict Filter out Female voices on Android (Google US English default is female)
  const strictlyMaleOrNonFemale = englishVoices.find((v) => {
    const nameLower = v.name.toLowerCase();
    const isFemale = FEMALE_NAMES.some((f) => nameLower.includes(f));
    return !isFemale;
  });
  if (strictlyMaleOrNonFemale) return strictlyMaleOrNonFemale;

  return englishVoices[0] || null;
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
    
    // Deep Baritone Male Pitch (0.55 guarantees male frequency on Android Google TTS Engine)
    const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    utterance.pitch = isMobile ? 0.55 : 0.85; 
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

  // Check for male voice with retries to handle Android / iOS async voice hydration
  const attemptVoiceSelection = (retriesLeft: number) => {
    const maleVoice = getMaleVoice();

    if (maleVoice || retriesLeft <= 0) {
      doSpeak(maleVoice);
      return;
    }

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
