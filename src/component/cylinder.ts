/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import { Dimension } from '../types'
import RealObjectMesh from './threed/real-object-mesh'
import * as THREE from 'three'

class ObjectCylinder extends RealObjectMesh {

  // setDimension(dimension: Dimension) {
  //   var old = (this.geometry as THREE.CylinderGeometry).parameters;

  //   var radius = Math.min(dimension.width, dimension.depth) / 2;

  //   (this.geometry as THREE.CylinderGeometry).parameters = {
  //     ...old,
  //     radiusTop: radius,
  //     radiusBottom: radius,
  //     height: dimension.height
  //   }
  // }

  buildGeometry() {

    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || { width: 1, height: 1, depth: 1 }

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

