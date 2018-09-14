/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class Fade extends Animation {

  step(delta) {
    var {
      startAlpha = 1,
      endAlpha = 0
    } = this.config

    var min = startAlpha > endAlpha ? endAlpha : startAlpha
    var max = startAlpha < endAlpha ? endAlpha : startAlpha
    var range = (max - min) * 2;
    var fade;

    // 깜빡이는 범위는 최소 값 + (범위 * delta)
    if (delta < 0.5)
      fade = 1 - (min + delta * range)
    else
      fade = 1 - (min + (1 - delta) * range)

    this.client.alpha = (this._state.alpha || 1) * fade
  }
}
