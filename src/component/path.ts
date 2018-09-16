/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import Shape from './shape'

export default class Path extends Shape {

  static get type() {
    return 'path'
  }

  render(shape) {
    var {
      dimension,
      curved = false,
      path = []
    } = this.state

    var {
      width,
      height,
      depth
    } = dimension

    if (path.length <= 2)
      return;

    if (curved) {
      shape.moveTo((path[0].x + path[1].x) / 2, (path[0].y + path[1].y) / 2)

      for (var i = 1; i < path.length - 1; i++) {
        shape.quadraticCurveTo(path[i].x, path[i].y, (path[i].x + path[i + 1].x) / 2, (path[i].y + path[i + 1].y) / 2)
      }
      shape.quadraticCurveTo(path[i].x, path[i].y, (path[i].x + path[0].x) / 2, (path[i].y + path[0].y) / 2)
      shape.quadraticCurveTo(path[0].x, path[0].y, (path[0].x + path[1].x) / 2, (path[0].y + path[1].y) / 2)
    } else {
      shape.moveTo(path[0].x, path[0].y)

      for (let i = 1; i < path.length; i++)
        shape.lineTo(path[i].x, path[i].y)
    }
  }
}

Component.register(Path.type, Path)