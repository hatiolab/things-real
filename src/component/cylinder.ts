/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import { Dimension } from '../types'
import RealObjectMesh from './threed/real-object-mesh'
import * as THREE from 'three'

class ObjectCylinder extends RealObjectMesh {

  buildGeometry() {

    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || Component.UNIT_DIMENSION

    var radius = Math.min(width, depth) / 2

    return new THREE.CylinderGeometry(radius, radius, height, 32)
  }
}

export default class Cylinder extends Component {
  buildObject3D() {
    return new ObjectCylinder(this)
  }
}

Component.register('cylinder', Cylinder)

