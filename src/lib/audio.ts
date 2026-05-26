class AudioManager {
  private _ctx: AudioContext | null = null;
  soundEnabled = true;
  musicEnabled = true;
  private _bgmPlaying = false;

  private ctx(): AudioContext {
    if (!this._ctx) this._ctx = new AudioContext();
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal = 0.25,
    startFreq?: number,
  ) {
    if (!this.soundEnabled) return;
    try {
      const c = this.ctx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      const now = c.currentTime;
      if (startFreq !== undefined) {
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.linearRampToValueAtTime(freq, now + duration);
      } else {
        osc.frequency.setValueAtTime(freq, now);
      }
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  playTick() {
    this.tone(1200, 0.06, 'square', 0.12);
  }

  playFinalTick() {
    this.tone(1600, 0.08, 'square', 0.18);
  }

  playCorrect() {
    this.tone(660, 0.15, 'sine', 0.3, 440);
    setTimeout(() => this.tone(880, 0.2, 'sine', 0.25), 130);
  }

  playWrong() {
    this.tone(300, 0.25, 'sawtooth', 0.2, 440);
  }

  playScore(big = false) {
    if (big) {
      [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => this.tone(f, 0.15, 'sine', 0.25), i * 80),
      );
    } else {
      this.tone(523, 0.1, 'sine', 0.2);
      setTimeout(() => this.tone(659, 0.12, 'sine', 0.2), 90);
    }
  }

  playSabotage() {
    this.tone(80, 0.4, 'sawtooth', 0.3, 400);
    setTimeout(() => this.tone(60, 0.3, 'sawtooth', 0.2), 300);
  }

  playWinner() {
    const fanfare = [523, 659, 784, 659, 1047];
    fanfare.forEach((f, i) => setTimeout(() => this.tone(f, 0.18, 'sine', 0.3), i * 110));
  }

  playCountdown() {
    this.tone(880, 0.12, 'sine', 0.3);
  }

  playCountdownGo() {
    this.tone(1174, 0.25, 'sine', 0.4);
    setTimeout(() => this.tone(1568, 0.3, 'sine', 0.35), 200);
  }

  speakHost(text: string) {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ar-SA';
      utter.rate = 1.05;
      utter.pitch = 1.05;
      utter.volume = 0.8;
      window.speechSynthesis.speak(utter);
    } catch {}
  }

  stopSpeech() {
    try { window.speechSynthesis?.cancel(); } catch {}
  }

  // Minimal BGM: a quiet ambient pulse
  startBGM(intensity: 'low' | 'mid' | 'high' = 'low') {
    if (!this.musicEnabled || this._bgmPlaying) return;
    this._bgmPlaying = true;
    const freqMap = { low: 110, mid: 130, high: 155 };
    const _loop = () => {
      if (!this._bgmPlaying || !this.musicEnabled) return;
      this.tone(freqMap[intensity], 0.6, 'sine', 0.04);
      setTimeout(_loop, 1800);
    };
    setTimeout(_loop, 0);
  }

  stopBGM() {
    this._bgmPlaying = false;
  }

  setSound(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) this.stopSpeech();
  }

  setMusic(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) this.stopBGM();
  }
}

export const audio = new AudioManager();
