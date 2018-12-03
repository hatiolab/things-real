/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { requestCustomAnimationFrame } from '../util/custom-animation-frame'

var fps = 0

var last = performance.now()
var count = 0

export function measure() {

  count++
  var now = performance.now()
  var elapsed = now - last

  if (elapsed < 1000)
    return

  fps = Math.round(count * 1000 / elapsed)
  last = now
  count = 0
}

requestCustomAnimationFrame(function repeat() {
  requestCustomAnimationFrame(repeat)

  measure()
})

export default function FPS() { return fps }
