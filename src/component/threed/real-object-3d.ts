/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from '../component'
import * as THREE from 'three'

export default interface RealObject3D extends THREE.Object3D {
  component​​: Component

  dispose()
}