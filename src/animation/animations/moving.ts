/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class Moving extends Animation {

  step(delta) {
    var {
      x = 0,
      y = 0
    } = this.config

    this.client.delta('tx', delta * x)
    this.client.delta('ty', delta * y)
  }
}
