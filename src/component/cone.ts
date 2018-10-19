/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import RealObjectMesh from './threed/real-object-mesh'
import * as THREE from 'three'

class ObjectCone extends RealObjectMesh {

  static get type() {
    return 'cone'
  }

  buildGeometry() {

    // var {
    //   width = 1,
    //   height = 1,
    //   depth = 1
    // } = this.component.state.dimension || Component.UNIT_DIMENSION

    // var radius = Math.min(width, depth) / 2

    // return new THREE.ConeGeometry(radius, height, 32)
    return new THREE.ConeGeometry(1 / 2, 1, 32)
  }
}

export default class Cone extends Component {
  buildObject3D() {
    return new ObjectCone(this)
  }
}

Component.register(Cone.type, Cone)

