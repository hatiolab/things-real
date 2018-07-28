/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from '../component'
import * as THREE from 'three'

export default interface RealObject extends THREE.Object3D {
  component: Component
  isRealObject

  dispose()

  /**
   * Component의 상태 속성을 3D 오브젝트에 반영한다.
   */
  update()
}