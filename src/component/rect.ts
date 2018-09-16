/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import Shape from './shape'

export default class Rect extends Shape {

  static get type() {
    return 'rect'
  }

  static readonly NATURE = {
    mutable: false,
    resizable: true,
    rotatable: true,
    properties: [{
      type: 'number',
      label: 'round',
      name: 'round'
    }]
  }

  render(shape) {
    var {
      dimension,
      round = 0
    } = this.state

    var {
      width,
      depth
    } = dimension

    if (round > 0) {
      var radius = (round / 100) * (width / 2)

      shape.moveTo(radius, 0);
      shape.lineTo(width - radius, 0);
      shape.quadraticCurveTo(width, 0, width, radius);
      shape.lineTo(width, depth - radius);
      shape.quadraticCurveTo(width, depth, width - radius, depth);
      shape.lineTo(radius, depth);
      shape.quadraticCurveTo(0, depth, 0, depth - radius);
      shape.lineTo(0, radius);
      shape.quadraticCurveTo(0, 0, radius, 0);
    } else {
      shape.moveTo(0, 0);
      shape.lineTo(width, 0);
      shape.lineTo(width, depth);
      shape.lineTo(0, depth);
      shape.lineTo(0, 0);
    }
  }

  onchangeround(after, before) {
    this.update()
  }
}

Component.register(Rect.type, Rect)