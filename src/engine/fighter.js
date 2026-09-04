import { Sprite } from './sprite.js'
import { FighterState } from './states.js'
import { buildAttackSchedule } from './attackSchedule.js'
import { moves } from '../data/moves.js'
import {
  CANVAS_WIDTH,
  DASH_COOLDOWN_TICKS,
  DASH_DURATION_TICKS,
  DASH_SPEED,
  FIGHTER_HEIGHT,
  FIGHTER_WIDTH,
  FLOOR_Y,
  FRAMES_HOLD,
  GRAVITY,
  GROUND_DASH_DURATION_TICKS,
  GROUND_Y,
  JUMP_VELOCITY,
  MAX_HEALTH
} from '../data/constants.js'

const STATE_ANIMATION = {
  [FighterState.IDLE]: 'idle',
  [FighterState.WALK]: 'run',
  [FighterState.JUMP]: 'jump',
  [FighterState.FALL]: 'fall',
  [FighterState.DASH]: 'run',
  [FighterState.HITSTUN]: 'takeHit',
  [FighterState.DEATH]: 'death'
}

const LOCKING_STATES = new Set([FighterState.DEATH])

const ATTACK_TOTAL_TICKS =
  moves.attack1.startup + moves.attack1.active + moves.attack1.recovery

const ALWAYS_INTERRUPTS = new Set([FighterState.DEATH, FighterState.HITSTUN])

export class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined },
    facing = 1
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset
    })

    this.velocity = velocity
    this.width = FIGHTER_WIDTH
    this.height = FIGHTER_HEIGHT
    this.lastKey = undefined
    this.nativeFacing = facing
    this.facing = facing
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height
    }
    this.health = MAX_HEALTH
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = FRAMES_HOLD
    this.dead = false
    this.state = FighterState.IDLE
    this.attackElapsedTicks = 0
    this.attackResolved = false
    this.isGrounded = false
    this.knockbackTicksLeft = 0
    this.knockbackPerTick = 0
    this.dashTicksLeft = 0
    this.dashPerTick = 0
    this.dashCooldownTicksLeft = 0
    this.hitstunTicksLeft = 0

    this.sprites = {}
    for (const name in sprites) {
      const image = new Image()
      image.src = sprites[name].imageSrc
      this.sprites[name] = { ...sprites[name], image }
    }

    this.attackSchedule = buildAttackSchedule(
      sprites.attack1.cellsByPhase,
      moves.attack1
    )

    this.syncAttackBox()
  }

  tick() {
    if (!this.dead) {
      if (this.state === FighterState.ATTACK) {
        this.attackElapsedTicks = Math.min(
          this.attackElapsedTicks + 1,
          this.attackSchedule.length - 1
        )
        this.framesCurrent = this.attackSchedule[this.attackElapsedTicks]
      } else {
        this.animateFrames()
      }
    }

    if (
      this.state === FighterState.DEATH &&
      this.framesCurrent === this.framesMax - 1
    ) {
      this.dead = true
    }

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.knockbackTicksLeft > 0) {
      this.position.x += this.knockbackPerTick
      this.knockbackTicksLeft--
    }

    if (this.dashTicksLeft > 0) {
      this.position.x += this.dashPerTick
      this.dashTicksLeft--
    }
    if (this.dashCooldownTicksLeft > 0) this.dashCooldownTicksLeft--
    if (this.hitstunTicksLeft > 0) this.hitstunTicksLeft--

    this.position.x = Math.min(
      Math.max(this.position.x, 0),
      CANVAS_WIDTH - this.width
    )

    if (this.position.y + this.height + this.velocity.y >= FLOOR_Y) {
      this.velocity.y = 0
      this.position.y = GROUND_Y
      this.isGrounded = true
    } else {
      this.velocity.y += GRAVITY
      this.isGrounded = false
    }

    this.syncAttackBox()
  }

  syncAttackBox() {
    this.attackBox.position.x =
      this.facing === this.nativeFacing
        ? this.position.x + this.attackBox.offset.x
        : this.position.x +
          this.width -
          this.attackBox.offset.x -
          this.attackBox.width
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y
  }

  attack() {
    this.setState(FighterState.ATTACK)
  }

  jump() {
    if (!this.isGrounded) return
    this.velocity.y = JUMP_VELOCITY
  }

  dash(direction) {
    if (this.isLocked || this.dashCooldownTicksLeft > 0) return
    this.dashTicksLeft = this.isGrounded
      ? GROUND_DASH_DURATION_TICKS
      : DASH_DURATION_TICKS
    this.dashPerTick = DASH_SPEED * direction
    this.dashCooldownTicksLeft = DASH_COOLDOWN_TICKS
    this.facing = direction
    this.setState(FighterState.DASH)
  }

  reset(spawn) {
    this.position.x = spawn.x
    this.position.y = spawn.y
    this.velocity.x = 0
    this.velocity.y = 0
    this.lastKey = undefined
    this.facing = this.nativeFacing
    this.health = MAX_HEALTH
    this.dead = false
    this.state = FighterState.IDLE
    this.attackElapsedTicks = 0
    this.attackResolved = false
    this.isGrounded = false
    this.knockbackTicksLeft = 0
    this.knockbackPerTick = 0
    this.dashTicksLeft = 0
    this.dashPerTick = 0
    this.dashCooldownTicksLeft = 0
    this.hitstunTicksLeft = 0

    const idle = this.sprites.idle
    this.image = idle.image
    this.framesMax = idle.framesMax
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = idle.framesHold ?? FRAMES_HOLD

    this.syncAttackBox()
  }

  takeHit(damage, knockback, attackerFacing) {
    this.health = Math.max(this.health - damage, 0)
    this.knockbackTicksLeft = knockback.ticks
    this.knockbackPerTick = knockback.x * attackerFacing
    this.velocity.y = knockback.y

    if (this.health <= 0) {
      this.setState(FighterState.DEATH)
      return
    }

    this.hitstunTicksLeft = moves.attack1.hitstun
    this.setState(FighterState.HITSTUN)
  }

  get isAttackActive() {
    return (
      this.state === FighterState.ATTACK &&
      this.attackElapsedTicks >= moves.attack1.startup &&
      this.attackElapsedTicks < moves.attack1.startup + moves.attack1.active
    )
  }

  get isDashing() {
    return this.state === FighterState.DASH
  }

  get isLocked() {
    if (this.state === FighterState.ATTACK) {
      return this.attackElapsedTicks < ATTACK_TOTAL_TICKS - 1
    }
    if (this.state === FighterState.DASH) {
      return this.dashTicksLeft > 0
    }
    if (this.state === FighterState.HITSTUN) {
      return this.hitstunTicksLeft > 0
    }
    if (!LOCKING_STATES.has(this.state)) return false
    const anim = this.sprites[STATE_ANIMATION[this.state]]
    return this.framesCurrent < anim.framesMax - 1
  }

  setState(state) {
    if (this.state === state) return
    if (this.state === FighterState.DEATH) return
    if (this.isLocked && !ALWAYS_INTERRUPTS.has(state)) return

    this.state = state

    if (state === FighterState.ATTACK) {
      this.attackElapsedTicks = 0
      this.attackResolved = false
      this.image = this.sprites.attack1.image
      this.framesMax = this.sprites.attack1.framesMax
      this.framesCurrent = this.attackSchedule[0]
      this.framesHold = this.sprites.attack1.framesHold ?? FRAMES_HOLD
      return
    }

    const anim = this.sprites[STATE_ANIMATION[state]]
    this.image = anim.image
    this.framesMax = anim.framesMax
    this.framesCurrent = 0
    this.framesHold = anim.framesHold ?? FRAMES_HOLD
  }
}
