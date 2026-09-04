import { ENEMY_SPAWN_X, FRAMES_HOLD } from '../constants.js'

export const kenji = {
  id: 'kenji',
  spawn: { x: ENEMY_SPAWN_X, y: 100 },
  facing: -1,
  scale: 2.5,
  offset: { x: 215, y: 167 },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4,
      framesHold: FRAMES_HOLD * 1.1
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4,
      cellsByPhase: { startup: [0], active: [1], recovery: [2, 3] }
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3,
      framesHold: FRAMES_HOLD * 1.4
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: { x: -170, y: 50 },
    width: 170,
    height: 50
  }
}
