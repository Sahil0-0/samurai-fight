# Samurai Fight - V2.1

A 2D fighting game that runs in the browser on a plain canvas. One human player against a computer opponent, one round, best health at the buzzer wins. No engine, no framework, no dependencies at runtime. Vite is used only to serve the files during development and to bundle them for release.

The whole game is a fixed 1024 by 576 canvas that scales to fit whatever window you open it in.

## Running it

```
npm install
npm run dev
```

That opens the game in your browser. `npm run build` writes a production copy into `dist/`, and `npm run preview` serves that copy so you can check it before shipping. The build uses relative asset paths, so you can drop the contents of `dist/` on itch.io, GitHub Pages, or any subfolder of any host without editing anything.

## Controls

| Key | Action |
| --- | --- |
| A / D | Walk left and right |
| W | Jump |
| Space | Attack |
| Q / E | Dash left and right |
| Enter | Start the match |
| R | Replay after the round ends |
| F | Toggle fullscreen (double clicking the stage does the same) |
| ` | Toggle the debug overlay |

Only one direction is active at a time. If you hold both A and D, the one you pressed most recently wins, and releasing it hands control back to the other while it is still held. That keeps the fighter from freezing mid walk when you roll your fingers across the keys.

## How a match runs

The game moves through five states, and only one of them accepts input.

**Ready.** Both fighters spawn above the stage and fall to the floor. Once they have both landed the game asks for Enter. Nothing before that press does anything.

**Countdown.** "1", then "2", then "Fight", three quarters of a second each. Movement keys are still dead here, so mashing during the countdown does not buy you a head start.

**Fighting.** Normal play. The clock runs, both fighters act, hits register.

**Round over.** The result appears in the middle of the screen and controls shut off. R resets everything and runs the whole sequence again from the fall.

**Respawning.** The reset state between rounds. It is the same fall as the opening, but it skips the Enter prompt because pressing R already said yes.

A round lasts 150 seconds and the clock reads as minutes and seconds. It ends early if either fighter is knocked out. If the clock runs out instead, whoever has more health wins, and equal health is a tie.

## The fighters

Both characters are the same size, 50 pixels wide and 150 tall, and both start with 100 health. They differ in reach and in the sprite sheets that drive their animation.

|  | Player | Opponent |
| --- | --- | --- |
| Sprite set | Samurai Mack | Kenji |
| Name on the HUD | Kenji | Azuki |
| Faces at spawn | Right | Left |
| Attack reach | 210 px | 170 px |

The display names do not match the sprite folders. The player controls the Samurai Mack art but the health bar says Kenji, and the AI drives the Kenji art under the name Azuki. This is deliberate, the names are just labels in `src/ui/hud.js` and have nothing to do with which art is loaded, but it catches people out when they read the code for the first time.

Reach is measured as the gap between the two bodies, so the player can connect from 40 pixels further away than the AI can. Neither has a minimum range. Both can hit an opponent who is standing directly against them.

## Combat

### Attacking

There is one attack. It always costs the same 39 ticks whichever character throws it, split into three phases:

| Phase | Ticks | What happens |
| --- | --- | --- |
| Startup | 13 | The swing is winding up. Nothing can hit yet. |
| Active | 4 | The hitbox is live. This is the only window that connects. |
| Recovery | 22 | The swing is finishing. Still can't act, still can't hit. |

Because both characters share those numbers, the two sprite sheets do not decide the timing. Samurai Mack has six cells in his attack sheet and Kenji has four, and each character maps its own cells onto the shared phases through `cellsByPhase` in its data file. `src/engine/attackSchedule.js` expands that into a straight tick to cell lookup at startup, so the art can change without touching the balance.

An attack connects at most once. The moment it lands it is marked resolved and cannot hit again until the next swing.

### Getting hit

A landed hit does 5 damage, so it takes 20 clean hits to finish someone off. Three things fire at once when one connects.

**Hitstop, 8 ticks.** Both fighters freeze completely. No animation, no physics, no input. The background and the shop keep animating straight through it and the clock keeps counting. This is the freeze that makes a hit feel like it landed rather than like a number changing.

**Screen shake, 10 ticks.** The whole canvas jitters up to 4 pixels in a random direction each frame. The HUD sits in the DOM on top of the canvas, so it stays perfectly still while the world shakes underneath it.

**Knockback and hitstun.** The defender is pushed 20 pixels per tick for 10 ticks, 200 pixels total, plus a small upward pop. Two hundred pixels is more than either character's reach on purpose, so a hit shoves you out of range instead of leaving you parked in front of the attacker to trade again. On top of the push, the defender is locked out of acting for 20 ticks.

If a second hit arrives while the defender is still in hitstun it refreshes the window rather than stacking or being ignored.

Both fighters are checked for a connection before either takes damage, so two swings whose active frames overlap will trade and both land. Neither side gets priority for being checked first.

### Dashing

Q and E throw a short burst in that direction. The dash is fully invulnerable, so it passes clean through an incoming swing, and the dashing fighter also passes through the opponent's body instead of bumping into it.

A dash on the ground travels 350 pixels. A dash in the air travels 200. The ground version is longer because closing or escaping along the floor is the point, where the air version is really just repositioning.

The cooldown is a full second. That is what keeps the dash a panic button rather than a movement option you hold down. It cannot be started while you are locked in an attack, in hitstun, or dead.

### Movement and jumping

Walking is a flat 5 pixels per tick with no acceleration. A jump reaches about 285 pixels at the top of the arc and takes a little under a second to come back down. You cannot double jump, since the jump is refused while you are off the ground.

Neither fighter can walk off the sides of the canvas.

Bodies are solid. Whenever the two overlap they are pushed apart until they are exactly one body width apart, and this runs every tick rather than only on contact. It is physical solidity, not a combat rule. If one fighter is pinned against a wall and cannot be pushed any further, the push that the wall refused is handed to the other fighter instead, so the pair separates in a single tick rather than grinding against the edge. The only exception is a dash, which ignores solidity entirely.

### Locks

A fighter is locked, meaning input and AI decisions are ignored, while attacking, while dashing, while in hitstun, and while dying. Held movement keys are zeroed during a lock so you cannot slide out from underneath your own animation.

Jumping is the one thing that ignores locks. Pressing W during hitstun or during attack recovery will launch you anyway. This is intentional and not an oversight, but it does mean the 20 tick hitstun window describes an advisory punish, not a guaranteed one. If you are balancing around "a landed hit buys me a free follow up", it does not, because your opponent can hop out.

Death is sticky. Once a fighter enters it nothing pulls them back out, and the animation holds on its final frame.

## The opponent

The AI is written to lose in believable ways rather than to be hard. It sits roughly at a normal difficulty tier and every part of it is a tunable number in `src/engine/ai.js`.

It re-evaluates every 20 ticks give or take 4, so the cadence is not a readable metronome. Every single time it judges the distance between the two fighters it adds up to 45 pixels of random error, which is why it sometimes swings a beat early or closes distance unevenly. It never sees the true gap.

Roughly a third of its decisions are deliberate mistakes. In range, a mistake means hesitating instead of swinging. Out of range, it means drifting the wrong way for a moment. When it is not making a mistake, it closes to about 130 pixels and swings, occasionally mixing in a jump in attack or a dash to cover a large gap in one go.

Defence is a guess rather than a reaction. The attack has 13 ticks of startup, which is faster than a human or a plausible AI can genuinely react to, so pretending to read the swing would be a lie. Instead it flips a coin the instant the opponent commits to an attack: about a third of the time it jumps, and if it happens to be cornered it will usually dash straight through the attacker to get off the wall. That dodge check runs every tick rather than on the decision timer, because a dodge that arrives 20 ticks late is not a dodge.

It faces the way it is walking, including while drifting the wrong way on a mistake, so a bad decision reads as a misjudgement rather than a moonwalk. It only turns to face the opponent when it is standing still.

## Under the hood

### The loop

The game runs on a fixed timestep. Simulation ticks at exactly 60 per second and rendering happens as often as the browser will allow, which keeps physics and frame data identical on a 60Hz laptop and a 144Hz monitor.

Time is accumulated between frames and drained one tick at a time. A single frame can produce zero, one, or several ticks. If the tab is backgrounded or the machine stalls, the elapsed time is capped at 250ms so the game catches up with a short burst instead of a thousand tick spiral.

### Drawing

Sprites are horizontal strips. Each one knows how many cells it has, and cell width is worked out from the image, so no sheet needs its dimensions hardcoded.

Every sprite tracks two directions: the way the art was drawn, and the way it currently needs to point. When those match it draws normally. When they differ it mirrors around its own bounding box rather than around the canvas origin, which is what keeps a flipped fighter standing in the same place instead of jumping across the screen. This is also why attack box offsets can be authored once for the direction the art faces. The code mirrors them automatically when the fighter turns.

One shot effects, currently just the puff of dust at the start of a dash, are the same sprite class with a flag. They play their strip once, mark themselves finished, and get dropped from the list on the next tick.

### The HUD

The health bars, the timer, and the centre text are DOM elements layered over the canvas with CSS, not drawn into it. That is why they stay sharp at any window size and why the screen shake never disturbs them.

Each bar is two copies of the same reference image. The empty pill sits underneath at full width, the full colour pill sits on top and its box narrows as health drops. The colour image is held at a fixed pixel width rather than a percentage, so shrinking the box reveals progressively less of the same unstretched art instead of squashing it. Both bars reveal from their own outer edge, so red is always what is left at low health regardless of which side of the screen the bar is on.

The bar images are set from JavaScript rather than CSS on purpose. Relative paths inside a stylesheet resolve against the built stylesheet's location, not the page's, which would break the "drop it on any subpath" property the rest of the asset paths rely on.

### Debug overlay

Backtick toggles it. You get a blue box around each body, a red box around each attack box that brightens during active frames, the current state printed above each fighter's head, and a readout in the corner showing ticks per second against the target, frames per second, and the total tick count. During an attack the state label also shows the phase and the exact tick you are on, which is the fastest way to check frame data by eye.

## Project layout

```
src/
  main.js              match flow, hit resolution, the tick and render passes
  core/
    canvas.js          the canvas element and its 2D context
    input.js           keyboard state and the player's key bindings
    loop.js            fixed timestep loop and the tick/fps counters
    viewport.js        scaling the stage to the window, fullscreen
  data/
    constants.js       stage size, physics, dash, timings
    moves.js           frame data, damage, hitstop, hitstun, knockback
    characters/        per character art, offsets, reach, cell mapping
  engine/
    fighter.js         the fighter: state, physics, locks, taking hits
    sprite.js          sheet animation and mirrored drawing
    states.js          the list of fighter states
    attackSchedule.js  builds the tick to cell lookup for an attack
    collision.js       attack box against body overlap test
    effect.js          play once sprites
    ai.js              the computer opponent
  ui/
    hud.js             health bars, clock, centre text, win logic
    debug.js           the debug overlay
public/img/            sprite sheets and UI art, copied to the build as is
```

## Where to change what

Most tuning does not need you to open the engine.

Damage, reach timing, hitstop, hitstun, and knockback all live in `src/data/moves.js`. Changing the phase lengths there automatically rebuilds each character's animation schedule, so you never have to line the art up by hand.

Walk speed, jump height, gravity, dash distance and cooldown, round length, and screen shake are all in `src/data/constants.js`.

Reach, sprite sheets, spawn position, and which cells belong to which attack phase are per character, in `src/data/characters/`.

Every AI trait is a named constant at the top of `src/engine/ai.js`. Raising `MISTAKE_CHANCE` or `PERCEPTION_NOISE` makes it sloppier, lowering them makes it sharper.

## Known quirks

The player's on screen name and the sprite set they use do not match, as described above.

Jumping ignores every lock, including hitstun, which is a deliberate choice and not a bug.

Both characters share one attack. The fighter class reads `moves.attack1` directly, so giving a character its own frame data means threading the move through rather than just adding a data file.

There is a legacy copy of the pre refactor game at the repository root in `index.js` and `js/`. Nothing imports it and it does not appear in the build. The root `img/` folder is likewise a stale duplicate of `public/img/`, which is the one that actually ships.
