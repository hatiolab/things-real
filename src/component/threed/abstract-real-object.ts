/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component } from '..'
import RealObject from './real-object'

import * as THREE from 'three'

export default abstract class AbstractRealObject extends THREE.Object3D implements RealObject {
  protected _component: Component

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

    this.update()
  }

  update() {
    this.clear()
    this.build()

    this.updateTransform()
    this.updateAlpha()
  }

  /**
   * Component의 상태값의 변화를 Object3D에 반영 - translate, rotation, scale
   */
  updateTransform() {

    var {
      scale: {
        x: sx = 1,
        y: sy = 1,
        z: sz = 1
      } = Component.UNIT_SCALE,
      translate: {
        x: tx = 0,
        y: ty = 0,
        z: tz = 0
      } = Component.UNIT_TRANSLATE,
      rotate: {
        x: rx = 0,
        y: ry = 0,
        z: rz = 0
      } = Component.UNIT_ROTATE
    } = this.component.state

    this.position.set(tx, ty, tz);
    this.rotation.set(rx, ry, rz);
    this.scale.set(sx, sy, sz);
  }

  /**
   * Object3D 모델의 변화를 Component의 모델값에 반영
   */
  updateTransformReverse() {

    var rotation = this.rotation
    var position = this.position
    var scale = this.scale

    this.component.setModel({
      rotate: {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z
      },
      translate: {
        x: position.x,
        y: position.y,
        z: position.z
      },
      scale: {
        x: scale.x,
        y: scale.y,
        z: scale.z
      }
    })
  }

  /* update functions - 전체적인 rebuilding이 필요하지 않은 update 기능 들임 */
  updateTranslate(after, before) {
    var { x = 0, y = 0, z = 0 } = after
    this.position.set(x, y, z)
  }

  updateRotate(after, before) {
    var { x = 0, y = 0, z = 0 } = after
    this.rotation.set(x, y, z)
  }

  updateScale(after, before) {
    var { x = 1, y = 1, z = 1 } = after
    this.scale.set(x, y, z)
  }

  updateDimension(after, before) {
    this.update()
  }

  abstract updateAlpha()

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
}
