// Midnight Harbor — game state and rules.
// Owns the current round, the found set, the countdown, the score, the
// streak, hints, click hit-testing against difference hotspots, markers,
// round clear, the final screen and the ?round=&screen=&found= shot states.
'use strict';

var HarborGame = (function () {
  var HIT_RADIUS = 26;
  var state = {
    roundIdx: 0, scene: null, found: {}, foundCount: 0,
    score: 0, streak: 0, timeLeft: 0, hintsLeft: 3, hintIdx: null,
    phase: 'title', timerId: null
  };

  var $ = function (id) { return document.getElementById(id); };

  function fmtTime(s) {
    s = Math.max(0, Math.ceil(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function ringMarkup(x, y, cls) {
    return '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="24"/>' +
      '<path class="ring-check" d="M' + (x - 10) + ' ' + y + ' l7 7 l13 -14"/>';
  }

  function paint() {
    var scene = state.scene;
    if (!scene) return;
    var marksL = '', marksR = '';
    for (var i = 0; i < scene.diffs.length; i++) {
      if (!state.found[i]) continue;
      var d = scene.diffs[i];
      marksL += ringMarkup(d.spots[0][0], d.spots[0][1], 'ring');
      marksR += ringMarkup(d.spots[0][0], d.spots[0][1], 'ring');
    }
    if (state.hintIdx !== null && !state.found[state.hintIdx]) {
      var hd = scene.diffs[state.hintIdx];
      var hintMark = '<circle class="hint-ring" cx="' + hd.spots[0][0] + '" cy="' + hd.spots[0][1] + '" r="24"/>';
      marksL += hintMark;
      marksR += hintMark;
    }
    $('svgL').innerHTML = renderScene(scene, 0, 'L') + marksL;
    $('svgR').innerHTML = renderScene(scene, 1, 'R') + marksR;
    $('roundName').textContent = scene.name;
    $('roundNum').textContent = (state.roundIdx + 1) + ' / ' + SCENES.length;
    $('foundCount').textContent = state.foundCount + ' / ' + scene.diffs.length;
    var t = $('timeLeft');
    t.textContent = fmtTime(state.timeLeft);
    t.classList.toggle('low', state.timeLeft <= 30 && state.phase === 'play');
    $('score').textContent = state.score;
    $('streak').textContent = '×' + state.streak;
    $('hintsLeft').textContent = state.hintsLeft;
    $('hintBtn').disabled = state.hintsLeft <= 0 || state.phase !== 'play';
    var dots = '';
    for (var j = 0; j < scene.diffs.length; j++) {
      dots += '<span class="dot' + (state.found[j] ? ' found' : '') + (j === state.hintIdx ? ' hinted' : '') + '"></span>';
    }
    $('diffDots').innerHTML = dots;
  }

  function showOverlay(html) {
    $('overlayCard').innerHTML = html;
    $('overlay').classList.remove('hidden');
  }
  function hideOverlay() { $('overlay').classList.add('hidden'); }

  function stopTimer() {
    if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  }
  function startTimer() {
    stopTimer();
    state.timerId = setInterval(function () {
      if (state.phase !== 'play') return;
      state.timeLeft -= 1;
      if (state.timeLeft <= 10 && state.timeLeft > 0) HarborAudio.tick();
      if (state.timeLeft <= 0) { state.timeLeft = 0; paint(); timeUp(); return; }
      paint();
    }, 1000);
  }

  function startRound(idx, keepScore) {
    state.roundIdx = idx;
    state.scene = buildScene(idx);
    state.found = {};
    state.foundCount = 0;
    state.streak = 0;
    state.timeLeft = state.scene.timer;
    state.hintsLeft = 3;
    state.hintIdx = null;
    state.phase = 'play';
    if (!keepScore) state.score = 0;
    hideOverlay();
    paint();
    startTimer();
  }

  function markFound(idx) {
    state.found[idx] = true;
    state.foundCount += 1;
    var gained = 100 + state.streak * 25;
    state.streak += 1;
    state.score += gained;
    HarborAudio.chime();
    paint();
    if (state.foundCount >= state.scene.diffs.length) roundClear();
  }

  function roundClear() {
    stopTimer();
    state.phase = 'clear';
    var bonus = state.timeLeft * 10;
    state.score += bonus;
    HarborAudio.fanfare();
    paint();
    var last = state.roundIdx >= SCENES.length - 1;
    var html = '<h2>ROUND CLEAR!</h2>' +
      '<p class="big">' + state.scene.name + ' — all 10 differences found</p>' +
      '<p>Time bonus: +' + bonus + ' &nbsp;·&nbsp; Score: ' + state.score + '</p>';
    if (last) {
      html += '<p>That was the last pier of the night. The whole harbor is yours.</p>' +
        '<button id="ovNext" type="button">SEE FINAL SCORE</button>';
    } else {
      html += '<button id="ovNext" type="button">NEXT ROUND →</button>';
    }
    html += '<button id="ovAgain" type="button" class="ghost">Replay round</button>';
    showOverlay(html);
    $('ovNext').onclick = function () {
      if (last) victory(); else startRound(state.roundIdx + 1, true);
    };
    $('ovAgain').onclick = function () { startRound(state.roundIdx, true); };
  }

  function victory() {
    stopTimer();
    state.phase = 'victory';
    HarborAudio.fanfare();
    showOverlay('<h2>YOU FOUND THEM ALL!</h2>' +
      '<p class="big">Final score: ' + state.score + '</p>' +
      '<p>50 differences across 5 midnight scenes — the harbor keeps no secrets from you.</p>' +
      '<button id="ovAgain" type="button">PLAY AGAIN</button>');
    $('ovAgain').onclick = function () { state.score = 0; startRound(0, false); };
  }

  function timeUp() {
    stopTimer();
    state.phase = 'over';
    HarborAudio.buzz();
    showOverlay('<h2>TIME UP!</h2>' +
      '<p class="big">' + state.scene.name + ' — ' + state.foundCount + ' / 10 found</p>' +
      '<p>The fog rolls in and the differences hide again. Your score stays: ' + state.score + '</p>' +
      '<button id="ovAgain" type="button">RETRY ROUND</button>' +
      '<button id="ovTitle" type="button" class="ghost">Back to title</button>');
    $('ovAgain').onclick = function () { startRound(state.roundIdx, true); };
    $('ovTitle').onclick = function () { showTitle(); };
  }

  function showTitle() {
    stopTimer();
    state.phase = 'title';
    state.roundIdx = 0;
    state.scene = buildScene(0);
    state.found = {};
    state.foundCount = 0;
    state.timeLeft = state.scene.timer;
    state.hintsLeft = 3;
    paint();
    showOverlay('<h2>MIDNIGHT HARBOR</h2>' +
      '<p class="big">Find 10 differences · 5 rounds</p>' +
      '<p>Two pictures of the same night, side by side — but ten little things changed between them. ' +
      'Click a difference on either picture to ring it. A wrong click costs 5 seconds. ' +
      'Hints cost 50 points. Keys: <b>H</b> hint · <b>R</b> restart round · <b>N</b> next round · <b>M</b> mute.</p>' +
      '<button id="ovStart" type="button">START HUNTING</button>');
    $('ovStart').onclick = function () { state.score = 0; startRound(0, false); };
  }

  function nearestDiff(x, y) {
    var best = -1, bestD = HIT_RADIUS;
    var diffs = state.scene.diffs;
    for (var i = 0; i < diffs.length; i++) {
      if (state.found[i]) continue;
      for (var s = 0; s < diffs[i].spots.length; s++) {
        var dx = x - diffs[i].spots[s][0], dy = y - diffs[i].spots[s][1];
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestD) { bestD = d; best = i; }
      }
    }
    return best;
  }

  function onPanelClick(ev, svg) {
    if (state.phase !== 'play') return;
    var rect = svg.getBoundingClientRect();
    var x = (ev.clientX - rect.left) / rect.width * 640;
    var y = (ev.clientY - rect.top) / rect.height * 420;
    var idx = nearestDiff(x, y);
    if (idx >= 0) { markFound(idx); return; }
    state.streak = 0;
    state.timeLeft = Math.max(0, state.timeLeft - 5);
    HarborAudio.buzz();
    var mark = '<g class="wrong-x"><line x1="' + (x - 12) + '" y1="' + (y - 12) + '" x2="' + (x + 12) + '" y2="' + (y + 12) + '"/>' +
      '<line x1="' + (x + 12) + '" y1="' + (y - 12) + '" x2="' + (x - 12) + '" y2="' + (y + 12) + '"/></g>';
    svg.insertAdjacentHTML('beforeend', mark);
    setTimeout(function () {
      var g = svg.querySelector('.wrong-x');
      if (g) g.remove();
    }, 600);
    paint();
    if (state.timeLeft <= 0) timeUp();
  }

  function useHint() {
    if (state.phase !== 'play' || state.hintsLeft <= 0) return;
    var next = -1;
    for (var i = 0; i < state.scene.diffs.length; i++) {
      if (!state.found[i]) { next = i; break; }
    }
    if (next < 0) return;
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - 50);
    state.hintIdx = next;
    paint();
    setTimeout(function () {
      state.hintIdx = null;
      paint();
    }, 2000);
  }

  // Deterministic states for screenshots: ?round=1..5 &screen=play|clear|victory|title &found=0,3,5
  function applyShotParams() {
    var q = new URLSearchParams(window.location.search);
    var round = Math.min(5, Math.max(1, parseInt(q.get('round') || '1', 10))) - 1;
    var screen = q.get('screen') || 'play';
    var foundList = (q.get('found') || '').split(',').filter(function (s) { return s !== ''; });
    state.roundIdx = round;
    state.scene = buildScene(round);
    state.found = {};
    state.foundCount = 0;
    state.timeLeft = state.scene.timer;
    state.hintsLeft = 3;
    if (screen === 'title') { showTitle(); return; }
    state.phase = 'play';
    hideOverlay();
    for (var i = 0; i < foundList.length; i++) {
      var idx = parseInt(foundList[i], 10);
      if (!isNaN(idx) && idx >= 0 && idx < state.scene.diffs.length && !state.found[idx]) {
        state.found[idx] = true;
        state.foundCount += 1;
        state.score += 100;
      }
    }
    if (screen === 'clear') {
      state.foundCount = state.scene.diffs.length;
      for (var j = 0; j < state.scene.diffs.length; j++) state.found[j] = true;
      state.score = 1250;
      state.phase = 'clear';
      paint();
      showOverlay('<h2>ROUND CLEAR!</h2><p class="big">' + state.scene.name + ' — all 10 differences found</p><p>Time bonus: +420 &nbsp;·&nbsp; Score: 1250</p>');
      return;
    }
    if (screen === 'victory') {
      state.score = 6420;
      state.phase = 'victory';
      paint();
      showOverlay('<h2>YOU FOUND THEM ALL!</h2><p class="big">Final score: 6420</p><p>50 differences across 5 midnight scenes — the harbor keeps no secrets from you.</p>');
      return;
    }
    paint();
  }

  function init() {
    $('svgL').addEventListener('click', function (ev) { onPanelClick(ev, $('svgL')); });
    $('svgR').addEventListener('click', function (ev) { onPanelClick(ev, $('svgR')); });
    $('hintBtn').addEventListener('click', useHint);
    $('muteBtn').addEventListener('click', function () {
      var m = HarborAudio.toggleMute();
      $('muteBtn').textContent = m ? 'SOUND OFF' : 'SOUND ON';
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'h' || ev.key === 'H') useHint();
      else if (ev.key === 'r' || ev.key === 'R') { if (state.phase === 'play') startRound(state.roundIdx, true); }
      else if (ev.key === 'n' || ev.key === 'N') {
        if (state.phase === 'clear' && state.roundIdx < SCENES.length - 1) startRound(state.roundIdx + 1, true);
      } else if (ev.key === 'm' || ev.key === 'M') $('muteBtn').click();
    });
    var q = new URLSearchParams(window.location.search);
    if (q.has('round') || q.has('screen') || q.has('found')) applyShotParams();
    else showTitle();
    window.__game = {
      state: state,
      clickAt: function (x, y) {
        var idx = nearestDiff(x, y);
        if (idx >= 0) { markFound(idx); return idx; }
        // a miss through the test hook costs the same as a real misclick
        state.streak = 0;
        state.timeLeft = Math.max(0, state.timeLeft - 5);
        HarborAudio.buzz();
        paint();
        if (state.timeLeft <= 0) timeUp();
        return -1;
      },
      startRound: startRound,
      useHint: useHint
    };
    window.__shotReady = true;
  }

  return { init: init };
})();
