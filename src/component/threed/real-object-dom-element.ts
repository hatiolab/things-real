/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

/* 
  Inspired by http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/
*/

import Component from '../component'
import RealObjectMesh from './real-object-mesh'
import { CSS3DObject } from '../../threed/renderers/css-3d-renderer'

import * as THREE from 'three'

export default class RealObjectDomElement extends RealObjectMesh {

  private _cssObject3D: THREE.Object3D

  buildGeometry() {
    var {
      width,
      height
    } = this.component.state.dimension

    return new THREE.PlaneGeometry(width, height)
  }

  buildMaterial() /* : THREE.MeshMaterialType | THREE.MeshMaterialType[] */ {

    var material = new THREE.MeshBasicMaterial()

    material.color.set('black')
    material.opacity = 0
    material.side = THREE.DoubleSide
    material.blending = THREE.NoBlending

    return material
  }

  get cssObject3D(): THREE.Object3D {
    if (!this._cssObject3D) {
      this._cssObject3D = this.buildCSS3DObject()
    }
    return this._cssObject3D
  }

  buildCSS3DObject() {

    var element = this.component.domElement

    var {
      dimension
    } = this.component.state

    element.style.width = dimension.width + 'px'
    element.style.height = dimension.height + 'px'

    return new CSS3DObject(element)
  }

  /**
   * Component의 상태값의 변화를 Object3D에 반영 - translate, rotation, scale
   */
  public updateTransform() {
    super.updateTransform()

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

    this.cssObject3D.position.set(tx, ty, tz)
    this.cssObject3D.rotation.set(rx, ry, rz)
    this.cssObject3D.scale.set(sx, sy, sz)
  }

  updateTranslate(after, before) {
    super.updateTranslate(after, before)

    var { x = 1, y = 1, z = 1 } = after
    this.cssObject3D.position.set(x, y, z)
  }

  updateRotate(after, before) {
    super.updateRotate(after, before)

    var { x = 1, y = 1, z = 1 } = after
    this.cssObject3D.rotation.set(x, y, z)
  }

  updateScale(after, before) {
    super.updateScale(after, before)

    var { x = 1, y = 1, z = 1 } = after
    this.cssObject3D.scale.set(x, y, z)
  }

  updateDimension(after, before) {
    super.updateDimension(after, before);

    this.component.domElement.style.width = after.width + 'px'
    this.component.domElement.style.height = after.height + 'px'
  }

  updateAlpha() {
    // material의 opacity는 항상 0으로 유지되어야 하며,
    // dom element의 opacity에 alpha를 적용해야한다.
    // 하지만, 컬러톤의 반영 외에 transparent 기능은 하지 못하므로, 뒤에 있는 오브젝트를 보여주지 못한다.
    var {
      alpha = 1
    } = this.component.state;

    this.component.domElement.style.opacity = alpha
  }
}
