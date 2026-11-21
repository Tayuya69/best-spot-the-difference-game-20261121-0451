// Harbor Lights — game state and rules.
// Owns the current round, the found set, the countdown, the score, hints,
// click hit-testing, markers, round clear and the final screen.
'use strict';

const HarborGame = {
  roundIndex: 0,
  found: [],        // diff objects found this round
  wrongMarks: [],   // {x, y, at} red X marks, drawn briefly
  score: 0,
  hintsLeft: 3,
  timeLeft: 0,
  timerId: null,
  pulse: null,      // diff being hint-pulsed, or null
  pulseUntil: 0,
  roundDone: false,
  gameOver: false,
  roundScores: [],
  totalTimeUsed: 0,
  started: false,

  els: {},

  init(els) {
    this.els = els;
    this.bind(els);
    this.showTitle();
  },

  bind(els) {
    const self = this;
    els.left.addEventListener('click', (e) => self.onPanelClick(e, els.left));
    els.right.addEventListener('click', (e) => self.onPanelClick(e, els.right));
    els.hintBtn.addEventListener('click', () => self.useHint());
    els.muteBtn.addEventListener('click', () => self.toggleMute());
    els.startBtn.addEventListener('click', () => self.startGame());
    els.nextBtn.addEventListener('click', () => self.nextRound());
    els.retryBtn.addEventListener('click', () => self.restartRound());
    els.againBtn.addEventListener('click', () => self.startGame());
    els.playAgainTimeoutBtn.addEventListener('click', () => self.restartRound());
    document.addEventListener('keydown', (e) => self.onKey(e));
  },

  currentRound() {
    return ROUNDS[this.roundIndex];
  },

  allDiffs() {
    return this.currentRound().diffs;
  },

  unfound() {
    const ids = new Set(this.found.map((d) => d.id));
    return this.allDiffs().filter((d) => !ids.has(d.id));
  },

  startGame() {
    this.score = 0;
    this.roundScores = [];
    this.totalTimeUsed = 0;
    this.gameOver = false;
    this.hideAllOverlays();
    this.loadRound(0);
    this.started = true;
  },

  loadRound(i) {
    this.roundIndex = i;
    this.found = [];
    this.wrongMarks = [];
    this.hintsLeft = 3;
    this.pulse = null;
    this.roundDone = false;
    this.timeLeft = this.currentRound().timer;
    this.hideAllOverlays();
    this.updateHud();
    this.render();
    this.startTimer();
  },

  restartRound() {
    this.loadRound(this.roundIndex);
  },

  nextRound() {
    if (!this.roundDone) return;
    if (this.roundIndex + 1 >= ROUNDS.length) {
      this.showFinal();
      return;
    }
    this.loadRound(this.roundIndex + 1);
  },

  startTimer() {
    this.stopTimer();
    const self = this;
    this.timerId = setInterval(() => {
      if (self.roundDone || self.gameOver) return;
      self.timeLeft -= 1;
      self.totalTimeUsed += 1;
      if (self.timeLeft <= 0) {
        self.timeLeft = 0;
        self.stopTimer();
        self.onTimeout();
      }
      self.updateHud();
    }, 1000);
  },

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  onTimeout() {
    this.gameOver = true;
    this.els.timeoutFound.textContent = this.found.length;
    this.showOverlay(this.els.timeoutScreen);
  },

  panelCoords(canvas, e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 560,
      y: ((e.clientY - r.top) / r.height) * 420,
    };
  },

  onPanelClick(e, canvas) {
    if (!this.started || this.roundDone || this.gameOver) return;
    const p = this.panelCoords(canvas, e);
    const hit = this.allDiffs().find((d) => {
      if (this.found.some((f) => f.id === d.id)) return false;
      const dx = p.x - d.x;
      const dy = p.y - d.y;
      return Math.sqrt(dx * dx + dy * dy) <= d.r + 10; // tolerant radius
    });
    if (hit) {
      this.found.push(hit);
      this.score += 100;
      SoundFX.chime();
      this.updateHud();
      this.render();
      if (this.found.length === this.allDiffs().length) {
        this.onRoundClear();
      }
    } else {
      // wrong click: brief red X, -5 seconds, low buzz
      this.wrongMarks.push({ x: p.x, y: p.y, at: Date.now() });
      this.timeLeft = Math.max(0, this.timeLeft - 5);
      SoundFX.buzz();
      this.updateHud();
      this.render();
      const self = this;
      setTimeout(() => {
        self.wrongMarks = self.wrongMarks.filter((m) => Date.now() - m.at < 900);
        self.render();
      }, 650);
    }
  },

  useHint() {
    if (!this.started || this.roundDone || this.gameOver) return;
    if (this.hintsLeft <= 0) return;
    const rest = this.unfound();
    if (!rest.length) return;
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - 50);
    SoundFX.click();
    this.pulse = rest[0];
    this.pulseUntil = Date.now() + 2000;
    this.updateHud();
    this.render();
    const self = this;
    const tick = setInterval(() => {
      if (Date.now() >= self.pulseUntil) {
        self.pulse = null;
        clearInterval(tick);
        self.render();
      } else {
        self.render();
      }
    }, 120);
  },

  toggleMute() {
    const muted = SoundFX.toggleMute();
    this.els.muteBtn.textContent = muted ? '🔇 Muted' : '🔊 Sound';
  },

  onKey(e) {
    const k = e.key.toLowerCase();
    if (k === 'h') this.useHint();
    else if (k === 'n') this.nextRound();
    else if (k === 'r') this.restartRound();
    else if (k === 'm') this.toggleMute();
  },

  onRoundClear() {
    this.roundDone = true;
    this.stopTimer();
    const bonus = this.timeLeft * 2;
    this.score += bonus;
    this.roundScores.push(this.score);
    SoundFX.fanfare();
    const self = this;
    setTimeout(() => {
      self.els.clearTitle.textContent = self.currentRound().name + ' — Clear!';
      self.els.clearFound.textContent = self.found.length + ' / ' + self.allDiffs().length;
      self.els.clearTime.textContent = self.timeLeft + 's left';
      self.els.clearBonus.textContent = '+' + bonus;
      self.els.clearScore.textContent = self.score;
      self.els.nextBtn.textContent =
        self.roundIndex + 1 >= ROUNDS.length ? 'See final results' : 'Next round →';
      self.showOverlay(self.els.clearScreen);
      self.updateHud();
    }, 600);
  },

  showFinal() {
    this.gameOver = true;
    this.stopTimer();
    const best = this.roundScores.length ? Math.max.apply(null, this.roundScores) : 0;
    this.els.finalScore.textContent = this.score;
    this.els.finalBest.textContent = best;
    this.els.finalTime.textContent = this.totalTimeUsed + 's';
    this.els.finalRounds.textContent = this.roundScores.length + ' / ' + ROUNDS.length;
    this.showOverlay(this.els.finalScreen);
  },

  showTitle() {
    this.hideAllOverlays();
    this.roundIndex = 0;
    this.found = [];
    this.timeLeft = ROUNDS[0].timer;
    this.score = 0;
    this.hintsLeft = 3;
    this.updateHud();
    this.render();
    this.showOverlay(this.els.titleScreen);
  },

  hideAllOverlays() {
    for (const el of [this.els.titleScreen, this.els.clearScreen, this.els.finalScreen, this.els.timeoutScreen]) {
      el.classList.add('hidden');
    }
  },

  showOverlay(el) {
    this.hideAllOverlays();
    el.classList.remove('hidden');
  },

  updateHud() {
    const r = this.currentRound();
    this.els.hudRound.textContent = r.name;
    this.els.hudFound.textContent = 'Found ' + this.found.length + ' / ' + r.diffs.length;
    this.els.hudTimer.textContent = '⏱ ' + this.timeLeft + 's';
    this.els.hudScore.textContent = '★ ' + this.score;
    this.els.hintBtn.textContent = '💡 Hint (' + this.hintsLeft + ')';
    this.els.hudTimer.classList.toggle('danger', this.timeLeft <= 20);
  },

  render() {
    const now = Date.now();
    const pulse = this.pulse && now < this.pulseUntil ? this.pulse : null;
    const leftCtx = this.els.left.getContext('2d');
    const rightCtx = this.els.right.getContext('2d');
    drawPanel(leftCtx, this.roundIndex, new Set(), this.found, pulse, now);
    drawPanel(rightCtx, this.roundIndex, new Set(this.allDiffs().map((d) => d.id)), this.found, pulse, now);
    // wrong-click red X marks on both panels at the same spot
    for (const m of this.wrongMarks) {
      for (const ctx of [leftCtx, rightCtx]) {
        ctx.strokeStyle = '#e63946';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(m.x - 10, m.y - 10);
        ctx.lineTo(m.x + 10, m.y + 10);
        ctx.moveTo(m.x + 10, m.y - 10);
        ctx.lineTo(m.x - 10, m.y + 10);
        ctx.stroke();
      }
    }
  },
};
