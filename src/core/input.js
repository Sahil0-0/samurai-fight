export const keys = {
  a: { pressed: false },
  d: { pressed: false }
}

let controlsEnabled = false

export function setControlsEnabled(value) {
  controlsEnabled = value
}

export function setupInput({ player }) {
  window.addEventListener('keydown', (event) => {
    if (player.dead || !controlsEnabled) return

    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.jump()
        break
      case ' ':
        player.attack()
        break
      case 'q':
        player.dash(-1)
        break
      case 'e':
        player.dash(1)
        break
    }
  })

  window.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'd':
        keys.d.pressed = false
        if (keys.a.pressed) player.lastKey = 'a'
        break
      case 'a':
        keys.a.pressed = false
        if (keys.d.pressed) player.lastKey = 'd'
        break
    }
  })
}
