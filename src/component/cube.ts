/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import ObjectCube from './threed/object-cube'

export default class Cube extends Component {
  buildObject3D() {
    return new ObjectCube(this)
  }
}

Component.register('cube', Cube)

