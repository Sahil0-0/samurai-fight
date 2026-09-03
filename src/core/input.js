import { JUMP_VELOCITY } from '../data/constants.js'

/**
 * Which movement keys are currently held. Read by the game loop each frame.
 */
export const keys = {
  a: { pressed: false },
  d: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowLeft: { pressed: false }
}

/**
 * Wires the keyboard to the two fighters.
 *
 * Still hardcoded per player, as in the original. Replacing this with a
 * per-fighter intent map is what will later let an AI drive a fighter through
 * the same path a human does.
 */
export function setupInput({ player, enemy }) {
  window.addEventListener('keydown', (event) => {
    if (!player.dead) {
      switch (event.key) {
        case 'd':
          keys.d.pressed = true
          player.lastKey = 'd'
          break
        case 'a':
          keys.a.pressed = true
          player.lastKey = 'a'
          break
        case 'w':
          player.velocity.y = JUMP_VELOCITY
          break
        case ' ':
          player.attack()
          break
      }
    }

    if (!enemy.dead) {
      switch (event.key) {
        case 'ArrowRight':
          keys.ArrowRight.pressed = true
          enemy.lastKey = 'ArrowRight'
          break
        case 'ArrowLeft':
          keys.ArrowLeft.pressed = true
          enemy.lastKey = 'ArrowLeft'
          break
        case 'ArrowUp':
          enemy.velocity.y = JUMP_VELOCITY
          break
        case 'ArrowDown':
          enemy.attack()
          break
      }
    }
  })

  window.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'd':
        keys.d.pressed = false
        break
      case 'a':
        keys.a.pressed = false
        break
    }

    // enemy keys
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = false
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = false
        break
    }
  })
}
