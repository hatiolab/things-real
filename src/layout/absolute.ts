/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Layout from './layout'

/* 대상 컴포넌트의 bounds를 계산한다. */
var AbsoluteLayout = {
  reflow: function(container, component) {},

  capturables: function(container) {
    return container.components
  },

  drawables: function(container) {
    return container.components.filter(c => !c.hidden)
  },

  isStuck: function(component) {
    return false
  },

  ABSOLUTE: true
}

Layout.register('absolute', AbsoluteLayout)

export default AbsoluteLayout
