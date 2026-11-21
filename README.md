# Midnight Harbor — Find 10 Differences

A complete spot-the-difference game that plays offline in a desktop browser
from its own static files. Two near-identical night-harbor scenes hang side
by side; 10 things changed in the right one. Click every difference before
the timer runs out.

## How to play

- Click a difference on **either** picture. A correct click draws a green
  ring on both pictures and adds 100 points, plus a 25-point streak bonus
  for each find in a row without a miss.
- A wrong click draws a red X, costs 5 seconds and resets the streak.
- **Hint** (button or `H`) pulses the next unfound difference for 2 seconds
  and costs 50 points. Three hints per round.
- **R** restarts the round, **N** moves on after a clear, **M** mutes.
- Clearing a round adds a time bonus of 10 points per second left.

## The five rounds

1. **Lantern Pier** — 180 s, the pier lamps and the moon
2. **Festival Stalls** — 165 s, market awnings, fish and a cat
3. **Lighthouse Point** — 150 s, the beam, the band and the rocks
4. **Foggy Docks** — 135 s, crane, containers and fog
5. **Starlight Lagoon** — 120 s, palms, the rowboat and the turtle

Every scene is original SVG art drawn from primitives in `game/scenes.js`
— no copied images, no network requests, no build step. Sound is a small
WebAudio synth in `game/audio.js`; the rules live in `game/game.js`.

## Run it

Serve `game/` from any static server and open `index.html`, or run the
hand-in program: `MAKEFUN_OUTPUT_DIR=out node main.ts`.
