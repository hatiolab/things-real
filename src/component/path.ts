/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import Shape from './shape'

import * as THREE from 'three'

export default class Path extends Shape {

  createShape() {
    var {
      dimension,
      round = 0,
      path = []
    } = this.state

    var {
      width,
      height,
      depth
    } = dimension

    var shape = new THREE.Shape();

    if (path.length <= 1)
      return;

    // Polyline을 그린다.

    shape.moveTo(path[0].x, path[0].y)

    for (let i = 1; i < path.length; i++)
      shape.lineTo(path[i].x, path[i].y)

    shape.closePath();

    return shape
  }
}

Component.register('path', Path)