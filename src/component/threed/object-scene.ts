/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import RealObject from './real-object'

export default class ObjectScene extends THREE.Scene implements RealObject {
  protected _component

  constructor(component) {
    super();

    this.component = component;
  }

  dispose() { }

  setDimension() { }

  prerender() { }

  get isRealObject() {
    return true
  }

  get component() {
    return this._component
  }

  set component(component) {
    this._component = component
  }
}