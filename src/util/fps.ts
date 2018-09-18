/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var fps = 0

var last = performance.now()
var count = 0

requestAnimationFrame(function measure() {
  requestAnimationFrame(measure)

  count++
  var now = performance.now()
  var elapsed = now - last

  if (elapsed < 1000)
    return

  fps = Math.round(count * 1000 / elapsed)
  last = now
  count = 0
})

export default function FPS() { return fps }
