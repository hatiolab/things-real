/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import './components'
import Component3D from './component-3d'
import Canvas2DShape from './components/canvas2d-shape'

export default class ObjectBuilder {
  static build(component) {
    if (component.isRootModel()) {
      return component.scene;
    }

    var clazz = Component3D.register(component.model.type);

    if (clazz) {
      return new clazz(component);
    } else {
      return new Canvas2DShape(component);
    }
  }
}