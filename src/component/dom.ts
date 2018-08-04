/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import RealObjectDomElement from './threed/real-object-dom-element'
import { CSS3DObject } from '../threed/renderers/css-3d-renderer'
import * as THREE from 'three'

export default class DOMComponent extends Component {

  private _cssObject3D: THREE.Object3D

  /**
   * property isDomComponent
   * readonly
   */
  get isDomComponent(): boolean {
    return true
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

  buildCSS3DObject() {
    var {
      tagName,
      options = {}
    } = this.state

    var element = tagName !== 'svg' ? document.createElement(tagName)
      : document.createElementNS("http://www.w3.org/2000/svg", "svg")
    Object.keys(options).forEach(prop => {
      element[prop] = options[prop]
    })

    var cssObject: THREE.Object3D = new CSS3DObject(element)

    var {
      dimension,
      translate: position,
      rotate: rotation
    } = this.state

    element.style.width = dimension.width
    element.style.height = dimension.height
    cssObject.position.set(position.x, position.y, position.z)
    cssObject.rotation.set(rotation.x, rotation.y, rotation.z)

    return cssObject
  }

  protected updateTransform() {
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
    } = this.state

    if (this.cssObject3D) {
      this.cssObject3D.position.set(tx, ty, tz);
      this.cssObject3D.rotation.set(rx, ry, rz);
      this.cssObject3D.scale.set(sx, sy, sz);
    }
  }

  onchangetranslate(after, before) {
    super.onchangetranslate(after, before)
    var { x = 1, y = 1, z = 1 } = after
    this.cssObject3D.position.set(x, y, z)
  }

  onchangerotate(after, before) {
    super.onchangerotate(after, before)
    var { x = 1, y = 1, z = 1 } = after
    this.cssObject3D.rotation.set(x, y, z)
  }

  onchangescale(after, before) {
    super.onchangescale(after, before)
    var { x = 1, y = 1, z = 1 } = after
    this.cssObject3D.scale.set(x, y, z)
  }

  onchangedimension(after, before) {
    super.onchangedimension(after, before)
    if (this.cssObject3D) {
      (this.cssObject3D as any).element.style.width = after.width;
      (this.cssObject3D as any).element.style.height = after.height;
    }
  }
}

Component.register('dom', DOMComponent)

