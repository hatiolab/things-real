/*
 * Copyright © HatioLab Inc. All rights reserved.
 * 
 * 이 기능은 VR모드에서 requestAnimationFrame(..) 기능이 동작하지 않기 때문에,
 * requestAnimationFrame을 사용하는 기능에서 대체제로 활용할 수 있도록 기능을 제공한다.
 */

import { error } from './logger'

var callbacks = []

export function requestVRAnimationFrame(callback: FrameRequestCallback): number {
  return callbacks.push(callback)
}

export function cancelVRAnimationFrame(ncallback) {
  if (callbacks[ncallback - 1]) {
    callbacks[ncallback - 1] = undefined
  }
}

export function callVRAnimationFrame() {
  var copied = callbacks.slice()
  callbacks = []
  copied.forEach(callback => {
    try {
      callback && callback()
    } catch (e) {
      error(e)
    }
  })
}

requestAnimationFrame(function autocall() {
  requestAnimationFrame(autocall)

  callVRAnimationFrame()
})