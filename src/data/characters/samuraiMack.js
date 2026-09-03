/**
 * Player 1. Every sheet is an N x 200 strip of 200x200 cells.
 *
 * Attack2.png (6 cells) exists on disk but is not wired up yet.
 */
export const samuraiMack = {
  id: 'samuraiMack',
  spawn: { x: 0, y: 0 },
  scale: 2.5,
  // Nudges the drawn sprite so the 200x200 art lines up with the 50x150 body.
  offset: { x: 215, y: 157 },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  }
}
