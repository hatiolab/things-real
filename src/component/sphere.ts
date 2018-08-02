/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import { Dimension } from '../types'
import RealObjectMesh from './threed/real-object-mesh'
import * as THREE from 'three'

class ObjectSphere extends RealObjectMesh {

  buildGeometry() {

    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || Component.UNIT_DIMENSION

    var radius = Math.min(width, height, depth) / 2;

    return new THREE.SphereGeometry(radius, 32, 32)
  }
}

export default class Sphere extends Component {
  buildObject3D() {
    return new ObjectSphere(this)
  }
}

Component.register('sphere', Sphere)

