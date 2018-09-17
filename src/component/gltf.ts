/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import RealObjectGLTF from './threed/real-object-gltf'

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
    return new RealObjectGLTF(this)
  }

  /* url 이 바뀐 경우에는 rebuild 한다. */
  onchangeurl(after, before) {
    this.update()
  }
}

Component.register(Gltf.type, Gltf)

