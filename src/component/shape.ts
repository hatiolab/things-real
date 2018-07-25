/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import RealObjectExtrude from './threed/real-object-extrude';

import * as THREE from 'three'

export default abstract class Shape extends Component {

  public abstract createShape()

  buildObject3D(): THREE.Object3D {
    return new RealObjectExtrude(this)
  }
}
