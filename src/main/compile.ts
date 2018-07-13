/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { ComponentModel } from '../types'
import { Component } from '../component'
import { warn } from '../util/logger'

export default function compile(model: ComponentModel): Component {

  var clazz = Component.register(model.type)

  if (!clazz) {
    warn("Class not found", model.type);
    return null;
  }

  var component = new clazz(model);

  if (model.components && component.isContainer) {
    model.components.forEach(m => {
      var child_component = compile(m);
      if (child_component)
        component.addComponent(child_component)
    });
  }

  component.created();

  return component
}
