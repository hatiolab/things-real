/*
 * Copyright © HatioLab Inc. All rights reserved.
 *
 * 이 기능은 VR모드에서 requestAnimationFrame(..) 기능이 동작하지 않기 때문에,
 * requestAnimationFrame을 사용하는 기능에서 대체제로 활용할 수 있도록 기능을 제공한다.
 */

import { error } from "./logger";

var callbacks = [];

export function requestCustomAnimationFrame(
  callback: FrameRequestCallback
): number {
  callbacks.push(callback);
  return callbacks.length;
}

export function cancelCustomAnimationFrame(ncallback) {
  if (callbacks[ncallback - 1]) {
    callbacks[ncallback - 1] = undefined;
  }
}

export function callFrameAnimation() {
  var copied = callbacks.slice();
  callbacks = [];
  copied.forEach(callback => {
    try {
      callback && callback();
    } catch (e) {
      error(e);
    }
  });
}
