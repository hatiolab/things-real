/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class HeartBeat extends Animation {

  step(delta) {
    var {
      scale = 1.3
    } = this.config

    var total_scale = (scale - 1) * 2;

    var ratio;

    // 0 ~ 1/2 까지는 점차로 증가한다. 그 이후로는 점차로 감소한다.
    if(delta < 1 / 2)
      ratio = 1 + total_scale * delta;
    else
      ratio = 1 + (1 - delta) * total_scale;

    this.client.delta('sx', ratio)
    this.client.delta('sy', ratio)
  }
}
