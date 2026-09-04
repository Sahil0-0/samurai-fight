import { c, canvas } from './core/canvas.js'
import { keys, setupInput, setControlsEnabled } from './core/input.js'
import { startLoop } from './core/loop.js'
import { setupViewport } from './core/viewport.js'
import { rectangularCollision } from './engine/collision.js'
import { Fighter } from './engine/fighter.js'
import { FighterAI } from './engine/ai.js'
import { Effect } from './engine/effect.js'
import { Sprite } from './engine/sprite.js'
import { FighterState } from './engine/states.js'
import { kenji } from './data/characters/kenji.js'
import { samuraiMack } from './data/characters/samuraiMack.js'
import { moves } from './data/moves.js'
import {
  CANVAS_WIDTH,
  FRAMES_HOLD,
  SHAKE_MAGNITUDE,
  SHAKE_TICKS,
  WALK_SPEED
} from './data/constants.js'
import { drawDebugOverlay, setupDebugReadout } from './ui/debug.js'
import {
  determineWinner,
  hideCenterText,
  resetTimerDisplay,
  setEnemyHealth,
  setPlayerHealth,
  showCenterText,
  startTimer,
  tickTimer
} from './ui/hud.js'

const MatchState = Object.freeze({
  READY: 'ready',
  RESPAWNING: 'respawning',
  COUNTDOWN: 'countdown',
  FIGHTING: 'fighting',
  ROUND_OVER: 'roundOver'
})

const COUNTDOWN_STAGES = ['1', '2', 'Fight']
const COUNTDOWN_STAGE_TICKS = 45

const DASH_EFFECT_CELL = 64
const DASH_EFFECT_SCALE = 3.5

const START_KEY = 'enter'
const REPLAY_KEY = 'r'

setupViewport()

c.fillRect(0, 0, canvas.width, canvas.height)

const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: { x: 600, y: 128 },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6,
  framesHold: FRAMES_HOLD * 3
})

function createFighter(character) {
  return new Fighter({
    position: { ...character.spawn },
    velocity: { x: 0, y: 0 },
    imageSrc: character.imageSrc,
    framesMax: character.framesMax,
    scale: character.scale,
    offset: { ...character.offset },
    facing: character.facing,
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
const enemyAI = new FighterAI(enemy, player)

let effects = []
let matchState = MatchState.READY
let countdownStageIndex = 0
let countdownTicksLeft = 0
let hitstopTicksLeft = 0
let shakeTicksLeft = 0
let playerWasDashing = false
let enemyWasDashing = false

function spawnDashEffect(fighter) {
  const effect = new Effect({
    position: {
      x: fighter.position.x + fighter.width / 2,
      y: fighter.position.y + fighter.height
    },
    imageSrc: './img/dash-smoke.png',
    framesMax: 8,
    scale: DASH_EFFECT_SCALE
  })
  effect.offset = {
    x: (DASH_EFFECT_CELL * DASH_EFFECT_SCALE) / 2,
    y: DASH_EFFECT_CELL * DASH_EFFECT_SCALE
  }
  effect.facing = -fighter.facing
  effects.push(effect)
}

function bothLanded() {
  return player.isGrounded && enemy.isGrounded
}

function startCountdown() {
  matchState = MatchState.COUNTDOWN
  countdownStageIndex = 0
  countdownTicksLeft = COUNTDOWN_STAGE_TICKS
  showCenterText(COUNTDOWN_STAGES[0])
}

function advanceCountdown() {
  countdownTicksLeft--
  if (countdownTicksLeft > 0) return

  countdownStageIndex++
  if (countdownStageIndex >= COUNTDOWN_STAGES.length) {
    beginFight()
    return
  }
  countdownTicksLeft = COUNTDOWN_STAGE_TICKS
  showCenterText(COUNTDOWN_STAGES[countdownStageIndex])
}

function beginFight() {
  matchState = MatchState.FIGHTING
  hideCenterText()
  setControlsEnabled(true)
  startTimer(endRound)
}

function endRound() {
  if (matchState !== MatchState.FIGHTING) return
  matchState = MatchState.ROUND_OVER
  setControlsEnabled(false)
  const winner = determineWinner({ player, enemy })
  showCenterText(
    winner === 'Tie' ? 'Tie' : `${winner} Wins`,
    'Press R to Fight Again'
  )
}

function resetForNextRound() {
  player.reset(samuraiMack.spawn)
  enemy.reset(kenji.spawn)
  setPlayerHealth(player.health)
  setEnemyHealth(enemy.health)
  keys.a.pressed = false
  keys.d.pressed = false
  effects = []
  hitstopTicksLeft = 0
  shakeTicksLeft = 0
  playerWasDashing = false
  enemyWasDashing = false
  hideCenterText()
  resetTimerDisplay()
  matchState = MatchState.RESPAWNING
}

function detectHit(attacker, defender) {
  if (attacker.attackResolved || !attacker.isAttackActive) return false
  if (defender.isDashing) return false
  return rectangularCollision({ rectangle1: attacker, rectangle2: defender })
}

function applyHit(attacker, defender, setDefenderHealth) {
  attacker.attackResolved = true
  defender.takeHit(moves.attack1.damage, moves.attack1.knockback, attacker.facing)
  setDefenderHealth(defender.health)

  hitstopTicksLeft = moves.attack1.hitstop
  shakeTicksLeft = SHAKE_TICKS
}

function resolveHits() {
  const playerConnects = detectHit(player, enemy)
  const enemyConnects = detectHit(enemy, player)

  if (playerConnects) applyHit(player, enemy, setEnemyHealth)
  if (enemyConnects) applyHit(enemy, player, setPlayerHealth)
}

function clampToStage(fighter, x) {
  return Math.min(Math.max(x, 0), CANVAS_WIDTH - fighter.width)
}

function separateFighters(a, b) {
  const overlapX =
    Math.min(a.position.x + a.width, b.position.x + b.width) -
    Math.max(a.position.x, b.position.x)
  const overlapY =
    Math.min(a.position.y + a.height, b.position.y + b.height) -
    Math.max(a.position.y, b.position.y)

  if (overlapX <= 0 || overlapY <= 0) return

  const left = a.position.x < b.position.x ? a : b
  const right = left === a ? b : a
  const half = overlapX / 2

  const leftWanted = left.position.x - half
  const rightWanted = right.position.x + half
  const leftX = clampToStage(left, leftWanted)
  const rightX = clampToStage(right, rightWanted)

  const leftBlocked = leftX - leftWanted
  const rightBlocked = rightWanted - rightX

  left.position.x = clampToStage(left, leftX - rightBlocked)
  right.position.x = clampToStage(right, rightX + leftBlocked)

  left.syncAttackBox()
  right.syncAttackBox()
}

function updateMovement(fighter, { left, right, leftKey, rightKey }) {
  fighter.velocity.x = 0
  if (fighter.isLocked) return

  if (left.pressed && fighter.lastKey === leftKey) {
    fighter.velocity.x = -WALK_SPEED
    fighter.facing = -1
    fighter.setState(FighterState.WALK)
  } else if (right.pressed && fighter.lastKey === rightKey) {
    fighter.velocity.x = WALK_SPEED
    fighter.facing = 1
    fighter.setState(FighterState.WALK)
  } else {
    fighter.setState(FighterState.IDLE)
  }

  if (fighter.velocity.y < 0) {
    fighter.setState(FighterState.JUMP)
  } else if (fighter.velocity.y > 0) {
    fighter.setState(FighterState.FALL)
  }
}

function settleWhenIdle(fighter) {
  fighter.velocity.x = 0
  if (fighter.isLocked) return
  fighter.setState(fighter.isGrounded ? FighterState.IDLE : FighterState.FALL)
}

function tick() {
  background.tick()
  shop.tick()

  if (shakeTicksLeft > 0) shakeTicksLeft--

  if (hitstopTicksLeft > 0) {
    hitstopTicksLeft--
  } else {
    player.tick()
    enemy.tick()

    if (!player.isDashing && !enemy.isDashing) {
      separateFighters(player, enemy)
    }

    if (matchState === MatchState.FIGHTING) {
      updateMovement(player, {
        left: keys.a,
        right: keys.d,
        leftKey: 'a',
        rightKey: 'd'
      })
      enemyAI.tick()

      resolveHits()

      if (player.isDashing && !playerWasDashing) spawnDashEffect(player)
      if (enemy.isDashing && !enemyWasDashing) spawnDashEffect(enemy)
      playerWasDashing = player.isDashing
      enemyWasDashing = enemy.isDashing
    } else {
      settleWhenIdle(player)
      settleWhenIdle(enemy)
    }
  }

  for (const effect of effects) effect.tick()
  effects = effects.filter((effect) => !effect.finished)

  if (matchState === MatchState.READY && bothLanded()) {
    showCenterText('Press Enter to Start')
  }

  if (matchState === MatchState.RESPAWNING && bothLanded()) {
    startCountdown()
  }

  if (matchState === MatchState.COUNTDOWN) {
    advanceCountdown()
  }

  tickTimer()

  if (
    matchState === MatchState.FIGHTING &&
    (enemy.health <= 0 || player.health <= 0)
  ) {
    endRound()
  }
}

function render() {
  c.save()

  if (shakeTicksLeft > 0) {
    c.translate(
      (Math.random() * 2 - 1) * SHAKE_MAGNITUDE,
      (Math.random() * 2 - 1) * SHAKE_MAGNITUDE
    )
  }

  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.draw()
  shop.draw()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.draw()
  enemy.draw()
  for (const effect of effects) effect.draw()
  drawDebugOverlay({ player, enemy })

  c.restore()
}

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return

  const key = event.key.toLowerCase()

  if (matchState === MatchState.READY && key === START_KEY) {
    if (bothLanded()) startCountdown()
  } else if (matchState === MatchState.ROUND_OVER && key === REPLAY_KEY) {
    resetForNextRound()
  }
})

setupInput({ player })
setupDebugReadout()
resetTimerDisplay()
startLoop({ tick, render })
