/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Class } from '../../types'

var registry: { [key: string]: Class } = {}

export default {
  register(type: string, clazz: Class): Class {
    if (!clazz)
      return registry[type]
    registry[type] = clazz
    return clazz;
  },

  clazz(classname) {
    return Object.values(registry).find(clazz => {
      return clazz.prototype.constructor.name == classname
    })
  }
}
