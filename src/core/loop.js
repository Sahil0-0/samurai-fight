import { MAX_FRAME_MS, TICK_MS } from '../data/constants.js'

export const clock = {
  tick: 0,
  ticksPerSecond: 0,
  framesPerSecond: 0
}

export function startLoop({ tick, render }) {
  let previous = performance.now()
  let accumulator = 0

  let sampledAt = previous
  let ticksInSample = 0
  let framesInSample = 0

  function frame(now) {
    window.requestAnimationFrame(frame)

    const elapsed = Math.min(now - previous, MAX_FRAME_MS)
    previous = now
    accumulator += elapsed

    while (accumulator >= TICK_MS) {
      tick()
      accumulator -= TICK_MS
      clock.tick++
      ticksInSample++
    }

    render()
    framesInSample++

    const sampleAge = now - sampledAt
    if (sampleAge >= 1000) {
      clock.ticksPerSecond = Math.round((ticksInSample * 1000) / sampleAge)
      clock.framesPerSecond = Math.round((framesInSample * 1000) / sampleAge)
      sampledAt = now
      ticksInSample = 0
      framesInSample = 0
    }
  }

  window.requestAnimationFrame(frame)
}
