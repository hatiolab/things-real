/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Class } from '../../types'

var registry = {};

export default {
  register(type: string, clazz: Class): Class {
    if (!clazz)
      return registry[type]
    registry[type] = clazz
    return clazz;
  }
}
