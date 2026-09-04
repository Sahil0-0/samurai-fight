import { Sprite } from './sprite.js'

export class Effect extends Sprite {
  constructor(args) {
    super(args)
    this.finished = false
  }

  tick() {
    if (this.finished) return

    this.framesElapsed++
    if (this.framesElapsed % this.framesHold !== 0) return

    if (this.framesCurrent < this.framesMax - 1) {
      this.framesCurrent++
    } else {
      this.finished = true
    }
  }
}
