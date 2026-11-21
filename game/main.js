// Harbor Lights — bootstrap.
// Wires the canvases, buttons and keys, paints the first frame, then raises
// window.__shotReady so the screenshot driver knows the game is visible.
//
// Screenshot states (real game states, driven by the URL so the capture
// driver can show mid-play, round-clear and title screens):
//   ?round=1&found=gull,window     round 1 with those two differences found
//   ?round=2&found=lantern,awning,fish
//   ?screen=clear                  round-clear card after finding all 7
//   ?screen=final                  final results card
//   (no params: the title screen, as a first-time player sees it)
'use strict';

(function () {
  const els = {
    left: document.getElementById('panel-left'),
    right: document.getElementById('panel-right'),
    hudRound: document.getElementById('hud-round'),
    hudFound: document.getElementById('hud-found'),
    hudTimer: document.getElementById('hud-timer'),
    hudScore: document.getElementById('hud-score'),
    hintBtn: document.getElementById('hint-btn'),
    muteBtn: document.getElementById('mute-btn'),
    titleScreen: document.getElementById('title-screen'),
    clearScreen: document.getElementById('clear-screen'),
    finalScreen: document.getElementById('final-screen'),
    timeoutScreen: document.getElementById('timeout-screen'),
    startBtn: document.getElementById('start-btn'),
    nextBtn: document.getElementById('next-btn'),
    retryBtn: document.getElementById('retry-btn'),
    againBtn: document.getElementById('again-btn'),
    playAgainTimeoutBtn: document.getElementById('timeout-retry-btn'),
    clearTitle: document.getElementById('clear-title'),
    clearFound: document.getElementById('clear-found'),
    clearTime: document.getElementById('clear-time'),
    clearBonus: document.getElementById('clear-bonus'),
    clearScore: document.getElementById('clear-score'),
    timeoutFound: document.getElementById('timeout-found'),
    finalScore: document.getElementById('final-score'),
    finalBest: document.getElementById('final-best'),
    finalTime: document.getElementById('final-time'),
    finalRounds: document.getElementById('final-rounds'),
  };

  HarborGame.init(els);
  window.__game = HarborGame; // handy for play-testing from the console

  const params = new URLSearchParams(location.search);
  const screen = params.get('screen') || 'title';
  const round = Math.max(0, Math.min(2, (parseInt(params.get('round') || '1', 10) || 1) - 1));
  const foundIds = (params.get('found') || '').split(',').map((s) => s.trim()).filter(Boolean);

  function applyFound(ids) {
    HarborGame.found = HarborGame.allDiffs().filter((d) => ids.indexOf(d.id) !== -1);
    HarborGame.score = HarborGame.found.length * 100;
    HarborGame.updateHud();
    HarborGame.render();
  }

  if (screen === 'play' || screen === 'clear' || screen === 'final') {
    // Enter the game as if the player had pressed Start, then set the state.
    HarborGame.started = true;
    HarborGame.hideAllOverlays();
    HarborGame.roundIndex = round;
    HarborGame.timeLeft = HarborGame.currentRound().timer;
    HarborGame.hintsLeft = 3;
    HarborGame.roundDone = false;
    HarborGame.gameOver = false;
    HarborGame.startTimer();
    applyFound(foundIds);
    if (screen === 'clear') {
      HarborGame.found = HarborGame.allDiffs().slice();
      HarborGame.score = 874; // 7 finds (700) + time bonus (87s x 2 = 174)
      HarborGame.timeLeft = 87;
      HarborGame.roundDone = true;
      HarborGame.stopTimer();
      HarborGame.updateHud();
      HarborGame.render();
      document.getElementById('clear-title').textContent =
        HarborGame.currentRound().name + ' — Clear!';
      document.getElementById('clear-found').textContent = '7 / 7';
      document.getElementById('clear-time').textContent = '87s left';
      document.getElementById('clear-bonus').textContent = '+174';
      document.getElementById('clear-score').textContent = '874';
      document.getElementById('next-btn').textContent =
        round + 1 >= ROUNDS.length ? 'See final results' : 'Next round →';
      HarborGame.showOverlay(els.clearScreen);
    } else if (screen === 'final') {
      HarborGame.score = 2450;
      HarborGame.roundScores = [780, 820, 850];
      HarborGame.totalTimeUsed = 214;
      HarborGame.showFinal();
    }
  } else {
    // Title screen: keep the title card up over a freshly painted round 1.
    HarborGame.roundIndex = 0;
    HarborGame.timeLeft = ROUNDS[0].timer;
    HarborGame.updateHud();
    HarborGame.render();
  }

  window.__shotReady = true;
})();
