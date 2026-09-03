import gsap from 'gsap'
import { ROUND_TIME } from '../data/constants.js'

const timerEl = document.querySelector('#timer')
const displayTextEl = document.querySelector('#displayText')
const playerHealthEl = document.querySelector('#playerHealth')
const enemyHealthEl = document.querySelector('#enemyHealth')

let timer = ROUND_TIME
let timerId

/**
 * Starts the round clock. Ticks once immediately, matching the original
 * behaviour where the displayed time drops by one as soon as the game loads.
 */
export function startTimer(onTimeout) {
  function decreaseTimer() {
    if (timer > 0) {
      timerId = setTimeout(decreaseTimer, 1000)
      timer--
      timerEl.innerHTML = timer
    }

    if (timer === 0) {
      onTimeout()
    }
  }

  decreaseTimer()
}

export function stopTimer() {
  clearTimeout(timerId)
}

export function setPlayerHealth(health) {
  gsap.to(playerHealthEl, { width: health + '%' })
}

export function setEnemyHealth(health) {
  gsap.to(enemyHealthEl, { width: health + '%' })
}

export function determineWinner({ player, enemy }) {
  stopTimer()
  displayTextEl.style.display = 'flex'

  if (player.health === enemy.health) {
    displayTextEl.innerHTML = 'Tie'
  } else if (player.health > enemy.health) {
    displayTextEl.innerHTML = 'Player 1 Wins'
  } else if (player.health < enemy.health) {
    displayTextEl.innerHTML = 'Player 2 Wins'
  }
}
