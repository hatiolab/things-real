/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import AbstractRealObject from './abstract-real-object'
import Component from '../component'

import * as T from 'three'
const THREE: any = T

import 'imports-loader?THREE=three!three/examples/js/loaders/GLTFLoader'

export default class RealObjectGLTF extends AbstractRealObject {

  private static _GLTFLoader = new THREE.GLTFLoader()
  private pivot: THREE.Object3D
  private objectSize: THREE.Vector3

  static get GLTFLoader() {
    return RealObjectGLTF._GLTFLoader
  }

  build() {

    var {
      url
    } = this.component.state

    if (!url) {
      this.clear()
      return
    }

    let gltfLoader = RealObjectGLTF.GLTFLoader;

    gltfLoader.load(url, gltf => {
      this.gltfLoaded(gltf)
    }, xhr => {
      console.log(Math.round(xhr.loaded / xhr.total * 100) + '% loaded')
    }, error => {
      error('GLTFLoader.load', error)
      this.clear()
    })
  }

  private gltfLoaded(gltf) {

    let scene = gltf.scene

    var object = scene.clone()

    var boundingBox = new THREE.Box3().setFromObject(object)

    var center = boundingBox.getCenter(object.position)
    center.multiplyScalar(-1)

    this.objectSize = boundingBox.getSize(this.objectSize)

    // 오브젝트 공백을 최소로 하기위해서 clear() 를 최대한 pending함.
    this.clear()

    this.pivot = new THREE.Object3D()
    this.add(this.pivot)
    this.pivot.add(object)

    this._rescale()

    // let animations = gltf.animations
    // if (animations && animations.length) {
    //   for (var i = 0; i < animations.length; i++) {
    //     var animation = animations[i]
    //     var action = this._visualizer.mixer.clipAction(animation)
    //     action.play()
    //   }
    // }
  }

  clear() {
    // TODO gltf object 리소스 해제가 필요하면, 여기에 추가.
    // 반복적으로 로딩하면 WebGL 리소스 부족으로 오류 발생.

    super.clear()
  }

  _rescale() {
    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || Component.UNIT_DIMENSION

    var {
      x = 1, y = 1, z = 1
    } = this.objectSize || {}

    this.pivot && this.pivot.scale.set(width / x, height / y, depth / z)

    this.component.invalidate()
  }

  updateAlpha() {
    // TODO 최상위 material들을 찾아서, alpha를 적용한다 ? 잘 모르겠음.
  }

  updateDimension(after, before) {
    this._rescale()
  }
}