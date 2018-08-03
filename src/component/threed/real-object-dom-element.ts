/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

/* 
  Inspired by http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/
*/

import Component from '../component'
import RealObjectMesh from './real-object-mesh'

import * as THREE from 'three'

export default class RealObjectDomElement extends RealObjectMesh {

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
}
