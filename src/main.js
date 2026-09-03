import { c, canvas } from './core/canvas.js'
import { keys, setupInput } from './core/input.js'
import { rectangularCollision } from './engine/collision.js'
import { Fighter } from './engine/fighter.js'
import { Sprite } from './engine/sprite.js'
import { kenji } from './data/characters/kenji.js'
import { samuraiMack } from './data/characters/samuraiMack.js'
import { WALK_SPEED } from './data/constants.js'
import {
  determineWinner,
  setEnemyHealth,
  setPlayerHealth,
  startTimer
} from './ui/hud.js'

c.fillRect(0, 0, canvas.width, canvas.height)

const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: { x: 600, y: 128 },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

function createFighter(character) {
  return new Fighter({
    position: { ...character.spawn },
    velocity: { x: 0, y: 0 },
    imageSrc: character.imageSrc,
    framesMax: character.framesMax,
    scale: character.scale,
    offset: { ...character.offset },
    sprites: character.sprites,
    attackBox: {
      offset: { ...character.attackBox.offset },
      width: character.attackBox.width,
      height: character.attackBox.height
    }
  })
}

const player = createFighter(samuraiMack)
const enemy = createFighter(kenji)

setupInput({ player, enemy })
startTimer(() => determineWinner({ player, enemy }))

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -WALK_SPEED
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = WALK_SPEED
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -WALK_SPEED
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = WALK_SPEED
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // NOTE: the `framesCurrent === 4` / `=== 2` checks below are sprite cell
  // indices, not frame data. Because the two attack sheets have different cell
  // counts, this is what makes Kenji's attack land sooner than Mack's. Left
  // as-is here deliberately; the frame-data phase replaces it.

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false
    setEnemyHealth(enemy.health)
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false
    setPlayerHealth(player.health)
  }

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy })
  }
}

animate()
