import { c } from '../core/canvas.js'
import { FRAMES_HOLD } from '../data/constants.js'

export class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    framesHold = FRAMES_HOLD
  }) {
    this.position = position
    this.image = new Image()
    this.image.src = imageSrc
    this.scale = scale
    this.framesMax = framesMax
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = framesHold
    this.offset = offset
    this.facing = 1
    this.nativeFacing = 1
  }

  draw() {
    const cellWidth = this.image.width / this.framesMax
    const drawWidth = cellWidth * this.scale
    const drawHeight = this.image.height * this.scale
    const dx = this.position.x - this.offset.x
    const dy = this.position.y - this.offset.y

    if (this.facing === this.nativeFacing) {
      c.drawImage(
        this.image,
        this.framesCurrent * cellWidth,
        0,
        cellWidth,
        this.image.height,
        dx,
        dy,
        drawWidth,
        drawHeight
      )
      return
    }

    c.save()
    c.scale(-1, 1)
    c.drawImage(
      this.image,
      this.framesCurrent * cellWidth,
      0,
      cellWidth,
      this.image.height,
      -dx - drawWidth,
      dy,
      drawWidth,
      drawHeight
    )
    c.restore()
  }

  animateFrames() {
    this.framesElapsed++

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++
      } else {
        this.framesCurrent = 0
      }
    }
  }

  tick() {
    this.animateFrames()
  }
}
