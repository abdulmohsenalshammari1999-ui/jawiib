class AudioManager {
  private _ctx: AudioContext | null = null;
  soundEnabled = true;
  musicEnabled = true;
  private _bgmPlaying = false;
  private _bgmStep = 0;

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

  // Warm wood-knock tick
  playTick() {
    this.tone(380, 0.07, 'triangle', 0.09);
  }

  // Urgent final-seconds tick — higher, snappier
  playFinalTick() {
    this.tone(560, 0.065, 'triangle', 0.13);
    setTimeout(() => this.tone(480, 0.04, 'triangle', 0.07), 55);
  }

  // Bright upbeat success fanfare (family-friendly ✅)
  playCorrect() {
    const notes = [330, 392, 494, 659, 880];
    notes.forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.16, 'sine', 0.28 - i * 0.02), i * 65),
    );
  }

  // Playful descending wah-wah (lighthearted ❌, never discouraging)
  playWrong() {
    this.tone(330, 0.22, 'sine', 0.2, 420);
    setTimeout(() => this.tone(262, 0.22, 'sine', 0.18, 330), 230);
    setTimeout(() => this.tone(196, 0.28, 'sine', 0.15, 262), 460);
  }

  // Points awarded: coin-collect sparkle
  playScore(big = false) {
    if (big) {
      // Grand fanfare — D F# A D' + flourish
      [294, 370, 440, 587, 740, 880].forEach((f, i) =>
        setTimeout(() => this.tone(f, 0.2, 'sine', 0.26 - i * 0.02), i * 85),
      );
    } else {
      // Quick coin ding-ding
      this.tone(784, 0.1, 'sine', 0.22);
      setTimeout(() => this.tone(1047, 0.14, 'sine', 0.2), 95);
    }
  }

  // Tense sabotage rumble
  playSabotage() {
    this.tone(110, 0.32, 'sine', 0.2, 240);
    setTimeout(() => this.tone(90, 0.24, 'sine', 0.15), 260);
  }

  // Triumphant winner fanfare — pentatonic D F# A D' F#'
  playWinner() {
    const fanfare = [294, 370, 440, 587, 740];
    fanfare.forEach((f, i) => setTimeout(() => this.tone(f, 0.24, 'sine', 0.3), i * 115));
    // Final sustain
    setTimeout(() => this.tone(880, 0.5, 'sine', 0.28), fanfare.length * 115);
  }

  playCountdown() {
    this.tone(660, 0.14, 'sine', 0.28);
  }

  playCountdownGo() {
    this.tone(880, 0.28, 'sine', 0.36);
    setTimeout(() => this.tone(1174, 0.32, 'sine', 0.3), 220);
  }

  // General weapon activation — rising magic sparkle
  playWeaponActivated() {
    [330, 440, 550, 660].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.14, 'sine', 0.2 - i * 0.02), i * 90),
    );
  }

  // Immunity / shield — distinctive magical protection sound
  playImmunityActivated() {
    // Broad rising shimmer — unmistakably "protected"
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.22, 'sine', 0.18), i * 70),
    );
    setTimeout(() => this.tone(1047, 0.4, 'sine', 0.14), 400);
  }

  // Extra-time chime — gentle ascending bells
  playExtraTime() {
    [330, 415, 523, 659].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.22, 'sine', 0.18), i * 120),
    );
  }

  // Steal phase — attention-grabbing horn fanfare 🏴‍☠️
  playStealPhase() {
    this.tone(392, 0.18, 'sine', 0.26, 330);
    setTimeout(() => this.tone(494, 0.15, 'sine', 0.24, 392), 195);
    setTimeout(() => this.tone(659, 0.22, 'sine', 0.28, 523), 375);
    setTimeout(() => this.tone(784, 0.3, 'sine', 0.26), 570);
  }

  // Turn change — soft whoosh/pop transition
  playTurnChange() {
    this.tone(440, 0.12, 'sine', 0.12, 330);
    setTimeout(() => this.tone(330, 0.1, 'sine', 0.08, 440), 110);
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

  // Maqam Rast-inspired pentatonic BGM loop
  // D3(147) E3(165) F#3(185) A3(220) B3(247) — warm oud register
  startBGM(intensity: 'low' | 'mid' | 'high' = 'low') {
    if (!this.musicEnabled || this._bgmPlaying) return;
    this._bgmPlaying = true;
    this._bgmStep = 0;

    const phrases: Record<typeof intensity, number[][]> = {
      low:  [[147, 0.5], [165, 0.4], [185, 0.5], [220, 0.6], [185, 0.4], [165, 0.5]],
      mid:  [[220, 0.4], [247, 0.35], [220, 0.4], [185, 0.35], [247, 0.45], [220, 0.5]],
      high: [[247, 0.3], [277, 0.28], [247, 0.32], [220, 0.3], [277, 0.35], [294, 0.4]],
    };
    const seq = phrases[intensity];

    const playStep = () => {
      if (!this._bgmPlaying || !this.musicEnabled) return;
      const [freq, dur] = seq[this._bgmStep % seq.length];
      this.tone(freq as number, dur as number, 'sine', 0.035);
      this._bgmStep++;
      setTimeout(playStep, (dur as number) * 1000 + 300);
    };
    setTimeout(playStep, 0);
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
