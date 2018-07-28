/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import RealObject from './real-object'

export default class RealObjectScene extends THREE.Scene implements RealObject {
  protected _component

  constructor(component) {
    super();

    this.component = component;
  }

  dispose() {
    this.children.forEach(child => {
      child['dispose'] && child['dispose']()

      this.remove(child)
    })
  }

  update() { }
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