/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { ComponentModel } from '../../types'
import Component from '../component'
// import Container from '../container'
import { warn } from '../../util/logger'

export function compile(model: ComponentModel): Component {

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

    /* 모델이 컴파일된 후에는 각 컴포넌트의 속성 모델에서 하위 컴포넌트 정보는 불필요해지므로, 삭제한다. */
    delete model.components;
  }

  component.created();

  return component
}
