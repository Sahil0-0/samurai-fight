export const CANVAS_WIDTH = 1024
export const CANVAS_HEIGHT = 576

// Height of the ground strip painted into background.png. Fighters stand on
// top of it rather than on the bottom edge of the canvas.
export const FLOOR_HEIGHT = 96

export const FIGHTER_WIDTH = 50
export const FIGHTER_HEIGHT = 150

// y of the ground surface fighters stand on (576 - 96 = 480).
export const FLOOR_Y = CANVAS_HEIGHT - FLOOR_HEIGHT

// y of a grounded fighter's top-left corner (480 - 150 = 330). Previously a
// bare 330 literal, which silently broke if the canvas or fighter size changed.
export const GROUND_Y = FLOOR_Y - FIGHTER_HEIGHT

// NOTE: these are per-render-frame values, not per-second. That is why the game
// currently runs faster on high-refresh displays; the fixed timestep is the
// next phase of work.
export const GRAVITY = 0.7
export const WALK_SPEED = 5
export const JUMP_VELOCITY = -20

// Render frames each sprite cell is held for.
export const FRAMES_HOLD = 5

export const MAX_HEALTH = 100
export const ATTACK_DAMAGE = 20
export const ROUND_TIME = 60
