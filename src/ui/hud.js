import { ROUND_TIME, TICK_RATE } from '../data/constants.js'

const PLAYER_NAME = 'Kenji'
const ENEMY_NAME = 'Azuki'

const HEALTH_BAR_EMPTY_IMAGE = "url('./img/health-bar-empty.png')"
const HEALTH_BAR_FULL_IMAGE = "url('./img/health-bar-full.png')"

const timerEl = document.querySelector('#timer')
const displayTextEl = document.querySelector('#displayText')
const playerHealthEl = document.querySelector('#playerHealth')
const enemyHealthEl = document.querySelector('#enemyHealth')
const trackEls = document.querySelectorAll('.health-bar__track')
const playerNameEl = document.querySelector('#playerName')
const enemyNameEl = document.querySelector('#enemyName')

playerNameEl.textContent = PLAYER_NAME
enemyNameEl.textContent = ENEMY_NAME

for (const trackEl of trackEls) {
  trackEl.style.backgroundImage = HEALTH_BAR_EMPTY_IMAGE
}
playerHealthEl.style.backgroundImage = HEALTH_BAR_FULL_IMAGE
enemyHealthEl.style.backgroundImage = HEALTH_BAR_FULL_IMAGE

let secondsLeft = ROUND_TIME
let ticksUntilNextSecond = TICK_RATE
let running = false
let onTimeout = () => {}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainder = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainder}`
}

export function startTimer(onRoundTimeout) {
  resetTimerDisplay()
  onTimeout = onRoundTimeout
  running = true
}

export function resetTimerDisplay() {
  secondsLeft = ROUND_TIME
  ticksUntilNextSecond = TICK_RATE
  timerEl.textContent = formatTime(secondsLeft)
}

export function stopTimer() {
  running = false
}

export function tickTimer() {
  if (!running) return

  ticksUntilNextSecond--
  if (ticksUntilNextSecond > 0) return

  ticksUntilNextSecond = TICK_RATE
  secondsLeft--
  timerEl.textContent = formatTime(secondsLeft)

  if (secondsLeft <= 0) {
    running = false
    onTimeout()
  }
}

export function setPlayerHealth(health) {
  playerHealthEl.style.width = `${health}%`
}

export function setEnemyHealth(health) {
  enemyHealthEl.style.width = `${health}%`
}

export function determineWinner({ player, enemy }) {
  stopTimer()
  if (player.health === enemy.health) return 'Tie'
  return player.health > enemy.health ? PLAYER_NAME : ENEMY_NAME
}

export function showCenterText(main, sub = '') {
  displayTextEl.style.display = 'flex'
  displayTextEl.innerHTML = sub
    ? `<div class="result-text__main">${main}</div><div class="result-text__sub">${sub}</div>`
    : main
}

export function hideCenterText() {
  displayTextEl.style.display = 'none'
}
