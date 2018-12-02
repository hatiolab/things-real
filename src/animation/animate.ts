/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as Delta from './delta'
import { requestVRAnimationFrame } from '../util/custom-animation-frame'

function makeEaseOut(delta, options) {
  return function (progress) {
    return 1 - delta(1 - progress, options)
  }
}

function makeEaseInOut(delta, options) {
  return function (progress) {
    if (progress < 0.5) return delta(2 * progress, options) / 2
    else return (2 - delta(2 * (1 - progress), options)) / 2
  }
}

export default function animate(config) {
  var {
    duration = 1000 /* 1 sec by default */,
    delay = 30,
    step /* step function */,
    delta /* delta function */,
    ease /* ease function */,
    options,
    repeat = false
  } = config

  if (typeof delta === 'string') delta = Delta[delta]

  if (ease == 'out') delta = makeEaseOut(delta, options)
  else if (ease == 'inout') delta = makeEaseInOut(delta, options)

  var started = false

  return {
    start: function () {
      if (started) return this

      started = true

      var started_at = 0

      var _ = () => {
        if (!started) return

        if (started_at == 0) started_at = performance.now()

        var time_passed = performance.now() - started_at
        var progress = time_passed / duration
        var dx = repeat ? progress % 1 : Math.min(progress, 1)

        step(delta(dx, options))

        if (progress >= 1 && (!repeat || !started)) {
          this.stop()
          started_at = 0
        }

        if (started) {
          requestVRAnimationFrame(_)
        }
      }

      requestVRAnimationFrame(_)

      return this
    },

    stop: function () {
      started = false

      return this
    }
  }
}
