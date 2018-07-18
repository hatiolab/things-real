/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from '../component'

var components = new WeakMap();
var count = 0;

export default {
  get residents(): Object {
    return components;
  },

  put(component: Component): void {
    components.set(component, count++);
  }
}
