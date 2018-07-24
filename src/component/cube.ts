/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import { Dimension } from '../types'
import RealObjectMesh from './threed/real-object-mesh'
import * as THREE from 'three'

class ObjectCube extends RealObjectMesh {

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

export default class Cube extends Component {
  buildObject3D() {
    return new ObjectCube(this)
  }
}

Component.register('cube', Cube)

