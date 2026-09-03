# Samurai Fight

A 2D fighting game for two players at one keyboard, built on the HTML5 Canvas API.

## Getting started

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## Controls

|              | Player 1 (Samurai Mack) | Player 2 (Kenji) |
| ------------ | ----------------------- | ---------------- |
| Move left    | `A`                     | `←`              |
| Move right   | `D`                     | `→`              |
| Jump         | `W`                     | `↑`              |
| Attack       | `Space`                 | `↓`              |

First to drain the opponent's health wins. If the 60-second timer runs out, whoever has more health wins.

## Project structure

```
public/img/          Sprite sheets, served verbatim (every cell is 200x200)
src/
  main.js            Entry point: builds the fighters and runs the game loop
  core/
    canvas.js        Canvas element and 2D context
    input.js         Keyboard bindings
  engine/
    sprite.js        Sprite sheet playback
    fighter.js       Fighter physics, animation switching, damage
    collision.js     Attack box / body overlap test
  data/
    constants.js     Tunable values (gravity, speeds, damage, round time)
    characters/      Per-character sprite and hitbox definitions
  ui/
    hud.js           Health bars, round timer, win/lose text
  style.css
```

Tuning values live in `src/data/constants.js`; character definitions live in `src/data/characters/`.

## Known limitations

These are tracked and intentional at this stage:

- **Physics are tied to display refresh rate.** Movement, gravity, and animation all advance once per rendered frame, so the game runs noticeably faster on a 120Hz or 144Hz display. A fixed 60Hz timestep is the next planned change.
- **Player 2 has an unintended advantage.** Hit detection keys off a sprite cell index, and Kenji's attack sheet has fewer cells than Mack's, so his attack connects roughly 167ms sooner.
- **No blocking, rounds, restart, sound, or AI opponent.**
- `Attack2.png` exists on disk for both characters but is not wired up yet.
