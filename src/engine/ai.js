import { FighterState } from './states.js'
import { WALK_SPEED, FIGHTER_WIDTH, CANVAS_WIDTH } from '../data/constants.js'

const DECISION_INTERVAL_TICKS = 20
const DECISION_JITTER_TICKS = 4
const MISTAKE_CHANCE = 0.32

const ATTACK_RANGE_GAP = 130
const PERCEPTION_NOISE = 45

const JUMP_ATTACK_CHANCE = 0.15
const DASH_APPROACH_CHANCE = 0.12
const DODGE_CHANCE = 0.35
const DASH_ESCAPE_CHANCE = 0.45
const CORNER_MARGIN = FIGHTER_WIDTH * 1.5

export class FighterAI {
  constructor(fighter, opponent) {
    this.fighter = fighter
    this.opponent = opponent
    this.ticksUntilDecision = 0
    this.moveDir = 0
    this.shouldAttack = false
    this.wantsJumpApproach = false
    this.wantsDashApproach = false
    this.opponentWasAttacking = false
  }

  perceiveGap() {
    const { fighter, opponent } = this
    const actual = Math.abs(fighter.position.x - opponent.position.x) - FIGHTER_WIDTH
    return actual + (Math.random() * 2 - 1) * PERCEPTION_NOISE
  }

  directionToOpponent() {
    return this.opponent.position.x > this.fighter.position.x ? 1 : -1
  }

  tick() {
    const { fighter } = this

    this.maybeDodge()

    if (this.ticksUntilDecision > 0) {
      this.ticksUntilDecision--
    } else {
      this.decide()
    }

    if (fighter.isLocked) {
      fighter.velocity.x = 0
      return
    }

    fighter.velocity.x = this.moveDir * WALK_SPEED

    if (this.moveDir !== 0) {
      fighter.facing = this.moveDir
      fighter.setState(FighterState.WALK)
    } else {
      fighter.facing = this.directionToOpponent()
      fighter.setState(FighterState.IDLE)
    }

    if (fighter.velocity.y < 0) fighter.setState(FighterState.JUMP)
    else if (fighter.velocity.y > 0) fighter.setState(FighterState.FALL)

    if (this.wantsJumpApproach) {
      this.wantsJumpApproach = false
      fighter.jump()
    }
    if (this.wantsDashApproach) {
      this.wantsDashApproach = false
      fighter.dash(this.directionToOpponent())
    }
    if (this.shouldAttack) {
      this.shouldAttack = false
      fighter.attack()
    }
  }

  decide() {
    this.ticksUntilDecision =
      DECISION_INTERVAL_TICKS + (Math.random() * 2 - 1) * DECISION_JITTER_TICKS

    const gap = this.perceiveGap()
    const inRange = gap <= ATTACK_RANGE_GAP
    const mistake = Math.random() < MISTAKE_CHANCE
    const towardOpponent = this.directionToOpponent()

    this.wantsJumpApproach = !mistake && Math.random() < JUMP_ATTACK_CHANCE
    this.wantsDashApproach =
      !mistake && !inRange && Math.random() < DASH_APPROACH_CHANCE

    this.shouldAttack =
      (inRange || this.wantsJumpApproach || this.wantsDashApproach) && !mistake
    this.moveDir = inRange ? 0 : towardOpponent * (mistake ? -1 : 1)
  }

  maybeDodge() {
    const { fighter, opponent } = this
    const justStartedSwinging =
      opponent.state === FighterState.ATTACK && !this.opponentWasAttacking
    this.opponentWasAttacking = opponent.state === FighterState.ATTACK

    if (!justStartedSwinging || fighter.isLocked) return
    if (this.perceiveGap() > ATTACK_RANGE_GAP) return

    const nearLeftEdge = fighter.position.x < CORNER_MARGIN
    const nearRightEdge =
      fighter.position.x > CANVAS_WIDTH - fighter.width - CORNER_MARGIN

    if ((nearLeftEdge || nearRightEdge) && Math.random() < DASH_ESCAPE_CHANCE) {
      fighter.dash(this.directionToOpponent())
      return
    }

    if (Math.random() < DODGE_CHANCE) fighter.jump()
  }
}
