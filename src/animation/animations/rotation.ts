/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

export default class Rotation extends Animation {

  step(delta) {

    var {
      theta = 6.28
    } = this.config

    this.client.delta('theta', delta * theta)
  }
}
