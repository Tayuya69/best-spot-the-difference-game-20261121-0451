// Midnight Harbor — five hand-built SVG night scenes.
// Each scene is a list of parts. A part draws itself for the left panel
// (v = 0) and the right panel (v = 1); parts flagged d: 1 are the ten
// differences. Marker coordinates (x, y) live in the 640 x 420 viewBox.
// Every scene is original art drawn from primitives — no copied assets.

function C(x, y, r, fill, o) {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' +
    (o !== undefined ? ' opacity="' + o + '"' : '') + '/>';
}
function R(x, y, w, h, fill, rx) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
    '" fill="' + fill + '"' + (rx ? ' rx="' + rx + '"' : '') + '/>';
}
function P(pts, fill, o) {
  return '<polygon points="' + pts + '" fill="' + fill + '"' +
    (o !== undefined ? ' opacity="' + o + '"' : '') + '/>';
}
function PA(d, fill, stroke, sw) {
  return '<path d="' + d + '" fill="' + (fill || 'none') + '"' +
    (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 2) + '"' : '') + '/>';
}
function T(x, y, s, size, fill, anchor) {
  return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + fill +
    '" text-anchor="' + (anchor || 'middle') + '" font-family="Georgia, serif" font-weight="bold">' + s + '</text>';
}
function gull(x, y, s, flip) {
  var f = flip ? -1 : 1;
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s * f) + ' ' + s + ')" stroke="#dfe9ff" stroke-width="2.4" fill="none" stroke-linecap="round">' +
    '<path d="M0 0 Q7 -8 14 0 Q21 -8 28 0"/></g>';
}
function star4(x, y, r, fill) {
  return P(x + ',' + (y - r) + ' ' + (x + r * 0.32) + ',' + (y - r * 0.32) + ' ' + (x + r) + ',' + y +
    ' ' + (x + r * 0.32) + ',' + (y + r * 0.32) + ' ' + x + ',' + (y + r) + ' ' + (x - r * 0.32) + ',' + (y + r * 0.32) +
    ' ' + (x - r) + ',' + y + ' ' + (x - r * 0.32) + ',' + (y - r * 0.32), fill);
}
function lantern(x, y, c) {
  return '<g>' + C(x, y, 13, c, 0.25) + C(x, y, 8, c) + R(x - 5, y - 13, 10, 5, '#3a2a12', 2) +
    '<line x1="' + x + '" y1="' + (y - 22) + '" x2="' + x + '" y2="' + (y - 8) + '" stroke="#8a6d3b" stroke-width="2"/></g>';
}
function house(x, y, w, h, fill, lit) {
  var s = R(x, y, w, h, fill) +
    P((x - 6) + ',' + y + ' ' + (x + w / 2) + ',' + (y - 22) + ' ' + (x + w + 6) + ',' + y, '#1d2f52');
  var wx = x + 10, wy = y + 14;
  s += R(wx, wy, 16, 18, lit ? '#ffd166' : '#16233d') + R(wx + 24, wy, 16, 18, '#16233d');
  return s;
}
function skySea(pre, skyTop, skyBot, seaTop, seaBot) {
  return '<defs>' +
    '<linearGradient id="' + pre + 'sky" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + skyTop + '"/><stop offset="1" stop-color="' + skyBot + '"/></linearGradient>' +
    '<linearGradient id="' + pre + 'sea" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + seaTop + '"/><stop offset="1" stop-color="' + seaBot + '"/></linearGradient>' +
    '</defs>' +
    R(0, 0, 640, 245, 'url(#' + pre + 'sky)') + R(0, 245, 640, 175, 'url(#' + pre + 'sea)');
}
function waves(y, c, n) {
  var s = '';
  for (var i = 0; i < n; i++) {
    var x = 30 + i * 95 + (i % 2) * 40;
    s += PA('M' + x + ' ' + (y + (i % 3) * 26) + ' q14 -9 28 0 q14 9 28 0', 'none', c, 2.5);
  }
  return s;
}
function stars(list, skipId, v) {
  var s = '';
  for (var i = 0; i < list.length; i++) {
    var st = list[i];
    if (v === 1 && st.id === skipId) continue;
    s += st.big ? star4(st.x, st.y, st.r, '#fff7d6') : C(st.x, st.y, st.r, '#e8eefc', 0.9);
  }
  return s;
}
var STARFIELD = [
  { x: 60, y: 40, r: 2 }, { x: 150, y: 50, r: 3, big: true, id: 'bright' },
  { x: 240, y: 30, r: 2 }, { x: 330, y: 60, r: 2.5 }, { x: 420, y: 35, r: 2 },
  { x: 470, y: 110, r: 2 }, { x: 90, y: 120, r: 2 }, { x: 580, y: 160, r: 2 },
  { x: 200, y: 100, r: 1.8 }, { x: 380, y: 140, r: 2 }
];

// ---- Round 1: Lantern Pier -----------------------------------------------
function sceneLanternPier() {
  var parts = [
    { x: 0, y: 0, f: function (v, pre) { return skySea(pre, '#0b1530', '#27406e', '#123a5e', '#0a1f38'); } },
    { x: 150, y: 50, d: 1, f: function (v) { return stars(STARFIELD, 'bright', v); } },
    { x: 520, y: 70, d: 1, f: function (v) {
      return v === 0 ? C(520, 70, 30, '#f4e9c8') + C(520, 70, 26, '#e8d9a8', 0.5)
        : C(520, 70, 30, '#f4e9c8') + C(532, 62, 26, '#27406e');
    } },
    { x: 300, y: 84, d: 1, f: function (v) { return v === 0 ? gull(288, 80, 1, false) : ''; } },
    { x: 0, y: 0, f: function () { return gull(120, 110, 0.9, false) + gull(400, 60, 0.8, true); } },
    { x: 0, y: 0, f: function () { return P('0,245 120,190 260,245 420,200 640,245 640,260 0,260', '#0d1c33'); } },
    { x: 0, y: 0, f: function () { return house(48, 205, 86, 62, '#1a2c4e', false) + house(150, 218, 70, 49, '#22345c', false); } },
    { x: 112, y: 228, d: 1, f: function (v) {
      return R(58, 219, 16, 18, v === 0 ? '#ffd166' : '#16233d');
    } },
    { x: 583, y: 187, d: 1, f: function (v) {
      // lighthouse, right side; its band flips red/white on the right panel
      var band = v === 0 ? '#e5484d' : '#e8eefc';
      return '<g>' + R(566, 150, 34, 118, '#e8eefc') + R(566, 178, 34, 18, band) +
        R(566, 222, 34, 18, band) + P('562,150 600,150 583,128', '#e5484d') +
        C(583, 140, 7, '#ffd166') + C(583, 140, 13, '#ffd166', 0.3) + '</g>';
    } },
    { x: 0, y: 0, f: function () { return R(0, 300, 640, 16, '#4a3421') + R(0, 316, 640, 8, '#3a2817'); } },
    { x: 0, y: 0, f: function () {
      var s = '';
      for (var i = 0; i < 7; i++) s += R(30 + i * 92, 316, 10, 42, '#2e1f10');
      return s;
    } },
    { x: 200, y: 292, d: 1, f: function (v) { return lantern(200, 292, v === 0 ? '#e5484d' : '#37d67a'); } },
    { x: 0, y: 0, f: function () { return lantern(90, 292, '#ffd166') + lantern(320, 292, '#e5484d'); } },
    { x: 0, y: 0, f: function () {
      return '<g>' + PA('M430 330 L470 330 L460 300 L440 300 Z', '#7a4a21') +
        R(446, 330, 6, 26, '#5d3a1a') + R(430, 326, 46, 8, '#3a2817') + '</g>';
    } },
    { x: 452, y: 288, d: 1, f: function (v) {
      return v === 0 ? PA('M452 288 L452 268 L470 274 L452 280 Z', '#e5484d') : '';
    } },
    { x: 0, y: 0, f: function () {
      return '<g>' + PA('M250 372 L330 372 L315 348 L268 348 Z', '#31435f') +
        PA('M268 348 L292 322 L296 348 Z', '#e8eefc') + R(290, 318, 3, 30, '#8a6d3b') + '</g>';
    } },
    { x: 159, y: 349, d: 1, f: function (v) {
      var n = v === 0 ? 3 : 2, s = '';
      for (var i = 0; i < n; i++) s += R(96 + i * 26, 340 - (i % 2) * 18, 22, 18, '#8a6d3b');
      return s;
    } },
    { x: 0, y: 0, f: function () { return waves(360, '#7fb2e0', 5) + waves(398, '#5d8fc4', 4); } },
    { x: 520, y: 368, d: 1, f: function (v) {
      return '<g>' + C(520, 368, 12, '#e5484d') + R(508, 362, 24, 12, v === 0 ? '#e8eefc' : '#e5484d') +
        R(518, 380, 4, 14, '#3a2a12') + '</g>';
    } },
    { x: 0, y: 0, f: function () { return PA('M520 396 q10 -6 20 0 q10 6 20 0', 'none', '#ffd166', 2); } },
    { x: 250, y: 308, d: 1, f: function (v) {
      return v === 0 ? PA('M236 308 q14 -12 28 0 q14 12 28 0', 'none', '#c9a86a', 3) : '';
    } }
  ];
  return { name: 'Round 1 · Lantern Pier', timer: 180, parts: parts };
}

// ---- Round 2: Festival Stalls --------------------------------------------
function sceneFestivalStalls() {
  var parts = [
    { x: 0, y: 0, f: function (v, pre) { return skySea(pre, '#160b2e', '#3a2060', '#0e2a4a', '#081426'); } },
    { x: 0, y: 0, f: function (v) { return stars(STARFIELD, 'bright', v); } },
    { x: 0, y: 0, f: function () { return C(90, 64, 24, '#f4e9c8') + C(98, 58, 20, '#3a2060'); } },
    { x: 0, y: 0, f: function (v) {
      // festoon string lights; one bulb goes dark on the right panel
      var s = PA('M0 26 Q320 66 640 22', 'none', '#5d4a2a', 2);
      for (var i = 0; i < 9; i++) {
        var x = 40 + i * 70, y = 30 + Math.sin(i * 0.7) * 8;
        var dark = v === 1 && i === 4;
        s += C(x, y + 8, 6, dark ? '#2a2118' : '#ffd166') + C(x, y + 8, 11, dark ? '#000' : '#ffd166', 0.25);
      }
      return s;
    } },
    { x: 320, y: 41, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function () { return R(0, 250, 640, 170, '#1c1410') + R(0, 250, 640, 10, '#3a2a1a'); } },
    { x: 320, y: 164, d: 1, f: function (v) {
      // three stalls; the middle awning flips red/white to blue/white
      function stall(x, awn, sign, signFill) {
        var s = R(x, 180, 130, 74, '#6b4a2f') + R(x, 254, 130, 10, '#3a2a1a');
        s += P(x + ',' + 180 + ' ' + (x + 130) + ',180 ' + (x + 118) + ',148 ' + (x + 12) + ',148', awn);
        for (var i = 0; i < 5; i++) s += R(x + 8 + i * 25, 150, 12, 30, i % 2 ? '#e8eefc' : awn, 2);
        s += R(x + 38, 196, 54, 22, signFill) + T(x + 65, 212, sign, 13, '#1c1410');
        return s;
      }
      return stall(30, '#e5484d', 'FISH', '#ffd166') +
        stall(255, v === 0 ? '#e5484d' : '#3b82f6', 'BREAD', '#e8eefc') +
        stall(480, '#37d67a', 'TEA', '#ffd166');
    } },
    { x: 0, y: 0, f: function () {
      return '<g>' + C(95, 236, 9, '#ff9f43') + C(115, 236, 9, '#ff9f43') + C(135, 236, 9, '#ff9f43') +
        R(80, 240, 80, 12, '#4a3421') + '</g>';
    } },
    { x: 135, y: 236, d: 1, f: function (v) { return v === 0 ? C(135, 236, 9, '#ff9f43') : ''; } },
    { x: 0, y: 0, f: function () {
      return '<g>' + R(300, 236, 70, 12, '#4a3421') +
        R(310, 224, 16, 12, '#e8b04b') + '</g>';
    } },
    { x: 344, y: 230, d: 1, f: function (v) {
      return v === 0 ? R(336, 224, 16, 12, '#e8b04b') : '';
    } },
    { x: 0, y: 0, f: function () {
      return '<g>' + R(505, 232, 80, 14, '#4a3421') +
        C(520, 226, 7, '#37d67a') + C(540, 226, 7, '#37d67a') + '</g>';
    } },
    { x: 560, y: 226, d: 1, f: function (v) {
      return v === 0 ? C(560, 226, 7, '#37d67a') : '';
    } },
    { x: 0, y: 0, f: function () {
      var s = '';
      for (var i = 0; i < 7; i++) {
        var x = 60 + i * 80;
        s += P(x + ',96 ' + (x + 16) + ',96 ' + (x + 8) + ',122', i % 2 ? '#ffd166' : '#e5484d');
      }
      return PA('M0 92 Q320 108 640 90', 'none', '#8a6d3b', 2) + s;
    } },
    { x: 300, y: 109, d: 1, f: function (v) {
      return P('300,96 316,96 308,122', v === 0 ? '#e5484d' : '#37d67a');
    } },
    { x: 473, y: 317, d: 1, f: function (v) {
      var n = v === 0 ? 2 : 1, s = '';
      for (var i = 0; i < n; i++) s += '<g>' + R(430 + i * 30, 300, 26, 34, '#6b4a2f') +
        R(430 + i * 30, 306, 26, 5, '#8a6d3b') + '</g>';
      return s;
    } },
    { x: 0, y: 0, f: function (v) {
      var n = v === 0 ? 5 : 4, s = '';
      for (var i = 0; i < n; i++) s += lantern(80 + i * 42, 140, i % 2 ? '#e5484d' : '#ffd166');
      return s;
    } },
    { x: 248, y: 140, d: 1, f: function () { return ''; } },
    { x: 196, y: 288, d: 1, f: function (v) {
      if (v === 1) return '';
      return '<g>' + R(180, 300, 44, 40, '#2a2118') + C(196, 292, 10, '#2a2118') +
        P('186,282 196,270 206,282', '#2a2118') + C(192, 288, 2, '#ffd166') + C(200, 288, 2, '#ffd166') + '</g>';
    } },
    { x: 580, y: 143, d: 1, f: function (v) {
      // back building with one curtained window; curtain closes on the right
      return house(560, 120, 66, 90, '#22345c', false) +
        R(572, 134, 16, 18, v === 0 ? '#ffd166' : '#3b82f6');
    } }
  ];
  return { name: 'Round 2 · Festival Stalls', timer: 165, parts: parts };
}

// ---- Round 3: Lighthouse Point -------------------------------------------
function sceneLighthousePoint() {
  var parts = [
    { x: 0, y: 0, f: function (v, pre) { return skySea(pre, '#0a1230', '#1e3a6e', '#10395e', '#0a2038'); } },
    { x: 0, y: 0, f: function (v) { return stars(STARFIELD, 'bright', v); } },
    { x: 0, y: 0, f: function (v) {
      // shooting star, left panel only
      return v === 0 ? PA('M430 40 L470 66', 'none', '#fff7d6', 2.5) + star4(470, 66, 6, '#fff7d6') : '';
    } },
    { x: 470, y: 66, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function () { return P('0,245 150,210 320,245 480,215 640,245 640,260 0,260', '#0c1a30'); } },
    { x: 0, y: 0, f: function () { return P('0,420 0,300 130,300 190,340 230,420', '#141f33') + P('180,340 260,340 300,420 140,420', '#101a2c'); } },
    { x: 0, y: 0, f: function () {
      return R(100, 150, 40, 160, '#e8eefc') + P('94,150 146,150 120,124', '#e5484d') +
        C(120, 140, 8, '#ffd166') + C(120, 140, 14, '#ffd166', 0.3);
    } },
    { x: 75, y: 158, d: 1, spots: [[75, 158], [165, 158]], f: function (v) {
      // beam swings left on A, right on B — clickable at either beam
      return v === 0 ? P('120,158 30,120 30,196', '#ffd166', 0.35)
        : P('120,158 210,120 210,196', '#ffd166', 0.35);
    } },
    { x: 120, y: 189, d: 1, f: function (v) {
      var band = v === 0 ? '#e5484d' : '#e8eefc';
      return R(100, 180, 40, 18, band) + R(100, 228, 40, 18, band);
    } },
    { x: 120, y: 209, d: 1, f: function (v) {
      return R(112, 200, 16, 18, v === 0 ? '#ffd166' : '#16233d');
    } },
    { x: 250, y: 96, d: 1, f: function (v) { return gull(238, 92, 1, v === 1); } },
    { x: 0, y: 0, f: function () { return gull(330, 70, 0.9, false) + gull(480, 110, 0.85, true); } },
    { x: 0, y: 0, f: function (v) {
      var n = v === 0 ? 3 : 2, s = '';
      for (var i = 0; i < n; i++) s += P((380 + i * 46) + ',392 ' + (404 + i * 46) + ',360 ' + (428 + i * 46) + ',392', '#0d1828');
      return s;
    } },
    { x: 496, y: 376, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function (v) {
      return '<g>' + C(540, 350, 11, '#e5484d') + R(530, 345, 20, 10, '#e8eefc') +
        C(540, 338, v === 0 ? 5 : 0, '#ffd166') + C(540, 338, v === 0 ? 9 : 0, '#ffd166', 0.3) + '</g>';
    } },
    { x: 540, y: 338, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function (v) {
      return v === 0 ? PA('M300 380 q16 -10 32 0 q16 10 32 0', 'none', '#7fb2e0', 2.5) : '';
    } },
    { x: 332, y: 376, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function () {
      return '<g>' + PA('M420 396 L500 396 L488 372 L436 372 Z', '#31435f') +
        PA('M436 372 L460 346 L464 372 Z', '#e8eefc') + R(458, 342, 3, 30, '#8a6d3b') + '</g>';
    } },
    { x: 462, y: 359, d: 1, f: function (v) {
      return v === 0 ? PA('M460 359 L460 346 L476 352 L460 358 Z', '#e8eefc') : '';
    } },
    { x: 249, y: 307, d: 1, f: function (v) {
      var n = v === 0 ? 4 : 3, s = R(176, 292, 96, 6, '#3a2a1a');
      for (var i = 0; i < n; i++) s += R(180 + i * 22, 296, 6, 22, '#3a2a1a');
      return s;
    } },
    { x: 0, y: 0, f: function () { return waves(340, '#7fb2e0', 4); } }
  ];
  return { name: 'Round 3 · Lighthouse Point', timer: 150, parts: parts };
}

// ---- Round 4: Foggy Docks --------------------------------------------------
function sceneFoggyDocks() {
  var parts = [
    { x: 0, y: 0, f: function (v, pre) { return skySea(pre, '#101623', '#2c3a55', '#16324e', '#0a1a2c'); } },
    { x: 0, y: 0, f: function (v) { return stars(STARFIELD, 'bright', v); } },
    { x: 0, y: 0, f: function () { return C(540, 70, 26, '#e8e4d2') + C(548, 64, 21, '#2c3a55'); } },
    { x: 0, y: 0, f: function () { return R(0, 250, 640, 170, '#191411') + R(0, 250, 640, 10, '#33291d'); } },
    { x: 0, y: 0, f: function () {
      return '<g>' + R(60, 120, 26, 150, '#2b3a52') + R(60, 120, 220, 16, '#2b3a52') +
        R(268, 136, 10, 60, '#2b3a52') + PA('M60 136 L200 250', 'none', '#2b3a52', 3) + '</g>';
    } },
    { x: 273, y: 196, d: 1, spots: [[273, 196], [273, 232]], f: function (v) {
      // crane hook rides high on A, low on B
      var y = v === 0 ? 196 : 232;
      return '<g><line x1="273" y1="136" x2="273" y2="' + y + '" stroke="#8a6d3b" stroke-width="3"/>' +
        PA('M265 ' + y + ' q8 12 16 0', 'none', '#ffd166', 3) + '</g>';
    } },
    { x: 0, y: 0, f: function (v) { return v === 0 ? gull(280, 128, 0.9, false) : ''; } },
    { x: 280, y: 128, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function () {
      return '<g>' + R(360, 150, 150, 100, '#22345c') + R(360, 150, 150, 8, '#2c3a55') +
        R(380, 170, 30, 26, '#ffd166') + R(430, 170, 30, 26, '#16233d') + '</g>';
    } },
    { x: 395, y: 183, d: 1, f: function (v) {
      return R(380, 170, 30, 26, v === 0 ? '#ffd166' : '#16233d');
    } },
    { x: 0, y: 0, f: function (v) {
      // stacked containers; the top one flips blue to orange
      return R(90, 270, 120, 44, '#3b82f6') + R(90, 314, 120, 44, '#e5484d') +
        T(150, 298, v === 0 ? '7' : '1', 22, '#e8eefc');
    } },
    { x: 290, y: 336, d: 1, f: function (v) {
      return v === 0 ? R(230, 314, 120, 44, '#37d67a') : '';
    } },
    { x: 150, y: 291, d: 1, f: function (v) {
      return R(90, 270, 120, 44, v === 0 ? '#3b82f6' : '#e07b39') +
        T(150, 298, v === 0 ? '7' : '1', 22, '#e8eefc');
    } },
    { x: 0, y: 0, f: function () {
      return '<g>' + R(420, 300, 18, 60, '#4a3421') + '</g>';
    } },
    { x: 429, y: 292, d: 1, f: function (v) {
      return v === 0 ? C(429, 292, 16, '#e5484d') + C(429, 292, 9, '#e8eefc') : '';
    } },
    { x: 0, y: 0, f: function () {
      return '<g>' + PA('M470 380 L580 380 L566 336 L486 336 Z', '#26344e') +
        R(516, 306, 10, 30, '#8a6d3b') + R(516, 300, 40, 8, '#e5484d') + R(516, 312, 40, 8, '#e8eefc') + '</g>';
    } },
    { x: 536, y: 306, d: 1, f: function (v) {
      return R(516, 300, 40, 8, '#e5484d') + R(516, 312, 40, 8, v === 0 ? '#e8eefc' : '#e5484d');
    } },
    { x: 356, y: 368, d: 1, f: function (v) {
      var n = v === 0 ? 2 : 1, s = '';
      for (var i = 0; i < n; i++) s += PA('M' + (300 + i * 44) + ' 372 q12 -10 24 0 q12 10 24 0', 'none', '#c9a86a', 3);
      return s;
    } },
    { x: 200, y: 306, d: 1, f: function (v) {
      return v === 0 ? '<g>' + C(180, 300, 26, '#c9d4e8', 0.14) + C(220, 312, 30, '#c9d4e8', 0.12) + '</g>' : '';
    } },
    { x: 0, y: 0, f: function () {
      return '<g>' + C(590, 120, 5, '#ffd166') + C(590, 120, 10, '#ffd166', 0.3) +
        R(586, 120, 8, 130, '#3a2a1a') + '</g>';
    } },
    { x: 590, y: 150, d: 1, f: function (v) { return lantern(590, 150, v === 0 ? '#37d67a' : '#e5484d'); } },
    { x: 0, y: 0, f: function () { return waves(392, '#5d8fc4', 4); } }
  ];
  return { name: 'Round 4 · Foggy Docks', timer: 135, parts: parts };
}

// ---- Round 5: Starlight Lagoon ---------------------------------------------
function sceneStarlightLagoon() {
  var parts = [
    { x: 0, y: 0, f: function (v, pre) { return skySea(pre, '#0b1030', '#2c4a7e', '#0e3a5e', '#0a2038'); } },
    { x: 0, y: 0, f: function (v) { return stars(STARFIELD, 'bright', v); } },
    { x: 0, y: 0, f: function (v) {
      var n = v === 0 ? 5 : 4, s = '';
      var spots = [[80, 90], [200, 60], [330, 100], [470, 70], [560, 120]];
      for (var i = 0; i < n; i++) s += C(spots[i][0], spots[i][1], 3, '#d8f7a0') + C(spots[i][0], spots[i][1], 6, '#d8f7a0', 0.3);
      return s;
    } },
    { x: 560, y: 120, d: 1, f: function () { return ''; } },
    { x: 520, y: 70, d: 1, f: function (v) {
      return v === 0 ? C(520, 70, 30, '#f4e9c8') + C(520, 70, 26, '#e8d9a8', 0.5)
        : C(520, 70, 30, '#f4e9c8') + C(532, 62, 26, '#2c4a7e');
    } },
    { x: 0, y: 0, f: function () { return P('0,245 140,205 300,245 460,210 640,245 640,262 0,262', '#0d1c33'); } },
    { x: 0, y: 0, f: function () { return P('0,420 0,330 640,330 640,420', '#c9b18a'); } },
    { x: 0, y: 0, f: function () {
      // two palm trees on the sand
      function palm(x, y, s) {
        return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
          PA('M0 0 Q6 -40 0 -80', 'none', '#5d3a1a', 7) +
          PA('M0 -80 Q-34 -96 -52 -72 Q-24 -78 -4 -70', '#2f7a3e') +
          PA('M0 -80 Q34 -96 52 -72 Q24 -78 4 -70', '#2f7a3e') +
          PA('M0 -80 Q-20 -108 -8 -118 Q-2 -96 6 -84', '#37914a') +
          PA('M0 -80 Q20 -108 8 -118 Q2 -96 -6 -84', '#37914a') + '</g>';
      }
      return palm(90, 400, 1) + palm(560, 405, 0.85);
    } },
    { x: 90, y: 312, d: 1, f: function (v) {
      var n = v === 0 ? 3 : 2, s = '';
      for (var i = 0; i < n; i++) s += C(78 + i * 12, 316 + (i % 2) * 6, 6, '#6b4a2f');
      return s;
    } },
    { x: 0, y: 0, f: function () {
      return house(250, 268, 90, 62, '#1a2c4e', false) +
        R(262, 282, 16, 18, '#ffd166') + R(312, 282, 16, 18, '#16233d');
    } },
    { x: 270, y: 291, d: 1, f: function (v) {
      return R(262, 282, 16, 18, v === 0 ? '#ffd166' : '#16233d');
    } },
    { x: 0, y: 0, f: function () {
      return '<g>' + PA('M380 372 L470 372 L452 352 L398 352 Z', '#6b4a2f') +
        R(420, 348, 4, 26, '#3a2a1a') + '</g>';
    } },
    { x: 424, y: 340, d: 1, f: function (v) {
      return v === 0 ? PA('M404 356 L424 330 L430 334 L414 358 Z', '#8a6d3b') : '';
    } },
    { x: 0, y: 0, f: function (v) {
      return v === 0 ? PA('M520 340 q14 -10 28 0 q14 10 28 0', 'none', '#ffd166', 2.5) +
        PA('M520 356 q14 -8 28 0', 'none', '#ffd166', 2, 0.6) : '';
    } },
    { x: 534, y: 340, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function (v) {
      return v === 0 ? star4(180, 380, 10, '#ff9f43') + star4(200, 392, 7, '#ff9f43') : '';
    } },
    { x: 190, y: 386, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function (v) {
      return v === 0 ? PA('M300 300 Q320 282 340 300 Q320 312 300 300 Z', '#7fb2e0') +
        PA('M318 300 L326 290 L330 300 Z', '#7fb2e0') : '';
    } },
    { x: 322, y: 296, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function () { return ''; } },
    { x: 620, y: 88, d: 1, f: function (v) {
      return v === 0 ? C(620, 90, 26, '#e8eefc', 0.85) + C(596, 76, 18, '#e8eefc', 0.85) + C(640, 78, 16, '#e8eefc', 0.85) : '';
    } },
    { x: 0, y: 0, f: function () {
      // shore flowers, the same pink on both panels
      var c = '#ff8fb0', s = '';
      var spots = [[40, 360], [70, 372], [600, 360], [580, 376]];
      for (var i = 0; i < spots.length; i++) s += C(spots[i][0], spots[i][1], 5, c) + C(spots[i][0], spots[i][1], 2, '#fff');
      return s;
    } },
    { x: 0, y: 0, f: function (v) {
      return v === 0 ? '<g>' + C(150, 300, 12, '#2f7a3e') + C(138, 296, 7, '#2f7a3e') +
        C(162, 296, 7, '#2f7a3e') + PA('M150 312 q10 6 20 0', 'none', '#2f7a3e', 3) + '</g>' : '';
    } },
    { x: 150, y: 302, d: 1, f: function () { return ''; } },
    { x: 0, y: 0, f: function () { return waves(280, '#7fb2e0', 4) + waves(312, '#5d8fc4', 3); } }
  ];
  return { name: 'Round 5 · Starlight Lagoon', timer: 120, parts: parts };
}

// Registry: every scene carries exactly ten differences.
var SCENES = [sceneLanternPier, sceneFestivalStalls, sceneLighthousePoint, sceneFoggyDocks, sceneStarlightLagoon];
function buildScene(i) {
  var scene = SCENES[i]();
  var diffs = [];
  for (var k = 0; k < scene.parts.length; k++) {
    if (scene.parts[k].d) {
      diffs.push({
        x: scene.parts[k].x, y: scene.parts[k].y,
        spots: scene.parts[k].spots || [[scene.parts[k].x, scene.parts[k].y]],
        idx: diffs.length
      });
    }
  }
  return { name: scene.name, timer: scene.timer, parts: scene.parts, diffs: diffs };
}
function renderScene(scene, side, pre) {
  var out = '';
  for (var k = 0; k < scene.parts.length; k++) out += scene.parts[k].f(side, pre);
  return out;
}
