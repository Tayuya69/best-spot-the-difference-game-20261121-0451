// Harbor Lights — scene painter.
// Draws one cozy evening harbor panel on a canvas. The LEFT panel is the
// original; the RIGHT panel is the same scene with the round's 7 differences
// applied. Everything is drawn procedurally — no images, no network.
'use strict';

const W = 560;
const H = 420;
const SEA_Y = 252;

// Small deterministic pseudo-random helper so rain and waves look the same
// on every load (both panels must agree except for the real differences).
function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 44 * s, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 22 * s, y + 8 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();
}

function gull(ctx, x, y, dir, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (dir === 'left') {
    ctx.moveTo(x - 12, y - 4);
    ctx.quadraticCurveTo(x - 5, y - 12, x, y);
    ctx.quadraticCurveTo(x + 5, y - 12, x + 12, y - 4);
  } else {
    ctx.moveTo(x - 12, y + 2);
    ctx.quadraticCurveTo(x - 5, y - 6, x, y);
    ctx.quadraticCurveTo(x + 5, y - 6, x + 12, y + 2);
  }
  ctx.stroke();
}

function boat(ctx, x, y, hull, sailColor, scale) {
  scale = scale || 1;
  // hull
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(x - 42 * scale, y);
  ctx.lineTo(x + 42 * scale, y);
  ctx.lineTo(x + 30 * scale, y + 16 * scale);
  ctx.lineTo(x - 30 * scale, y + 16 * scale);
  ctx.closePath();
  ctx.fill();
  // mast + sail
  ctx.strokeStyle = '#5b4636';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 52 * scale);
  ctx.stroke();
  ctx.fillStyle = sailColor;
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 50 * scale);
  ctx.lineTo(x + 2, y - 6 * scale);
  ctx.lineTo(x + 30 * scale, y - 6 * scale);
  ctx.closePath();
  ctx.fill();
  // little flag on the mast
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.moveTo(x, y - 52 * scale);
  ctx.lineTo(x + 14 * scale, y - 48 * scale);
  ctx.lineTo(x, y - 44 * scale);
  ctx.closePath();
  ctx.fill();
}

function house(ctx, x, y, w, h, wall, roof, litWindows, darkWindows) {
  // litWindows / darkWindows: arrays of [dx, dy] window offsets
  rect(ctx, x, y, w, h, wall);
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x + w / 2, y - 26);
  ctx.lineTo(x + w + 6, y);
  ctx.closePath();
  ctx.fill();
  for (const [dx, dy] of litWindows) {
    rect(ctx, x + dx, y + dy, 16, 20, '#ffd166');
    ctx.strokeStyle = '#7a5c2e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + dx, y + dy, 16, 20);
  }
  for (const [dx, dy] of darkWindows) {
    rect(ctx, x + dx, y + dy, 16, 20, '#2b3a55');
    ctx.strokeStyle = '#7a5c2e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + dx, y + dy, 16, 20);
  }
}

function lighthouse(ctx, x, bandColor) {
  // pole + flag
  ctx.strokeStyle = '#4a3b2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 22, 108);
  ctx.lineTo(x + 22, 82);
  ctx.stroke();
  // lamp room
  rect(ctx, x + 8, 108, 28, 22, '#3d405b');
  rect(ctx, x + 12, 112, 20, 14, '#ffe66d');
  // tower: three bands
  ctx.fillStyle = '#f8f4e8';
  ctx.beginPath();
  ctx.moveTo(x, 250);
  ctx.lineTo(x + 6, 130);
  ctx.lineTo(x + 38, 130);
  ctx.lineTo(x + 44, 250);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bandColor;
  ctx.beginPath();
  ctx.moveTo(x + 2, 196);
  ctx.lineTo(x + 4, 168);
  ctx.lineTo(x + 40, 168);
  ctx.lineTo(x + 42, 196);
  ctx.closePath();
  ctx.fill();
  // door
  rect(ctx, x + 17, 224, 12, 26, '#5b4636');
}

function waves(ctx, seed, color, count) {
  const r = rng(seed);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < count; i++) {
    const x = 20 + r() * (W - 60);
    const y = SEA_Y + 18 + r() * (H - SEA_Y - 40);
    const len = 14 + r() * 26;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y - 5, x + len, y);
    ctx.stroke();
  }
}

function rain(ctx, seed, count, color) {
  const r = rng(seed);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < count; i++) {
    const x = 20 + r() * (W - 40);
    const y = 10 + r() * 220;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y + 12);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Round definitions. Each difference: id, label, x, y, radius (panel coords).
// The painter consults `altered` (a Set of ids) to decide what changes on
// the RIGHT panel.
// ---------------------------------------------------------------------------
const ROUNDS = [
  {
    name: 'Round 1 — Golden Hour',
    timer: 150,
    sky: ['#ff9e57', '#ffd9a0'],
    sea: ['#2e86ab', '#17455e'],
    diffs: [
      { id: 'gull', label: 'A gull is missing', x: 300, y: 60, r: 20 },
      { id: 'window', label: 'A window went dark', x: 455, y: 195, r: 18 },
      { id: 'flag', label: 'The lighthouse flag changed colour', x: 92, y: 92, r: 16 },
      { id: 'boat', label: 'The boat changed colour', x: 340, y: 306, r: 22 },
      { id: 'crates', label: 'A crate is missing', x: 208, y: 322, r: 20 },
      { id: 'band', label: 'The lighthouse band changed colour', x: 66, y: 182, r: 18 },
      { id: 'cloud', label: 'A cloud shrank', x: 452, y: 90, r: 24 },
    ],
  },
  {
    name: 'Round 2 — Night Market',
    timer: 120,
    sky: ['#0d1b3e', '#27406e'],
    sea: ['#16324f', '#0a1c30'],
    diffs: [
      { id: 'lantern', label: 'A lantern changed colour', x: 420, y: 230, r: 18 },
      { id: 'awning', label: 'The stall awning changed colour', x: 300, y: 250, r: 22 },
      { id: 'fish', label: 'A fish is missing', x: 262, y: 302, r: 18 },
      { id: 'rope', label: 'The rope coil is gone', x: 140, y: 348, r: 20 },
      { id: 'moon', label: 'The moon changed phase', x: 480, y: 60, r: 24 },
      { id: 'cat', label: 'The pier cat is gone', x: 232, y: 336, r: 18 },
      { id: 'sign', label: 'The sign letters changed', x: 300, y: 204, r: 20 },
    ],
  },
  {
    name: 'Round 3 — Storm Watch',
    timer: 100,
    sky: ['#5a6b7d', '#33404e'],
    sea: ['#274b63', '#12283a'],
    diffs: [
      { id: 'knot', label: 'The rope knot is gone', x: 200, y: 302, r: 16 },
      { id: 'buoy', label: 'The buoy stripe changed colour', x: 420, y: 332, r: 20 },
      { id: 'curtain', label: 'A curtain closed', x: 450, y: 190, r: 18 },
      { id: 'gulldir', label: 'A gull turned around', x: 320, y: 80, r: 20 },
      { id: 'chain', label: 'A chain link is missing', x: 120, y: 368, r: 16 },
      { id: 'rain', label: 'More rain drops appeared', x: 480, y: 120, r: 24 },
      { id: 'flagtear', label: 'The flag is torn', x: 92, y: 92, r: 16 },
    ],
  },
];

function drawSky(ctx, round) {
  const g = ctx.createLinearGradient(0, 0, 0, SEA_Y);
  g.addColorStop(0, round.sky[0]);
  g.addColorStop(1, round.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, SEA_Y);
}

function drawSea(ctx, round) {
  const g = ctx.createLinearGradient(0, SEA_Y, 0, H);
  g.addColorStop(0, round.sea[0]);
  g.addColorStop(1, round.sea[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, SEA_Y, W, H - SEA_Y);
}

function drawPier(ctx, x0, x1, y) {
  rect(ctx, x0, y, x1 - x0, 12, '#8a6b4a');
  ctx.fillStyle = '#6d543a';
  for (let x = x0 + 14; x < x1; x += 28) ctx.fillRect(x, y, 3, 12);
  // posts
  for (let x = x0 + 10; x < x1; x += 60) rect(ctx, x, y + 12, 8, 26, '#6d543a');
}

function drawCrates(ctx, x, y, count) {
  for (let i = 0; i < count; i++) {
    const cx = x + i * 30;
    const cy = y - (i % 2) * 4;
    rect(ctx, cx, cy, 26, 26, '#b08954');
    ctx.strokeStyle = '#7a5c2e';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, 26, 26);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 26, cy + 26);
    ctx.moveTo(cx + 26, cy);
    ctx.lineTo(cx, cy + 26);
    ctx.stroke();
  }
}

function drawScene(ctx, roundIndex, altered) {
  const round = ROUNDS[roundIndex];
  const alt = altered instanceof Set ? altered : new Set(altered || []);
  ctx.clearRect(0, 0, W, H);
  drawSky(ctx, round);
  drawSea(ctx, round);

  if (roundIndex === 0) {
    // --- Golden Hour ---
    // sun with glow
    const glow = ctx.createRadialGradient(470, 70, 8, 470, 70, 90);
    glow.addColorStop(0, 'rgba(255,243,176,0.9)');
    glow.addColorStop(1, 'rgba(255,243,176,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(370, -30, 200, 200);
    circle(ctx, 470, 70, 34, '#fff3b0');
    cloud(ctx, 120, 55, 1.0, 'rgba(255,255,255,0.9)');
    cloud(ctx, 300, 40, 0.8, 'rgba(255,255,255,0.85)');
    if (alt.has('cloud')) cloud(ctx, 452, 108, 0.45, 'rgba(255,255,255,0.8)');
    else cloud(ctx, 452, 90, 0.7, 'rgba(255,255,255,0.9)');
    // gulls (one may vanish)
    gull(ctx, 180, 70, 'left', '#3d405b');
    if (!alt.has('gull')) gull(ctx, 300, 60, 'left', '#3d405b');
    gull(ctx, 380, 95, 'left', '#3d405b');
    // lighthouse with flag + band differences
    lighthouse(ctx, 44, alt.has('band') ? '#f8f4e8' : '#e63946');
    ctx.fillStyle = alt.has('flag') ? '#4361ee' : '#e63946';
    ctx.beginPath();
    ctx.moveTo(66, 82);
    ctx.lineTo(96, 88);
    ctx.lineTo(66, 94);
    ctx.closePath();
    ctx.fill();
    // houses with lit windows (one may go dark)
    house(ctx, 400, 180, 70, 72, '#e07a5f', '#8d3b2f', [[10, 12], [40, 12]], [[10, 42]]);
    if (alt.has('window')) {
      house(ctx, 478, 172, 66, 80, '#81b29a', '#3d6b4f', [[40, 12]], [[10, 12], [10, 42]]);
    } else {
      house(ctx, 478, 172, 66, 80, '#81b29a', '#3d6b4f', [[10, 12], [40, 12]], [[10, 42]]);
    }
    // pier + crates (one crate may vanish)
    drawPier(ctx, 40, 320, 330);
    drawCrates(ctx, 150, 304, alt.has('crates') ? 2 : 3);
    // boats (one changes colour)
    boat(ctx, 340, 300, alt.has('boat') ? '#2a9d8f' : '#e76f51', '#fff8e7', 1.0);
    boat(ctx, 180, 330, '#457b9d', '#ffe8a3', 0.8);
    waves(ctx, 11, 'rgba(255,255,255,0.45)', 10);
  } else if (roundIndex === 1) {
    // --- Night Market ---
    // stars
    const r = rng(7);
    for (let i = 0; i < 40; i++) {
      circle(ctx, 20 + r() * (W - 40), 10 + r() * 180, 1.2 + r() * 1.3, 'rgba(255,255,255,0.85)');
    }
    // moon: full vs crescent
    circle(ctx, 480, 60, 26, '#f4f1de');
    if (alt.has('moon')) circle(ctx, 492, 54, 22, round.sky[0]);
    // market stall with awning + sign
    rect(ctx, 262, 268, 84, 62, '#6d4c41');
    const awn = alt.has('awning') ? '#4361ee' : '#e63946';
    for (let i = 0; i < 6; i++) {
      rect(ctx, 256 + i * 16, 244, 16, 24, i % 2 === 0 ? awn : '#f8f4e8');
    }
    rect(ctx, 256, 244, 96, 8, '#3d405b');
    // sign: FISH vs F1SH
    rect(ctx, 278, 190, 56, 26, '#f4d35e');
    ctx.fillStyle = '#3d405b';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(alt.has('sign') ? 'F1SH' : 'FISH', 306, 209);
    // fish on the counter (3 vs 2)
    const fishCount = alt.has('fish') ? 2 : 3;
    for (let i = 0; i < fishCount; i++) {
      const fx = 272 + i * 26;
      ctx.fillStyle = '#90be6d';
      ctx.beginPath();
      ctx.ellipse(fx, 302, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(fx + 10, 302);
      ctx.lineTo(fx + 16, 297);
      ctx.lineTo(fx + 16, 307);
      ctx.closePath();
      ctx.fill();
    }
    // string lanterns along the houses
    ctx.strokeStyle = '#3d405b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(380, 200);
    ctx.quadraticCurveTo(430, 216, 480, 200);
    ctx.stroke();
    const lanternCols = alt.has('lantern')
      ? ['#e63946', '#2a9d8f', '#e63946']
      : ['#e63946', '#e63946', '#e63946'];
    [396, 420, 452].forEach((lx, i) => {
      circle(ctx, lx, 230, 9, lanternCols[i]);
      circle(ctx, lx, 230, 4, '#ffd166');
    });
    // houses with warm windows
    house(ctx, 400, 176, 66, 76, '#5b4a68', '#33272f', [[10, 12], [38, 12], [10, 42]], []);
    house(ctx, 478, 168, 64, 84, '#6d597a', '#33272f', [[10, 12], [36, 42]], [[10, 42]]);
    lighthouse(ctx, 44, '#e63946');
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(66, 82);
    ctx.lineTo(96, 88);
    ctx.lineTo(66, 94);
    ctx.closePath();
    ctx.fill();
    // pier, rope coil, cat
    drawPier(ctx, 40, 320, 330);
    if (!alt.has('rope')) {
      ctx.strokeStyle = '#d9c29a';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(140, 348, 12 - i * 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (!alt.has('cat')) {
      // sitting cat silhouette
      ctx.fillStyle = '#22223b';
      ctx.beginPath();
      ctx.ellipse(232, 338, 9, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, 232, 322, 7, '#22223b');
      ctx.beginPath();
      ctx.moveTo(226, 317);
      ctx.lineTo(228, 309);
      ctx.lineTo(231, 316);
      ctx.moveTo(234, 316);
      ctx.lineTo(237, 309);
      ctx.lineTo(239, 317);
      ctx.fill();
    }
    boat(ctx, 360, 306, '#3d405b', '#8d99ae', 0.9);
    waves(ctx, 23, 'rgba(255,255,255,0.25)', 8);
  } else {
    // --- Storm Watch ---
    // heavy clouds
    cloud(ctx, 110, 48, 1.2, 'rgba(70,82,96,0.95)');
    cloud(ctx, 320, 34, 1.0, 'rgba(70,82,96,0.95)');
    cloud(ctx, 480, 60, 0.9, 'rgba(70,82,96,0.9)');
    // rain (more drops on the right in one zone)
    rain(ctx, 31, 46, 'rgba(220,230,240,0.55)');
    if (alt.has('rain')) {
      ctx.strokeStyle = 'rgba(220,230,240,0.8)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 7; i++) {
        const x = 448 + i * 11;
        const y = 96 + (i % 3) * 16;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y + 13);
        ctx.stroke();
      }
    }
    // gulls fighting the wind (one turns around)
    gull(ctx, 180, 66, 'left', '#22223b');
    gull(ctx, 320, 80, alt.has('gulldir') ? 'right' : 'left', '#22223b');
    // lighthouse, flag whole vs torn
    lighthouse(ctx, 44, '#e63946');
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(66, 82);
    if (alt.has('flagtear')) {
      ctx.lineTo(82, 88);
      ctx.lineTo(74, 92);
      ctx.lineTo(88, 96);
      ctx.lineTo(66, 98);
    } else {
      ctx.lineTo(96, 88);
      ctx.lineTo(66, 94);
    }
    ctx.closePath();
    ctx.fill();
    // houses, one curtain closes
    house(ctx, 400, 180, 70, 72, '#7a6a53', '#4a3b2f', [[10, 12], [40, 42]], [[40, 12]]);
    if (alt.has('curtain')) {
      house(ctx, 478, 172, 66, 80, '#6b7a8d', '#37424e', [[40, 12]], [[10, 12], [10, 42]]);
      // closed curtain over the dark window
      rect(ctx, 488, 184, 16, 20, '#e9c46a');
      ctx.strokeStyle = '#b08954';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(496, 184);
      ctx.lineTo(496, 204);
      ctx.stroke();
    } else {
      house(ctx, 478, 172, 66, 80, '#6b7a8d', '#37424e', [[10, 12], [40, 12]], [[10, 42]]);
    }
    // pier with rope + knot, anchor chain
    drawPier(ctx, 40, 320, 330);
    ctx.strokeStyle = '#d9c29a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 352);
    ctx.quadraticCurveTo(180, 344, 210, 352);
    ctx.stroke();
    if (!alt.has('knot')) {
      circle(ctx, 200, 350, 5, '#b08954');
      ctx.strokeStyle = '#7a5c2e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(200, 350, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    // anchor chain: links along the pier edge (one may vanish)
    ctx.strokeStyle = '#9aa5b1';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 5; i++) {
      if (alt.has('chain') && i === 2) continue;
      ctx.beginPath();
      ctx.ellipse(96 + i * 12, 368, 6, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // buoy with stripe (red vs yellow)
    circle(ctx, 420, 332, 16, '#e63946');
    rect(ctx, 404, 328, 32, 8, alt.has('buoy') ? '#ffd166' : '#f8f4e8');
    ctx.fillStyle = '#3d405b';
    ctx.beginPath();
    ctx.moveTo(420, 316);
    ctx.lineTo(420, 304);
    ctx.stroke();
    // boats rocking
    boat(ctx, 330, 306, '#457b9d', '#dfe7ef', 1.0);
    boat(ctx, 190, 336, '#6d597a', '#ffe8a3', 0.8);
    waves(ctx, 47, 'rgba(255,255,255,0.5)', 14);
  }
}

// Draw one panel plus its found markers (green rings) and an optional
// pulsing hint ring around `pulse` (a diff object) at time `t`.
function drawPanel(ctx, roundIndex, altered, found, pulse, t) {
  drawScene(ctx, roundIndex, altered);
  for (const d of found) {
    ctx.strokeStyle = '#2a9d8f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r + 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (pulse) {
    const wobble = 3 + Math.sin(t / 180) * 3;
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, pulse.r + 6 + wobble, 0, Math.PI * 2);
    ctx.stroke();
  }
}
