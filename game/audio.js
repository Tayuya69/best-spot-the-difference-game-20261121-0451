// Midnight Harbor — tiny WebAudio bleeps, synthesized live, no audio files.
var HarborAudio = (function () {
  var ctx = null;
  var muted = false;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, vol) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.05);
  }
  return {
    get muted() { return muted; },
    toggleMute: function () { muted = !muted; return muted; },
    chime: function () { tone(880, 0, 0.16); tone(1318, 0.09, 0.22); },
    buzz: function () { tone(140, 0, 0.25, 'square', 0.08); },
    tick: function () { tone(1200, 0, 0.05, 'sine', 0.04); },
    fanfare: function () {
      tone(523, 0, 0.18); tone(659, 0.12, 0.18); tone(784, 0.24, 0.18); tone(1046, 0.36, 0.4);
    }
  };
})();
