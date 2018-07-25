/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import { Dimension } from '../types'
import RealObjectMesh from './threed/real-object-mesh'
import * as THREE from 'three'

class ObjectCone extends RealObjectMesh {

  // setDimension(dimension: Dimension) {
  //   var old = (this.geometry as THREE.ConeGeometry).parameters;

  //   var {
  //     width, height, depth
  //   } = dimension

  //   var radius = Math.min(dimension.width, dimension.depth) / 2;

  //   (this.geometry as THREE.ConeGeometry).parameters = {
  //     ...old,
  //     radiusTop: 0,
  //     radiusBottom: radius,
  //     height
  //   }
  // }

  buildGeometry() {

    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || { width: 1, height: 1, depth: 1 }

    var radius = Math.min(width, depth) / 2

    return new THREE.ConeGeometry(radius, height, 32)
  }
}

export default class Cone extends Component {
  buildObject3D() {
    return new ObjectCone(this)
  }
}

Component.register('cone', Cone)

