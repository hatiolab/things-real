/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class Vibration extends Animation {

  step(delta) {

    var {
      theta = 0.2617993877991494 // 15 dgree
    } = this.config;

    var total_theta = theta * 4;
    var current = delta * total_theta;

    // 1단계 : 점차로 감소한다.
    if(delta < 1  / 4)
      current *= -1;
    else if(delta < 3 / 4) // 2단계 : 점차 증가한다.
      current -= theta * 2;
    else // 3단계 : 점차 감소한다.
      current = total_theta - current;

    this.client.delta('theta', current)
  }
}
