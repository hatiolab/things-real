/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import RealObject from './real-object'

export default class RealObjectScene extends THREE.Scene implements RealObject {
  protected _component

  constructor(component) {
    super()

    this.component = component

    this.update()
  }

  dispose() {
    this.children.forEach(child => {
      child['dispose'] && child['dispose']()

      this.remove(child)
    })
  }

  clear() {

    if (this._floor) {
      this.remove(this._floor);

      if (this._floor.material instanceof Array) {
        (this._floor.material as THREE.Material[]).forEach(material => material.dispose())
      } else {
        this._floor.material.dispose()
      }
      this._floor.geometry.dispose()

      delete this._floor
    }
  }

  private _floor: THREE.Mesh

  get floor() {
    return this._floor
  }

  set floor(floor) {

    var {
      width,
      height
    } = this.component

    floor.scale.set(width, height, 1);
    floor.rotation.x = -Math.PI / 2
    // floor.position.y = -2
    floor.position.y = 0

    floor.name = 'floor'

    floor.receiveShadow = true

    this.add(floor)

    this._floor = floor

    this.component.invalidate()
  }

  build() {

    var {
      fillStyle
    } = this.component.state

    if (!fillStyle || fillStyle == 'none') {
      return
    }

    if (fillStyle.type == 'pattern' && fillStyle.image) {

      var textureLoader = new THREE.TextureLoader(THREE.DefaultLoadingManager)
      // textureLoader.withCredentials = 'true'
      // textureLoader.crossOrigin = 'use-credentials'
      textureLoader.crossOrigin = 'anonymous'

      textureLoader.load(fillStyle.image, texture => {
        texture.minFilter = THREE.LinearFilter
        texture.repeat.set(1, 1)

        // texture.wrapS = THREE.RepeatWrapping
        // texture.wrapT = THREE.RepeatWrapping

        // texture.repeat.set(4, 4);

        var floorGeometry = new THREE.PlaneBufferGeometry()
        var floorMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })

        this.floor = new THREE.Mesh(floorGeometry, floorMaterial)
      })
    } else if (typeof (fillStyle) == 'string') {
      var floorGeometry = new THREE.PlaneBufferGeometry()
      var floorMaterial = new THREE.MeshBasicMaterial({ color: fillStyle, side: THREE.DoubleSide })

      this.floor = new THREE.Mesh(floorGeometry, floorMaterial)
    }
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

  private _animationMixer: THREE.AnimationMixer

  get animationMixer() {
    if (!this._animationMixer) {
      this._animationMixer = new THREE.AnimationMixer(this)
    }

    return this._animationMixer
  }
}