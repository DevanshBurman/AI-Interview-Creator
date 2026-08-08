'use client';

/**
 * Text-to-Speech (TTS) helper configured for a Male Executive Technical Voice.
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

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Executive Male Voice Audio Settings
  utterance.pitch = 0.92; // Deep, confident male pitch
  utterance.rate = 0.95;  // Clear, articulate pacing

  const selectMaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Search for preferred English Male Voices
    const maleVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('David') ||
            v.name.includes('Daniel') ||
            v.name.includes('George') ||
            v.name.includes('Guy') ||
            v.name.includes('James') ||
            v.name.includes('Alex') ||
            v.name.toLowerCase().includes('male'))
      ) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (maleVoice) {
      utterance.voice = maleVoice;
    }
  };

  selectMaleVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = selectMaleVoice;
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
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
