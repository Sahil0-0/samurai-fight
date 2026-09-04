import { c } from '../core/canvas.js'
import { clock } from '../core/loop.js'
import { FighterState } from '../engine/states.js'
import { moves } from '../data/moves.js'
import { TICK_RATE } from '../data/constants.js'

const READOUT_INTERVAL_MS = 250
const BODY_COLOR = '#7dd3fc'
const HITBOX_ACTIVE_COLOR = '#f87171'
const HITBOX_IDLE_COLOR = 'rgba(248, 113, 113, 0.35)'

const debugEl = document.querySelector('#debug')

let visible = false

export function setupDebugReadout() {
  if (!debugEl) return

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key !== '`') return

    visible = !visible
    debugEl.hidden = !visible
  })

  setInterval(() => {
    if (!visible) return

    const drift = clock.ticksPerSecond - TICK_RATE
    const driftLabel = drift === 0 ? '' : ` (${drift > 0 ? '+' : ''}${drift})`
    debugEl.textContent =
      `tps ${clock.ticksPerSecond}/${TICK_RATE}${driftLabel}` +
      `  fps ${clock.framesPerSecond}  tick ${clock.tick}`
  }, READOUT_INTERVAL_MS)
}

function attackPhase(fighter) {
  if (fighter.state !== FighterState.ATTACK) return null
  const { startup, active } = moves.attack1
  if (fighter.attackElapsedTicks < startup) return 'startup'
  if (fighter.attackElapsedTicks < startup + active) return 'active'
  return 'recovery'
}

export function drawDebugOverlay({ player, enemy }) {
  if (!visible) return

  for (const fighter of [player, enemy]) {
    c.lineWidth = 2

    c.strokeStyle = BODY_COLOR
    c.strokeRect(
      fighter.position.x,
      fighter.position.y,
      fighter.width,
      fighter.height
    )

    c.strokeStyle = fighter.isAttackActive ? HITBOX_ACTIVE_COLOR : HITBOX_IDLE_COLOR
    c.strokeRect(
      fighter.attackBox.position.x,
      fighter.attackBox.position.y,
      fighter.attackBox.width,
      fighter.attackBox.height
    )

    const phase = attackPhase(fighter)
    const label = phase
      ? `${fighter.state} ${phase} t${fighter.attackElapsedTicks}`
      : fighter.state

    c.font = '10px monospace'
    c.fillStyle = BODY_COLOR
    c.fillText(label, fighter.position.x, fighter.position.y - 6)
  }
}
