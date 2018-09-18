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

  clear() {
    if (this._floor) {
      (this._floor.material as THREE.MeshBasicMaterial).dispose()
      this._floor.geometry.dispose()

      delete this._floor
    }
  }

  private _floor: THREE.Mesh

  get texture() {
    var {
      fillStyle
    } = this.component

    if (fillStyle == 'none')
      return


  }

  build() {
    // var texture = this.texture

    // if (!texture)
    //   return

    // var geometry = new THREE.PlaneGeometry(1, 1)
    // var material = new THREE.MeshBasicMaterial({
    //   map: texture,
    //   opacity: 1,
    //   side: THREE.DoubleSide,
    //   transparent: true
    // })

    // this._floor = new THREE.Mesh(geometry, material)






    // this._floor.rotateOnAxis(new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(90))
    // this._floor.scale.set(scaleValue, scaleValue, scaleValue)
  }

  update() {
    this.clear()
    this.build()

    this.updateTransform()
    this.updateAlpha()
  }

  updateTransform() { }
  updateTransformReverse() { }
  updateDimension() { }
  updateTranslate() { }
  updateRotate() { }
  updateScale() { }
  updateAlpha() { }

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