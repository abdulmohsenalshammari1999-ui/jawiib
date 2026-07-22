/**
 * Mystery voice narration — Web Speech API, Arabic TTS.
 * Four character voices simulated via rate/pitch variation.
 * Degrades gracefully when Arabic voices are unavailable.
 */

export type VoiceCharacter = 'narrator' | 'detective' | 'witness' | 'court';

const CHAR: Record<VoiceCharacter, { rate: number; pitch: number }> = {
  narrator:  { rate: 0.78, pitch: 0.88 }, // slow, atmospheric — scene-setting
  detective: { rate: 0.90, pitch: 1.00 }, // clear, authoritative — clue reveals
  witness:   { rate: 1.02, pitch: 1.18 }, // nervous, fast — witness testimony
  court:     { rate: 0.72, pitch: 0.78 }, // formal, deliberate — verdict & accusation
};

let _arabicVoice: SpeechSynthesisVoice | null | undefined = undefined; // undefined = not yet looked up

function getArabicVoice(): SpeechSynthesisVoice | null {
  if (_arabicVoice !== undefined) return _arabicVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    _arabicVoice = null;
    return null;
  }
  const all = window.speechSynthesis.getVoices();
  _arabicVoice =
    all.find((v) => v.lang === 'ar-SA') ??
    all.find((v) => v.lang.startsWith('ar')) ??
    null;
  return _arabicVoice;
}

// Re-resolve voices once they load asynchronously (Chrome fires this event)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    _arabicVoice = undefined; // reset so next call re-resolves
  });
}

export function narrateAr(text: string, char: VoiceCharacter = 'narrator'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ar-SA';
  const cfg = CHAR[char];
  utter.rate  = cfg.rate;
  utter.pitch = cfg.pitch;
  const voice = getArabicVoice();
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

export function stopNarration(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ── Pre-baked narration lines ─────────────────────────────────────────────────

export const LINES = {
  intro:        (crime: string) => `انتبهوا جميعاً! ${crime}`,
  boardStart:   (team: string) => `دور فريق ${team}، اختر دليلك بعناية`,
  clueRevealed: (clue: string) => `دليل جديد! ${clue}`,
  wrongAnswer:  () => `إجابة خاطئة! ينتقل الدور للفريق الآخر`,
  rightAnswer:  () => `إجابة صحيحة! تم الكشف عن دليل`,
  canAccuse:    () => `تم كشف ستة أدلة! يمكنكم الآن الاتهام`,
  accusing:     (team: string) => `فريق ${team} يتقدم بالاتهام`,
  wrongAccuse:  (team: string) => `الاتهام خاطئ! هذا الشخص بريء. فريق ${team} خسر حق الاتهام`,
  verdict:      (suspect: string, location: string, method: string) =>
    `القضية حُلّت! الفاعل هو ${suspect}، في ${location}، بأسلوب ${method}`,
  noSolve:      () => `لم تُحل القضية! الفاعل لا يزال طليقاً`,
} as const;
