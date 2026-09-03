/**
 * Player 2. Every sheet is an N x 200 strip of 200x200 cells.
 *
 * Attack2.png (4 cells) exists on disk but is not wired up yet.
 *
 * NOTE: Kenji's attack1 sheet has 4 cells to Mack's 6. Because hit detection is
 * currently keyed to a sprite cell index, that makes his attack land roughly
 * 167ms sooner than Mack's - an unintended balance advantage that the
 * frame-data phase is meant to remove.
 */
export const kenji = {
  id: 'kenji',
  spawn: { x: 400, y: 100 },
  scale: 2.5,
  // Nudges the drawn sprite so the 200x200 art lines up with the 50x150 body.
  offset: { x: 215, y: 167 },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  }
}
