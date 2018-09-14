/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export function createOffcanvas(width: number, height: number): HTMLCanvasElement {
  let canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}
