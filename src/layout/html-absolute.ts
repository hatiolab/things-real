/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Layout from './layout'

/* 대상 컴포넌트의 bounds를 계산한다. */
var HTMLAbsoluteLayout = {
  reflow: function (container, component) {
    var components = this.drawables(container)

    components.filter(component => component.isHTMLElement()).forEach(component => component.reposition())
  },

  capturables: function (container) {
    return container.components
  },

  drawables: function (container) {
    return container.components.filter(c => !c.hidden)
  },

  isStuck: function (component) {
    return false
  },

  ABSOLUTE: true
}

Layout.register('html-absolute', HTMLAbsoluteLayout)

export default HTMLAbsoluteLayout
