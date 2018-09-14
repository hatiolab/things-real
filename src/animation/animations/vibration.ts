/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class Vibration extends Animation {

  step(delta) {
    var {
      rx = 0,
      ry = 0,
      rz = 0
    } = this.config

    var {
      x = 0,
      y = 0,
      z = 0
    } = this._state.rotate || {}

    var total_theta_x = rx * 4
    var total_theta_y = ry * 4
    var total_theta_z = rz * 4

    var current_x = delta * total_theta_x
    var current_y = delta * total_theta_y
    var current_z = delta * total_theta_z

    if (delta < 1 / 4) {
      // 1단계 : 점차로 감소한다.
      x += current_x * -1
      y += current_y * -1
      z += current_z * -1
    } else if (delta < 3 / 4) {
      // 2단계 : 점차 증가한다.
      x += current_x - rx * 2
      y += current_y - ry * 2
      z += current_z - rz * 2
    } else {
      // 3단계 : 점차 감소한다.
      x += total_theta_x - current_x
      y += total_theta_y - current_y
      z += total_theta_z - current_z
    }

    this.client.rotate = { x, y, z }
  }
}
