/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import RealObject from './real-object'
import Component from '../component'

import * as THREE from 'three'
import { applyAlpha } from './common';

export default abstract class RealObjectMesh extends THREE.Mesh implements RealObject {
  protected _component

  constructor(component) {
    super()

    this.component = component
  }

  get isRealObject() {
    return true
  }

  build() {
    this.geometry = this.buildGeometry()
    this.material = this.buildMaterial()
  }

  dispose() {
    this.clear();
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
      dimension: {
        width: sx = 1,
        height: sy = 1,
        depth: sz = 1
      } = Component.UNIT_DIMENSION,
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
      dimension: {
        width: scale.x,
        height: scale.y,
        depth: scale.z
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
    /* do nothing, intentionally */
  }

  /* overide */
  updateDimension(after, before) {
    this.scale.set(after.width, after.height, after.depth)
  }

  updateAlpha() {
    var {
      alpha = 1,
      fillStyle
    } = this.component.state

    applyAlpha(this.material, alpha, fillStyle)
  }

  protected abstract buildGeometry(): THREE.Geometry | THREE.BufferGeometry

  buildMaterial() /* : THREE.MeshMaterialType | THREE.MeshMaterialType[] */ {

    var {
      fillStyle,
      alpha
    } = this.component.state

    var color = 'black'

    if (typeof (fillStyle) == 'string' && fillStyle != 'none') {
      color = fillStyle
    }

    return new THREE.MeshBasicMaterial({ color })
  }

  clear() {
    this.traverse((mesh: any) => {
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (mesh.material.length ? mesh.material : [mesh.material])
          .forEach(m => m.dispose && m.dispose())
      }
    })
  }
}
