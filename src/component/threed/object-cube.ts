/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import RealObjectMesh from './real-object-mesh'

export default class ObjectCube extends RealObjectMesh {

  buildGeometry() {

    var {
      x: width = 1,
      y: height = 1,
      z: depth = 1
    } = this.component.state.scale || { x: 1, y: 1, z: 1 }

    return new THREE.CubeGeometry(width, height, depth)
  }

  buildMaterial() {

    // return new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    return new THREE.MeshNormalMaterial()
  }
}