/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import RealObject3D from './real-object-3d'

export default class ObjectScene extends THREE.Scene implements RealObject3D {
  protected _component

  constructor(component) {
    super();

    this.component = component;
  }

  dispose() { }

  setDimension() { }

  get component() {
    return this._component
  }

  set component(component) {
    this._component = component
  }
}