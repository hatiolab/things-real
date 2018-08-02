/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import { Dimension } from '../types'
import AbstractRealObject from './threed/abstract-real-object'
import * as T from 'three'
const THREE: any = T

import 'imports-loader?THREE=three!three/examples/js/loaders/GLTFLoader'

class ObjectGltf extends AbstractRealObject {

  private static _GLTFLoader = new THREE.GLTFLoader()

  static get GLTFLoader() {
    return ObjectGltf._GLTFLoader
  }

  build() {
    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || { width: 1, height: 1, depth: 1 }

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
    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || { width: 1, height: 1, depth: 1 }

    let scene = gltf.scene
    let animations = gltf.animations

    this.type = 'gltf-object'

    var object = scene.clone()

    var boundingBox = new THREE.Box3().setFromObject(object)
    var center = boundingBox.getCenter(object.position)
    var size = boundingBox.getSize(new THREE.Vector3())

    center.multiplyScalar(-1)

    object.updateMatrix()

    this.add(object)
    this.scale.set(width / size.x, depth / size.y, height / size.z)

    // if (animations && animations.length) {
    //   for (var i = 0; i < animations.length; i++) {
    //     var animation = animations[i]
    //     var action = this._visualizer.mixer.clipAction(animation)
    //     action.play()
    //   }
    // }
  }

}

export default class Gltf extends Component {
  buildObject3D() {
    return new ObjectGltf(this)
  }
}

Component.register('gltf', Gltf)

