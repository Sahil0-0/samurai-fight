import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/constants.js'

export const canvas = document.querySelector('canvas')
export const c = canvas.getContext('2d')

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT
