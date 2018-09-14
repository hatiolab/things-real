/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class Rotation extends Animation {

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

    x += delta * rx
    y += delta * ry
    z += delta * rz

    this.client.rotate = { x, y, z }
  }
}
