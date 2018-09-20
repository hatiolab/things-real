/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export var PIXEL_RATIO = (function () {
  var ctx: any = document.createElement('canvas').getContext('2d'),
    dpr = window.devicePixelRatio || 1,
    bsr = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1
  return dpr / bsr
})()

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  let canvas = document.createElement('canvas')

  canvas.width = width * PIXEL_RATIO
  canvas.height = height * PIXEL_RATIO
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  return canvas
}
