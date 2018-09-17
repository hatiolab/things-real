/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import RealObjectDomElement from './threed/real-object-dom-element'
import { CSS3DObject } from '../threed/renderers/css-3d-renderer'
import * as THREE from 'three'

export default class DOMComponent extends Component {

  static get type() {
    return 'dom'
  }

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

  createDOMElement() {
    var {
      tagName,
      options = {}
    } = this.state

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
    } = this.state

    element.style.width = dimension.width
    element.style.height = dimension.height
    cssObject.position.set(position.x, position.y, position.z)
    cssObject.rotation.set(rotation.x, rotation.y, rotation.z)

    return cssObject
  }
}

Component.register(DOMComponent.type, DOMComponent)

