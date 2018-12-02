/*
 * Copyright © HatioLab Inc. All rights reserved.
 * 
 * 이 기능은 VR모드에서 requestAnimationFrame(..) 기능이 동작하지 않기 때문에,
 * requestAnimationFrame을 사용하는 기능에서 대체제로 활용할 수 있도록 기능을 제공한다.
 */

import { error } from './logger'

var callbacks = []
var backup_raf = window.requestAnimationFrame
var backup_caf = window.cancelAnimationFrame

function requestCustomAF(callback: FrameRequestCallback): number {
  return callbacks.push(callback)
}

function cancelCustomAF(ncallback) {
  callbacks[ncallback - 1] = undefined
}

export function startCustomAF() {
  window.requestAnimationFrame = requestCustomAF
  window.cancelAnimationFrame = cancelCustomAF
}

export function stopCustomAF() {
  window.requestAnimationFrame = backup_raf
  window.cancelAnimationFrame = backup_caf
}

export function executeCustomAF() {
  callbacks.forEach(callback => {
    try {
      callback && callback()
    } catch (e) {
      error(e)
    }
  })

  callbacks = []
}

