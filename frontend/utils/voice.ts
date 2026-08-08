'use client';

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

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Executive Male Voice Audio Settings
  utterance.pitch = 0.85; // Deeper, confident male pitch across all mobile/desktop devices
  utterance.rate = 0.95;  // Clear, articulate pacing

  const selectMaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Comprehensive Mobile & Desktop English Male Voices Search
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
            v.name.includes('Aaron') ||
            v.name.includes('Arthur') ||
            v.name.includes('Fred') ||
            v.name.includes('Rishi') ||
            v.name.includes('Google US English Male') ||
            v.name.includes('Google UK English Male') ||
            v.name.toLowerCase().includes('male'))
      ) ||
      voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Samantha') && !v.name.includes('Victoria') && !v.name.includes('Karen') && !v.name.includes('Zira') && !v.name.includes('Siri Female')) ||
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
