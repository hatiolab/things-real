/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import RealObjectText from './threed/real-object-text'

export default class Text extends Component {

  static get type() {
    return 'text'
  }

  buildObject3D() {
    return new RealObjectText(this)
  }

  get hasTextProperty() {
    return true
  }
}

Component.register(Text.type, Text)

