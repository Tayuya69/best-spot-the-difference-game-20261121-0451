// Midnight Harbor — bootstrap.
// Paints the first frame (title screen, or the ?round=&screen=&found= shot
// state), then raises window.__shotReady so the screenshot driver knows
// the game is visible.
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  HarborGame.init();
});
