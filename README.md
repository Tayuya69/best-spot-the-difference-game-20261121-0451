# Harbor Lights — Find 7 Differences

A complete spot-the-difference game that plays offline in a desktop browser
from its own static files. Two near-identical harbor scenes hang side by
side; 7 things changed in the right one. Click every difference before the
timer runs out.

## How to play

- Click a difference on **either** picture. A correct click draws a green
  ring around it on **both** panels, plays a chime and scores 100 points.
- A wrong click draws a brief red X and costs 5 seconds.
- **Hint** (3 per round) pulses the next unfound difference for 2 seconds
  and costs 50 points.
- Clear a round for a time bonus: remaining seconds × 2.

## Rounds

1. **Golden Hour** (150s) — missing gull, dark window, flag colour, boat
   colour, missing crate, lighthouse band, shrunken cloud.
2. **Night Market** (120s) — lantern colour, stall awning, missing fish,
   rope coil, moon phase, pier cat, sign letters.
3. **Storm Watch** (100s) — rope knot, buoy stripe, closed curtain, gull
   direction, chain link, extra rain, torn flag.

After round 3 the final screen shows the total score, best round and total
time, with a Play again button.

## Controls

- Mouse: click a difference
- **H** hint · **N** next round (after a round is clear) · **R** restart round
  · **M** mute

## Run it

Serve the `game/` folder and open it in a desktop browser:

```sh
cd game && python3 -m http.server 8123
# open http://localhost:8123
```

No network requests at runtime — all art is drawn procedurally on canvas
and all sounds are synthesized with WebAudio.

## Files

- `game/index.html` — page shell, HUD and overlay screens
- `game/style.css` — layout and HUD styling
- `game/scene.js` — the harbor painter (one function draws either panel)
- `game/game.js` — state, rules, timer, scoring, hints
- `game/audio.js` — tiny WebAudio synth (chime, buzz, fanfare)
- `game/main.js` — bootstrap, screenshot states, `window.__shotReady`
- `main.ts` — hand-in program (copies `game/` + `screenshots/`, writes `dossier.json`)
