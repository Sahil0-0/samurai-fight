export function buildAttackSchedule(cellsByPhase, move) {
  const schedule = []

  for (const phase of ['startup', 'active', 'recovery']) {
    const cells = cellsByPhase[phase]
    const ticks = move[phase]
    const holdEach = Math.floor(ticks / cells.length)
    const remainder = ticks % cells.length

    cells.forEach((cell, i) => {
      const hold = holdEach + (i < remainder ? 1 : 0)
      for (let t = 0; t < hold; t++) schedule.push(cell)
    })
  }

  return schedule
}
