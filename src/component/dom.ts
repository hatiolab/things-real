/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import RealObjectDomElement from './threed/real-object-dom-element'
import { CSS3DObject } from '../threed/renderers/CSS3DRenderer'
import * as THREE from 'three'

export default class DOMComponent extends Component {

  buildObject3D() {
    return new RealObjectDomElement(this)
  }

  buildCSS3DObject() {
    var {
      tagName,
      options = {}
    } = this.state

    var element = document.createElement(tagName)
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
}

Component.register('dom', DOMComponent)

