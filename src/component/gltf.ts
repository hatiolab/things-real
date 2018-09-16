/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import AbstractRealObject from './threed/abstract-real-object'
import { error } from '../util'
import * as T from 'three'
const THREE: any = T

import 'imports-loader?THREE=three!three/examples/js/loaders/GLTFLoader'

class ObjectGltf extends AbstractRealObject {

  private static _GLTFLoader = new THREE.GLTFLoader()
  private pivot: THREE.Object3D
  private objectSize: THREE.Vector3 = new THREE.Vector3()

  static get GLTFLoader() {
    return ObjectGltf._GLTFLoader
  }

  build() {

    var {
      url
    } = this.component.state

    if (!url) {
      this.clear()
      return
    }

    let gltfLoader = ObjectGltf.GLTFLoader;

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

    this.objectSize = boundingBox.getSize()

    // object.updateMatrix()

    // 오브젝트 공백을 최소로 하기위해서 clear() 를 최대한 pending함.
    this.clear()

    this.pivot = new THREE.Object3D()
    this.add(this.pivot)

    this.pivot.add(object)

    this.update()
    this.component.invalidate()

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

  update() {

    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || Component.UNIT_DIMENSION

    var {
      x, y, z
    } = this.objectSize

    /* component 자체의 scale도 별도의 의미가 있으므로, dimension은 하위 pivot object의 scale로 조절한다. */
    this.pivot.scale.set(width / x, depth / y, height / z)
  }

}

export default class Gltf extends Component {

  static get type() {
    return 'gltf'
  }

  static readonly NATURE = {
    mutable: false,
    resizable: true,
    rotatable: true,
    properties: [{
      type: 'string',
      label: 'url',
      name: 'url'
    }]
  }

  buildObject3D() {
    return new ObjectGltf(this)
  }

  /* url 이 바뀐 경우에는 rebuild 한다. */
  onchangeurl(after, before) {
    (this.object3D as ObjectGltf).build()
  }
}

Component.register(Gltf.type, Gltf)

