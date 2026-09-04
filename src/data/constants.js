export const CANVAS_WIDTH = 1024
export const CANVAS_HEIGHT = 576

export const FLOOR_HEIGHT = 96 

export const FIGHTER_WIDTH = 50
export const FIGHTER_HEIGHT = 150

export const FLOOR_Y = CANVAS_HEIGHT - FLOOR_HEIGHT
export const GROUND_Y = FLOOR_Y - FIGHTER_HEIGHT

export const TICK_RATE = 60
export const TICK_MS = 1000 / TICK_RATE
export const MAX_FRAME_MS = 250

export const GRAVITY = 0.7
export const WALK_SPEED = 5
export const JUMP_VELOCITY = -20

export const DASH_SPEED = 25
export const DASH_DURATION_TICKS = 8
export const GROUND_DASH_DURATION_TICKS = 14
export const DASH_COOLDOWN_TICKS = 60

export const FRAMES_HOLD = 5

export const SPAWN_GAP = 350

export const PLAYER_SPAWN_X = CANVAS_WIDTH / 2 - SPAWN_GAP / 2 - FIGHTER_WIDTH
export const ENEMY_SPAWN_X = CANVAS_WIDTH / 2 + SPAWN_GAP / 2

export const MAX_HEALTH = 100
export const ROUND_TIME = 150

export const SHAKE_TICKS = 10
export const SHAKE_MAGNITUDE = 4
