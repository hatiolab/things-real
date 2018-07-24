/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import RealObjectMesh from './real-object-mesh'

export default class ObjectCube extends RealObjectMesh {
  constructor(component) {
    super(component)
  }

  buildGeometry() {
    var {
      x: width,
      y: height,
      z: depth
    } = this.component.state.scale

    // var { x, y, z } = this.component.state.translate
    return new THREE.CubeGeometry(width, height, depth)
  }

  buildMaterial() {

    return new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  }
}