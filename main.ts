// Midnight Harbor — a spot-the-difference game about a harbor at night.
// I built this entry for the best-spot-the-difference-game-20261121-0451
// competition: five hand-drawn SVG night scenes, ten differences per round,
// click-to-mark rings, a countdown, hints, streak bonuses and a score. This
// file is the hand-in program. It gathers the playable game/ folder and the
// screenshots/ renders, drops them into the output directory the grader
// points at, and writes dossier.json there using the vendored make.fun
// library, so the judge can read the game and its outline.
//
// Run it locally to check the hand-in before submitting:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the competition's gate: at most 4 screenshots, each at
// most 256 KiB, and the dossier text is capped at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
