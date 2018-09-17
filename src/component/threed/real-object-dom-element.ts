/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

/* 
  Inspired by http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/
*/

import { Component } from '..'
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

  buildMaterial(): THREE.MeshMaterialType | THREE.MeshMaterialType[] {

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

  buildObject3D() {
    return new RealObjectDomElement(this)
  }

  createDOMElement() {
    var {
      tagName,
      options = {}
    } = this.component.state

    var element = tagName !== 'svg' ? document.createElement(tagName)
      : document.createElementNS("http://www.w3.org/2000/svg", "svg")
    Object.keys(options).forEach(prop => {
      element[prop] = options[prop]
    })

    return element
  }

  buildCSS3DObject() {

    var element = this.createDOMElement()
    var cssObject: THREE.Object3D = new CSS3DObject(element)

    var {
      dimension,
      translate: position = { x: 0, y: 0, z: 0 },
      rotate: rotation = { x: 0, y: 0, z: 0 }
    } = this.component.state

    element.style.width = dimension.width
    element.style.height = dimension.height
    cssObject.position.set(position.x, position.y, position.z)
    cssObject.rotation.set(rotation.x, rotation.y, rotation.z)

    return cssObject
  }

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

    if (this.cssObject3D) {
      this.cssObject3D.position.set(tx, ty, tz);
      this.cssObject3D.rotation.set(rx, ry, rz);
      this.cssObject3D.scale.set(sx, sy, sz);
    }
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

    (this.cssObject3D as any).element.style.width = after.width;
    (this.cssObject3D as any).element.style.height = after.height;
  }

  updateAlpha() {
    // material의 opacity는 항상 0으로 유지되어야 하며,
    // dom element의 opacity에 alpha를 적용해야한다.
  }
}
