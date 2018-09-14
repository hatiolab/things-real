/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class Moving extends Animation {

  step(delta) {
    var {
      tx = 0,
      ty = 0,
      tz = 0
    } = this.config

    var {
      x = 0,
      y = 0,
      z = 0
    } = this._state.translate || {}

    x += delta * tx
    y += delta * ty
    z += delta * tz

    this.client.translate = { x, y, z }
  }
}
