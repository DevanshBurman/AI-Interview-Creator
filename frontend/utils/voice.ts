'use client';

const FEMALE_VOICE_NAMES = [
  'samantha', 'karen', 'victoria', 'zira', 'siri', 'tessa',
  'moira', 'fiona', 'veena', 'female', 'google uk english female', 'google us english female'
];

const MALE_VOICE_NAMES = [
  'david', 'daniel', 'george', 'guy', 'james', 'alex',
  'aaron', 'arthur', 'fred', 'rishi', 'gordon', 'male',
  'google us english male', 'google uk english male', 'en-us-language'
];

function findBestMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  if (englishVoices.length === 0) return voices[0] || null;

  // 1. Explicit Male Name Match
  const explicitMale = englishVoices.find((v) => {
    const nameLower = v.name.toLowerCase();
    return MALE_VOICE_NAMES.some((m) => nameLower.includes(m));
  });
  if (explicitMale) return explicitMale;

  // 2. Filter out female voice names
  const nonFemale = englishVoices.find((v) => {
    const nameLower = v.name.toLowerCase();
    return !FEMALE_VOICE_NAMES.some((f) => nameLower.includes(f));
  });
  if (nonFemale) return nonFemale;

  return englishVoices[0];
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

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Deep Baritone Male Audio Settings for Mobile & Desktop
    utterance.pitch = 0.75; // Low pitch guarantees male voice frequency
    utterance.rate = 0.95;  // Clear, executive pacing

    const maleVoice = findBestMaleVoice();
    if (maleVoice) {
      utterance.voice = maleVoice;
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

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    doSpeak();
  } else {
    // Mobile browsers (iOS Safari / Chrome Android) populate voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    // Fallback trigger if onvoiceschanged doesn't fire immediately
    setTimeout(doSpeak, 150);
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
