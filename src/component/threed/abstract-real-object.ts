/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component, Container } from '..'
import RealObject from './real-object'

import * as THREE from 'three'

export default abstract class AbstractRealObject extends THREE.Object3D implements RealObject {
  protected _component: Component
  private updating: boolean

  constructor(component) {
    super()

    this.component = component
  }

  initialize() { }

  dispose() {
    this.clear();
  }

  get isRealObject() {
    return true
  }

  get component() {
    return this._component
  }

  set component(component) {
    this.clear()

    this._component = component

    this.build()
  }

  update() {
    this.clear()
    this.build()
  }

  protected abstract build()

  clear() {
    this.children.slice().forEach(child => {
      if (child['dispose'])
        child['dispose']();
      if (child['geometry'] && child['geometry']['dispose'])
        child['geometry']['dispose']();
      if (child['material'] && child['material']['dispose'])
        child['material']['dispose']();
      if (child['texture'] && child['texture']['dispose'])
        child['texture']['dispose']();
      this.remove(child)
    })
  }

  prerender(force?) {
    // this.update();

    // if (this.component.isContainer) {
    //   (this.component as Container).components.forEach(child => {
    //     let object = child.object3D as AbstractRealObject
    //     object.prerender(force)
    //   })
    // }
  }

  // onchange(after, before) {
  //   if (this.updating) {
  //     return;
  //   }
  //   this.updating = true;

  //   requestAnimationFrame(() => {
  //     this.update();
  //     this.updating = false;
  //   })
  // }
}
