/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import RealObject3D from './real-object-3d'

export default class ObjectScene extends THREE.Scene implements RealObject3D {
  protected _component

  constructor(component) {
    super();

    this._component = component;
  }

  dispose() { }

  clear() { }

  build() { }

  get component() {
    return this._component
  }

  set component(component) {
    this.clear()
    this._component = component
    this.build()
  }
}