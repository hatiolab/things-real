/*
 * Copyright © HatioLab Inc. All rights reserved.
 * 
 * 이 기능은 VR모드에서 requestAnimationFrame(..) 기능이 동작하지 않기 때문에,
 * requestAnimationFrame을 사용하는 기능에서 대체제로 활용할 수 있도록 기능을 제공한다.
 */

import { error } from './logger'

var callbacks = []
var started = false

export function requestVRAnimationFrame(callback: FrameRequestCallback): number {
  return started && callbacks.push(callback)
}

export function cancelVRAnimationFrame(ncallback) {
  if (started && callbacks[ncallback - 1]) {
    callbacks[ncallback - 1] = undefined
  }
}

export function startVRAnimationFrame() {
  started = true
  callbacks = []
}

export function stopVRAnimationFrame() {
  started = false
  callbacks = []
}

export function callVRAnimationFrame() {
  callbacks.forEach(callback => {
    try {
      callback && callback()
    } catch (e) {
      error(e)
    }
  })

  callbacks = []
}

