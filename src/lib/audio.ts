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

  // Soft wood-knock tick — replaces harsh square wave
  playTick() {
    this.tone(420, 0.08, 'triangle', 0.1);
  }

  // Urgent final-seconds tick — slightly higher, still warm
  playFinalTick() {
    this.tone(600, 0.07, 'triangle', 0.14);
    setTimeout(() => this.tone(500, 0.04, 'triangle', 0.08), 60);
  }

  // Rising oud-like correct tone
  playCorrect() {
    this.tone(440, 0.18, 'sine', 0.28, 330);
    setTimeout(() => this.tone(660, 0.22, 'sine', 0.22), 160);
    setTimeout(() => this.tone(880, 0.18, 'sine', 0.16), 340);
  }

  // Low buzzer — softened with sine
  playWrong() {
    this.tone(180, 0.22, 'sine', 0.22, 280);
    setTimeout(() => this.tone(140, 0.18, 'sine', 0.14), 180);
  }

  playScore(big = false) {
    if (big) {
      // Maqam Rast ascending: D E F G A (294 330 349 392 440)
      [294, 330, 392, 440, 587].forEach((f, i) =>
        setTimeout(() => this.tone(f, 0.18, 'sine', 0.22), i * 90),
      );
    } else {
      this.tone(392, 0.12, 'sine', 0.18);
      setTimeout(() => this.tone(494, 0.14, 'sine', 0.18), 100);
    }
  }

  playSabotage() {
    this.tone(110, 0.35, 'sine', 0.22, 260);
    setTimeout(() => this.tone(90, 0.25, 'sine', 0.16), 280);
  }

  playWinner() {
    // Pentatonic fanfare: D F# A D' F#'
    const fanfare = [294, 370, 440, 587, 740];
    fanfare.forEach((f, i) => setTimeout(() => this.tone(f, 0.22, 'sine', 0.28), i * 120));
  }

  playCountdown() {
    this.tone(660, 0.14, 'sine', 0.28);
  }

  playCountdownGo() {
    this.tone(880, 0.28, 'sine', 0.36);
    setTimeout(() => this.tone(1174, 0.32, 'sine', 0.28), 220);
  }

  playWeaponActivated() {
    this.tone(330, 0.12, 'sine', 0.2);
    setTimeout(() => this.tone(440, 0.14, 'sine', 0.22), 110);
    setTimeout(() => this.tone(550, 0.18, 'sine', 0.2), 230);
  }

  playExtraTime() {
    // Rising gentle chime
    [294, 370, 494].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.2, 'sine', 0.18), i * 130),
    );
  }

  playStealPhase() {
    // Tense low pulse
    this.tone(220, 0.18, 'sine', 0.2);
    setTimeout(() => this.tone(246, 0.18, 'sine', 0.18), 200);
    setTimeout(() => this.tone(220, 0.22, 'sine', 0.22), 400);
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
  // Notes: D3(147) E3(165) F#3(185) A3(220) B3(247) — warm oud register
  startBGM(intensity: 'low' | 'mid' | 'high' = 'low') {
    if (!this.musicEnabled || this._bgmPlaying) return;
    this._bgmPlaying = true;
    this._bgmStep = 0;

    // Phrase patterns: low=gentle, mid=active, high=tense
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
      setTimeout(playStep, (dur as number) * 1000 + 320);
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
