/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import RealObjectMesh from './real-object-mesh'
import { Dimension } from '../../types'
import * as THREE from 'three'

export default class ObjectCube extends RealObjectMesh {

  setDimension(dimension: Dimension) {
    var old = (this.geometry as THREE.CubeGeometry).parameters;
    (this.geometry as THREE.CubeGeometry).parameters = {
      ...old,
      ...dimension
    }
  }

  buildGeometry() {

    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || { width: 1, height: 1, depth: 1 }

    return new THREE.CubeGeometry(width, height, depth)
  }
}