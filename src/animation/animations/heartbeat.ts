/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class HeartBeat extends Animation {

  step(delta) {
    var {
      sx = 1,
      sy = 1,
      sz = 1
    } = this.config

    var total_scale_x = (sx - 1) * 2
    var total_scale_y = (sy - 1) * 2
    var total_scale_z = (sz - 1) * 2

    var ratio_x, ratio_y, ratio_z

    // 0 ~ 1/2 까지는 점차로 증가한다. 그 이후로는 점차로 감소한다.
    if (delta < 1 / 2) {
      ratio_x = 1 + total_scale_x * delta
      ratio_y = 1 + total_scale_y * delta
      ratio_z = 1 + total_scale_z * delta
    } else {
      ratio_x = 1 + (1 - delta) * total_scale_x
      ratio_y = 1 + (1 - delta) * total_scale_y
      ratio_z = 1 + (1 - delta) * total_scale_z
    }

    var {
      x = 1, y = 1, z = 1
    } = this._state.scale || {}

    x *= ratio_x
    y *= ratio_y
    z *= ratio_z

    this.client.scale = { x, y, z }
  }
}
