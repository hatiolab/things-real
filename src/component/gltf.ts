/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import AbstractRealObject from './threed/abstract-real-object'
import * as T from 'three'
const THREE: any = T

import 'imports-loader?THREE=three!three/examples/js/loaders/GLTFLoader'

class ObjectGltf extends AbstractRealObject {

  private static _GLTFLoader = new THREE.GLTFLoader()
  private gltfObject
  private objectSize: THREE.Vector3 = new THREE.Vector3()

  static get GLTFLoader() {
    return ObjectGltf._GLTFLoader
  }

  build() {

    var {
      url
    } = this.component.state

    if (!url)
      return

    let gltfLoader = ObjectGltf.GLTFLoader;

    gltfLoader.load(url, gltf => {
      this.gltfLoaded(gltf)
    })
  }

  private gltfLoaded(gltf) {

    let scene = gltf.scene
    let animations = gltf.animations

    // for ?
    this.type = 'gltf-object'

    var object = scene.clone()

    var boundingBox = new THREE.Box3().setFromObject(object)

    // for ?
    var center = boundingBox.getCenter(object.position)

    this.objectSize = boundingBox.getSize(new THREE.Vector3())

    // for ?
    center.multiplyScalar(-1)

    // for ?
    object.updateMatrix()

    this.add(object)

    this.gltfObject = object

    this.update()

    this.component.invalidate()

    // if (animations && animations.length) {
    //   for (var i = 0; i < animations.length; i++) {
    //     var animation = animations[i]
    //     var action = this._visualizer.mixer.clipAction(animation)
    //     action.play()
    //   }
    // }
  }

  clear() {
    // gltf object 리소스 해제가 필요하면, 여기에 추가.

    super.clear()
  }

  rebuild() {
    this.clear();
    this.build()
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

    /* component 자체의 scale도 별도의 의미가 있으므로, dimension은 하위 gltfObject의 scale로 조절한다. */
    this.gltfObject.scale.set(width / x, depth / y, height / z)
  }

}

export default class Gltf extends Component {
  buildObject3D() {
    return new ObjectGltf(this)
  }

  /* url 이 바뀐 경우에는 rebuild 한다. */
  onchangeurl(after, before) {
    (this.object3D as ObjectGltf).rebuild()
  }
}

Component.register('gltf', Gltf)

