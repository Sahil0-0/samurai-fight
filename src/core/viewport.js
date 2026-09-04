import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/constants.js'

const stage = document.querySelector('.stage')

function isFullscreen() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement)
}

function fitToViewport() {
  const scale = Math.min(
    window.innerWidth / CANVAS_WIDTH,
    window.innerHeight / CANVAS_HEIGHT
  )

  stage.style.setProperty('--stage-scale', scale)
}

export function toggleFullscreen() {
  if (isFullscreen()) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen
    exit?.call(document)
    return
  }

  const root = document.documentElement
  const request = root.requestFullscreen || root.webkitRequestFullscreen
  request?.call(root)?.catch?.(() => {})
}

export function setupViewport() {
  stage.style.width = `${CANVAS_WIDTH}px`
  stage.style.height = `${CANVAS_HEIGHT}px`

  fitToViewport()

  window.addEventListener('resize', fitToViewport)
  window.addEventListener('orientationchange', () => setTimeout(fitToViewport, 100))

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return

    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault()
      toggleFullscreen()
    }
  })

  stage.addEventListener('dblclick', toggleFullscreen)

  const onFullscreenChange = () => {
    document.body.classList.toggle('is-fullscreen', isFullscreen())
  }

  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
}
