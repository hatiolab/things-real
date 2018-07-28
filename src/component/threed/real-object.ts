/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from '../component'
import { Dimension } from '../../types'
import * as THREE from 'three'

export default interface RealObject extends THREE.Object3D {
  component: Component
  isRealObject

  dispose()
  prerender(force?: boolean)
}