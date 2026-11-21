// Harbor Lights — tiny WebAudio synth. No audio files, everything is
// generated with oscillators. Mute is a simple on/off flag.
'use strict';

const SoundFX = {
  muted: false,
  ctx: null,

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, start, dur, type, vol) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, ctx.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.05);
  },

  // Two-note pleasant chime when a difference is found.
  chime() {
    this.tone(880, 0, 0.18, 'sine', 0.14);
    this.tone(1318.5, 0.09, 0.28, 'sine', 0.12);
  },

  // Low buzz when the player clicks somewhere with no difference.
  buzz() {
    this.tone(140, 0, 0.22, 'sawtooth', 0.08);
    this.tone(110, 0.05, 0.2, 'sawtooth', 0.06);
  },

  // Soft click for the hint button.
  click() {
    this.tone(660, 0, 0.07, 'triangle', 0.08);
  },

  // Little arpeggio when a round is cleared.
  fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, i * 0.12, 0.3, 'triangle', 0.12));
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },
};
